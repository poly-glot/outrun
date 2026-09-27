export const brand = 'Paws & Pace';

export const siteUrl = 'https://outrun.junaid.guru';

export const defaultLocale = 'en';

export const mediaBase = '/media';

export const logo = {
    kind: 'svg',
    markup: '<svg viewBox="0 0 260 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="currentColor"><ellipse cx="30" cy="40" rx="14" ry="11"/><ellipse cx="11" cy="24" rx="6" ry="8" transform="rotate(-20 11 24)"/><ellipse cx="25" cy="15" rx="6" ry="8" transform="rotate(-7 25 15)"/><ellipse cx="40" cy="16" rx="6" ry="8" transform="rotate(8 40 16)"/><ellipse cx="53" cy="26" rx="6" ry="8" transform="rotate(24 53 26)"/><text x="66" y="42" font-size="24" font-weight="700" letter-spacing="1">PAWS &amp; PACE</text></g></svg>',
} as const;

export const background = {
    landscape: 'background_concept.webp',
    portrait: 'background_concept_portrait.webp',
};

export const social = {
    image: 'social.jpg',
};

export const models = [
    { frames: '360/solo', id: 'Stride' },
    { frames: '360/coalition', id: 'Pack' },
    { frames: '360/guardian', id: 'Patron' },
];

export const defaultModel = 'Stride';
