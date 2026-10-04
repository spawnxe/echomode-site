/**
 * Copy for the five compositions. The text layer renders one block per composition;
 * the controller shows the block whose data-for matches the current composition.
 *
 * `body` is HTML (spans for dimmed phrases, a mailto link in 05).
 */
export type Composition = {
  id: '1' | '2' | '3' | '4' | '5';
  label: string;
  statement: string;
  body: string;
};

export const compositions: Composition[] = [
  {
    id: '1',
    label: 'Enjoy',
    statement: 'Repeat without drift. Design systems built for the hands that use them.',
    body: 'Most of your brand happens without you. <span class="dim">We design for that.</span>',
  },
  {
    id: '2',
    label: 'Thesis',
    statement: 'Most of your brand happens without you. We design for that.',
    body: 'Your visual system will be used by people who didn’t design it. Every reproduction is a chance to drift. <span class="dim">We build the system so it doesn’t.</span>',
  },
  {
    id: '3',
    label: 'Method',
    statement: 'One source. Every hand. Systems, method and tools — built in that order.',
    body: 'Audit how the brand is really used. Build for those hands. Govern it so it stays true after the handover. <span class="dim">Then tools that catch drift before it ships.</span>',
  },
  {
    id: '4',
    label: 'Work',
    statement: 'Systems in other hands. Brand and design systems that stay themselves when reproduced.',
    body: 'Kinyara Health · Kanda Care · Echomode Lab. <span class="dim">Case studies on request.</span>',
  },
  {
    id: '5',
    label: 'Contact',
    statement: 'Tell us where your brand gets reproduced, and by whom. We’ll show you where it drifts.',
    body:
      '<a href="mailto:hello@echomode.studio?subject=New%20project">hello@echomode.studio ↗</a><br>' +
      '<span class="dim">ECHOMODE LTD · Registered in [England and Wales] · Co. no. [00000000]</span>',
  },
];

export const site = {
  name: 'Echomode',
  title: 'Echomode — Design systems studio',
  description:
    'Echomode is a design systems studio. Brand and design systems, method and AI-assisted tools that keep a brand itself when it is reproduced by other hands.',
  tagline: 'Repeat without drift',
  year: '’26',
  email: 'hello@echomode.studio',
};
