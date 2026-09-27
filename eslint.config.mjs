import nextConfig from 'eslint-config-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const LIB_IMPORT_MSG = 'lib/ is infrastructure: it never imports app/, campaigns/, components/, mdx/, sections/ or state/.';
const CAMPAIGN_IMPORT_MSG = 'Campaign code reaches the page through the registry: it may use components/ and lib/, never app/, mdx/, sections/ or state/.';
const MDX_IMPORT_MSG = 'mdx/ loads and reads content: it imports nothing from app/, campaigns/, components/, lib/, sections/ or state/.';
const COMPONENT_IMPORT_MSG = 'A component never imports app/ or a section; a part two sections share moves to components/.';
const SECTION_IMPORT_MSG = 'A section never imports app/.';
const MOTION_IMPORT_MSG = 'Render m.* elements, never motion.*: the full motion component bundles drag and layout features the site never uses, and MotionFeatures loads the ones it does.';

const config = [
    ...nextConfig,
    { files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'], rules: { ...jsxA11y.flatConfigs.recommended.rules, 'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['region', 'tabpanel'] }] } },
    { ignores: ['.next/**', 'node_modules/**'] },
    {
        files: ['src/lib/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', { patterns: [{ group: ['@campaigns', '@/app/**', '@/components/**', '@/mdx/**', '@/sections/**', '@/state/**'], message: LIB_IMPORT_MSG }] }],
        },
    },
    {
        files: ['campaigns/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', { patterns: [{ group: ['@/app/**', '@/mdx/**', '@/sections/**', '@/state/**'], message: CAMPAIGN_IMPORT_MSG }] }],
        },
    },
    {
        files: ['src/mdx/**/*.ts'],
        rules: {
            'no-restricted-imports': ['error', { patterns: [{ group: ['@campaigns', '@/app/**', '@/components/**', '@/lib/**', '@/sections/**', '@/state/**'], message: MDX_IMPORT_MSG }] }],
        },
    },
    {
        files: ['src/components/**/*.tsx'],
        rules: {
            'no-restricted-imports': ['error', { patterns: [{ group: ['@/app/**', '@/sections/**'], message: COMPONENT_IMPORT_MSG }] }],
        },
    },
    {
        files: ['src/sections/**/*.tsx'],
        rules: {
            'no-restricted-imports': ['error', { patterns: [{ group: ['@/app/**'], message: SECTION_IMPORT_MSG }] }],
        },
    },
    {
        files: ['src/**/*.{ts,tsx}', 'campaigns/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': ['error', { message: MOTION_IMPORT_MSG, selector: "ImportDeclaration[source.value='framer-motion'] > ImportSpecifier[imported.name='motion']" }],
        },
    },
];

export default config;
