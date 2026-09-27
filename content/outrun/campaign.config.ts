export const brand = 'Outrun Extinction';

export const siteUrl = 'https://outrun.junaid.guru';

export const defaultLocale = 'en';

export const mediaBase = 'https://storage.googleapis.com/firebase-cloud-491613-outrun-media/v1';

export const logo = { kind: 'component' } as const;

export const background = {
    landscape: 'background_concept.webp',
    portrait: 'background_concept_portrait.webp',
};

export const social = {
    image: 'social.jpg',
};

export const models = [
    { frames: '360/solo', id: 'Solo' },
    { frames: '360/coalition', id: 'Coalition' },
    { frames: '360/guardian', id: 'Guardian' },
];

export const defaultModel = 'Solo';
