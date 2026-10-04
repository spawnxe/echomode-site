/**
 * The canvas controller — WIDE's behaviour, applied to Echomode.
 *
 * Ten cards exist once in the DOM. Five compositions re-place them by writing
 * --l/--w/--t/--h (vw / %), and CSS transitions do the morphing. Leaving cards
 * mask out (clip-path) before the move; arriving cards mask in from the top.
 * Text sits in masks and slides 120%. There is no document scroll: wheel,
 * trackpad, swipe, arrows, keys and the 01–05 buttons all step compositions.
 */

type Geometry = { l: string; w: string; t: string; h: string };
type Layout = { large: string; caps: boolean; place: Record<string, Geometry> };
type CompId = '1' | '2' | '3' | '4' | '5';

const IDS: CompId[] = ['1', '2', '3', '4', '5'];
const MOBILE = '(max-width: 860px)';
const EXIT_LEAD = 450;     // ms: captions and leaving cards exit before the move
const DUR = 1500;          // ms: matches --dur
const WHEEL_GESTURE_GAP = 220; // ms of silence that separates two wheel gestures
const WHEEL_THRESHOLD = 40;    // accumulated deltaY before a gesture counts
const SWIPE_THRESHOLD = 50;    // px

export class EchomodeCanvas {
  private root: HTMLElement;
  private canvas: HTMLElement;
  private items: Record<string, HTMLElement> = {};
  private navBtns: NodeListOf<HTMLElement>;
  private visBlocks: NodeListOf<HTMLElement>;
  private idx: HTMLElement | null;

  private readonly G = 1.3;            // gap, vw
  private readonly CW = 100 - 2 * 1.35; // canvas width, vw
  private layouts: Record<string, Layout>;
  private cur: CompId | null = null;
  private mirror = 0;
  private lock = false;

  // parallax
  private px = 0; private py = 0; private tx = 0; private ty = 0; private raf = 0;
  // wheel
  private acc = 0; private lastW = 0; private armed = true;
  // touch
  private ts: { x: number; y: number } | null = null;

  private mobile() { return window.matchMedia(MOBILE).matches; }

