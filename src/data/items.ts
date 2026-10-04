/**
 * The ten cards on the canvas. They are created once; compositions only re-place them
 * (see src/scripts/canvas.ts → buildLayouts). IDs match WIDE's A–K naming.
 *
 * field  — the artefact without typography; shown in small cards and under the cover
 * cover  — the full artefact with its own type; fades in only when the card is large
 * pos    — background-position for the field (where the image anchors when cropped)
 */
import type { ImageMetadata } from 'astro';

import fieldA from '../assets/fields/A.jpg';
import fieldB from '../assets/fields/B.jpg';
import fieldC from '../assets/fields/C.jpg';
import fieldD from '../assets/fields/D.jpg';
import fieldE from '../assets/fields/E.jpg';
import fieldK from '../assets/fields/K.jpg';
import coverA from '../assets/covers/A.jpg';
import coverB from '../assets/covers/B.jpg';
import coverC from '../assets/covers/C.jpg';
import coverD from '../assets/covers/D.jpg';
import coverE from '../assets/covers/E.jpg';

export type Item = {
  id: string;
  href: string;
  /** '1' = the logotype reveals when this card is large; '0' = never */
  mark?: '1' | '0';
  field: ImageMetadata;
  pos?: string;
  cover?: ImageMetadata;
  title: string;
  sub: string;
  meta: string;
};

export const items: Item[] = [
  { id: 'A', href: '#contact', mark: '1', field: fieldK, pos: '50% 50%', title: 'Repetition without loss', sub: 'Echomode — Vol. 01', meta: '29.09.2026' },
  { id: 'B', href: '#contact', field: fieldB, pos: '55% 50%', cover: coverB, title: 'Aged Care Navigator', sub: 'Kinyara Health', meta: '2026' },
  { id: 'C', href: '#contact', field: fieldC, pos: '50% 50%', cover: coverC, title: 'Our Promise handbook', sub: 'Kinyara Health', meta: '2026' },
  { id: 'D', href: '#contact', field: fieldD, pos: '50% 50%', cover: coverD, title: 'Client strategy graphics', sub: 'Kanda Care', meta: '2026' },
  { id: 'E', href: '#contact', field: fieldE, pos: '50% 30%', cover: coverE, title: 'Template governance tool', sub: 'Echomode Lab', meta: '2026 —' },
  { id: 'F', href: '#method', field: fieldA, pos: '50% 30%', title: 'Systems', sub: 'Tokens · Components · Templates', meta: '/01' },
  { id: 'G', href: '#method', field: fieldC, pos: '50% 50%', title: 'Method', sub: 'Audit · Build · Govern', meta: '/02' },
  { id: 'H', href: '#method', field: fieldE, pos: '50% 55%', title: 'Tools', sub: 'AI-assisted · Drift detection', meta: '/03' },
  { id: 'I', href: '#contact', field: fieldD, pos: '45% 50%', title: 'Start a project', sub: 'hello@echomode.studio', meta: '→' },
  { id: 'K', href: '#contact', mark: '0', field: fieldA, pos: '50% 0%', cover: coverA, title: 'Master template system', sub: 'Kinyara Health — Brand system', meta: '2026' },
];