  constructor(root: HTMLElement) {
    this.root = root;
    this.canvas = root.querySelector('.canvas') as HTMLElement;
    root.querySelectorAll<HTMLElement>('.item').forEach((el) => { this.items[el.dataset.id!] = el; });
    this.navBtns = root.querySelectorAll<HTMLElement>('.topbar .nw');
    this.visBlocks = root.querySelectorAll<HTMLElement>('.text .vis');
    this.idx = root.querySelector('#em-idx');
    this.layouts = this.buildLayouts();

    // Intro: cards come in masked, from the bottom, column-staggered from the large card
    Object.values(this.items).forEach((el) => el.classList.add('hidden'));
    this.apply('1', true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.canvas.classList.remove('no-anim');
      this.revealAll('1');
    }));

    this.bind();
  }

  // ---------------------------------------------------------------- input
  private bind() {
    // 01–05 and the arrows (event delegation)
    this.root.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-go],[data-step]');
      if (!t) return;
      e.preventDefault();
      if (t.dataset.go) this.go(t.dataset.go as CompId);
      else this.step(Number(t.dataset.step), true);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); this.step(1, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); this.step(-1, true); }
      else if (e.key === 'm' || e.key === 'M') this.toggleMirror();
    });

    // cursor parallax on the large card's field only (WIDE: amount .04, ease .05)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !this.mobile()) {
      window.addEventListener('mousemove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        this.tx = -nx * 0.04; this.ty = -ny * 0.04;
        if (!this.raf) this.raf = requestAnimationFrame(this.tick);
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      this.layouts = this.buildLayouts();
      this.canvas.classList.add('no-anim');
      if (this.cur) this.apply(this.cur, true);
      requestAnimationFrame(() => this.canvas.classList.remove('no-anim'));
    });

    // wheel / trackpad: one step per gesture; inertia and in-transition events are ignored
    window.addEventListener('wheel', (e) => {
      if (this.mobile()) return;
      e.preventDefault();
      const now = performance.now();
      const gap = now - this.lastW; this.lastW = now;
      if (gap > WHEEL_GESTURE_GAP) { this.acc = 0; this.armed = true; }
      if (!this.armed || this.lock) return;
      this.acc += e.deltaY;
      if (Math.abs(this.acc) > WHEEL_THRESHOLD) { this.step(this.acc > 0 ? 1 : -1); this.acc = 0; this.armed = false; }
    }, { passive: false });

    // touch swipe, either axis
    window.addEventListener('touchstart', (e) => { const t = e.touches[0]; this.ts = { x: t.clientX, y: t.clientY }; }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (!this.ts || this.mobile()) { this.ts = null; return; }
      const t = e.changedTouches[0]; const dx = t.clientX - this.ts.x, dy = t.clientY - this.ts.y;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > SWIPE_THRESHOLD && !this.lock) this.step(d < 0 ? 1 : -1);
      this.ts = null;
    }, { passive: true });
  }

  private tick = () => {
    this.px += (this.tx - this.px) * 0.05; this.py += (this.ty - this.py) * 0.05;
    const L = this.cur ? this.layouts[this.cur] : null;
    const large = L ? this.items[L.large] : null;
    if (large) {
      const inner = large.querySelector<HTMLElement>('.inner:not(.cover)');
      if (inner) inner.style.transform = `scale(1.1) translate(${this.px * 100}%, ${this.py * 100}%)`;
    }
    if (Math.abs(this.tx - this.px) > 0.0004 || Math.abs(this.ty - this.py) > 0.0004) this.raf = requestAnimationFrame(this.tick);
    else this.raf = 0;
  };

  // ---------------------------------------------------------------- layouts
  /** WIDE BASE_LAYOUTS resolved to vw/vh. Small card ratio 2.35:3, 30% of an 82vh canvas. */
  private buildLayouts(): Record<string, Layout> {
    const G = this.G, CW = this.CW;
    const vh = window.innerHeight / 100, vw = window.innerWidth / 100;
    const cardH = 82 * 0.30;                       // vh
    const cardW = (cardH * vh) * (2.35 / 3) / vw;  // vw
    type Col = { x: number; w: number };
    const cols = (ws: number[]): Col[] => { let x = 0; return ws.map((w) => { const c = { x, w }; x += w + G; return c; }); };
    const eq = (CW - 40 - 4 * cardW - 6 * G) / 2;
    const c1 = cols([40, eq, cardW, cardW, cardW, cardW, eq]);
    const c2 = cols([40, 23.3, 15, 15]);
    const c3 = cols([40, 14.6, 14.6, 15, CW - 40 - 14.6 - 14.6 - 15 - 4 * G]);
    const c4 = cols([40, 33.3, CW - 40 - 33.3 - 2 * G]);
    const c5 = cols([40, 14.6, 15, CW - 40 - 14.6 - 15 - 3 * G]);
    const H = 100;
    const g = (c: Col, t: string, h: string): Geometry => ({ l: c.x + 'vw', w: c.w + 'vw', t, h });
    const small = (c: Col, y: 'top' | 'bot') => g(c, (y === 'top' ? 0 : H - 30) + '%', '30%');
    const full = (c: Col) => g(c, '0%', '100%');
    const stackH = (15 * vw) * (3 / 2.35) / vh / 82 * 100; // % height of a 15vw-wide 2.35:3 card
    const stack = (c: Col, y: 'top' | 'bot') => g(c, (y === 'top' ? 0 : H - stackH) + '%', stackH + '%');
    return {
      '1': { large: 'A', caps: false, place: { A: full(c1[0]), B: small(c1[2], 'top'), C: small(c1[3], 'top'), D: small(c1[4], 'top'), E: small(c1[5], 'top'), F: small(c1[2], 'bot'), G: small(c1[3], 'bot'), H: small(c1[4], 'bot'), I: small(c1[5], 'bot') } },
      '2': { large: 'A', caps: false, place: { A: full(c2[0]), D: stack(c2[2], 'top'), H: stack(c2[2], 'bot'), E: stack(c2[3], 'top'), I: stack(c2[3], 'bot') } },
      '3': { large: 'H', caps: true, place: { H: full(c3[0]), B: g(c3[1], '0%', '46%'), C: g(c3[1], '54%', '46%'), D: g(c3[2], '0%', '46%'), E: g(c3[2], '54%', '46%') } },
      '4': { large: 'F', caps: true, place: { F: full(c4[0]), H: g(c4[1], '0%', '80%'), E: g(c4[2], '0%', '60%') } },
      '5': { large: 'K', caps: true, place: { K: full(c5[0]), B: g(c5[1], '0%', '38%'), C: g(c5[1], '62%', '38%'), I: g(c5[2], '31%', '38%') } },
    };
  }

  /** Mirror state: columns reversed, l' = CW − l − w */
  private mirrorPlace(p: Record<string, Geometry>): Record<string, Geometry> {
    const out: Record<string, Geometry> = {};
    for (const [id, geo] of Object.entries(p)) {
      out[id] = { ...geo, l: (this.CW - parseFloat(geo.l) - parseFloat(geo.w)) + 'vw' };
    }
    return out;
  }

  // ---------------------------------------------------------------- state
  private apply(id: CompId, instant: boolean) {
    const L = this.layouts[id]; if (!L) return;
    const place = this.mirror ? this.mirrorPlace(L.place) : L.place;
    if (instant) this.canvas.classList.add('no-anim');
    for (const [key, el] of Object.entries(this.items)) {
      const geo = place[key];
      el.classList.toggle('large', key === L.large);
      el.classList.toggle('caps-off', !L.caps && key !== L.large);
      if (geo) {
        el.style.setProperty('--l', geo.l); el.style.setProperty('--w', geo.w);
        el.style.setProperty('--t', geo.t); el.style.setProperty('--h', geo.h);
        el.classList.add('on');
      } else {
        el.classList.add('hidden');
      }
    }
    this.visBlocks.forEach((b) => b.classList.toggle('on', b.dataset.for === id));
    this.navBtns.forEach((b) => b.classList.toggle('on', b.dataset.go === id));
    if (this.idx) this.idx.textContent = '0' + id;
    this.cur = id;
    this.canvas.dataset.mirror = this.mirror ? '1' : '0';
    this.canvas.dataset.l = id;
  }

  private revealAll(id: CompId) {
    const L = this.layouts[id]; const place = L.place;
    const largeX = parseFloat(place[L.large].l);
    Object.entries(this.items).forEach(([key, el]) => {
      const geo = place[key]; if (!geo) return;
      const dist = Math.abs(parseFloat(geo.l) - largeX) / 14; // ~columns away (WIDE stagger .02s/col)
      el.style.transitionDelay = (dist * 0.02) + 's';
      (el.querySelector('.img') as HTMLElement).style.transitionDelay = (dist * 0.02 + 0.1) + 's';
      requestAnimationFrame(() => { el.classList.remove('hidden'); el.classList.remove('from-top'); });
      const cap = el.querySelector('.cap'); if (cap) { cap.classList.remove('hide'); cap.classList.add('show'); }
    });
  }

  go(id: CompId) {
    if (this.lock || id === this.cur || !this.layouts[id]) return;
    this.lock = true;
    const prevL = this.cur ? this.layouts[this.cur] : null; const nextL = this.layouts[id];
    // phase out: captions exit; cards not in the next layout mask out
    Object.entries(this.items).forEach(([key, el]) => {
      const cap = el.querySelector('.cap');
      if (cap) { cap.classList.remove('show'); cap.classList.add('hide'); }
      if (!nextL.place[key]) el.classList.add('hidden');
    });
    this.visBlocks.forEach((b) => b.classList.remove('on'));
    // phase in: after the exit lead, move / appear
    window.setTimeout(() => {
      Object.entries(this.items).forEach(([key, el]) => {
        if (nextL.place[key] && !(prevL && prevL.place[key])) { el.classList.add('from-top'); el.classList.add('on'); }
      });
      this.apply(id, false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        Object.entries(this.items).forEach(([key, el]) => {
          if (!nextL.place[key]) { el.classList.remove('on'); return; }
          el.classList.remove('hidden'); el.classList.remove('from-top');
          const cap = el.querySelector<HTMLElement>('.cap');
          if (cap) { cap.classList.remove('hide'); void cap.offsetWidth; cap.classList.add('show'); }
        });
      }));
      window.setTimeout(() => { this.lock = false; }, DUR + 60);
    }, EXIT_LEAD);
  }

  /** Move d compositions. Buttons/keys wrap; scroll and swipe stop at the ends. */
  step(d: number, wrap = false) {
    if (!this.cur) return;
    const i = IDS.indexOf(this.cur); let j = i + d;
    if (wrap) j = (j + IDS.length) % IDS.length;
    if (j < 0 || j >= IDS.length) return;
    this.go(IDS[j]);
  }

  toggleMirror() {
    if (this.lock || !this.cur) return;
    this.mirror = this.mirror ? 0 : 1;
    this.apply(this.cur, false);
  }
}
