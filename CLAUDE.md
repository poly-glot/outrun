# Outrun Extinction: multi-campaign site

The campaign platform that began as the Outrun Extinction page, a UK run series for cheetah conservation, rebuilt from
the 2018 Cat excavator site. One statically exported build hosts every campaign: each URL is
`/<campaign>/<locale>[/<page>]`, a campaign is `content/<campaign>/` (copy, config, media manifest) plus an optional
`campaigns/<campaign>/` (the code it may own: a logo component, a `next/font` face, quiz rules, a `theme.css` of token
overrides scoped by `[data-campaign]`), registered in `src/mdx/campaign.ts` (config) and `campaigns/index.ts` (code).
`outrun` is the founding campaign; `pace` (Paws & Pace) proves the machinery with one locale, an inline-SVG logo and
its own brand tokens. Next.js 16 App Router, React 19, TypeScript strict, CSS Modules, `framer-motion`
for every animation, and MDX for every page. `npm run dev` serves it on port 3010 (3000 is taken by another
project's container on the dev machine); `npm run build` exports it to `out/` (`output: 'export'`), and `npm start`
serves `out/` on the same port with clean URLs, as Firebase Hosting does in production at `https://outrun.junaid.guru`
(`firebase.json`, site `outrun`, deployed by `.github/workflows/deploy.yml`). A static export has no image optimizer,
so `images.unoptimized` is set and every picture is already WebP at the size the page shows. `agentRules: false` stops
`next dev` appending its managed agent block to this file whenever it detects an AI agent. Node 24 (`.nvmrc`). The
site reads no environment variables: the canonical URL is `siteUrl` in each `content/<campaign>/campaign.config.ts`, and there is no
analytics and no cookie; analytics returns only behind an Accept and Decline choice with a cookie policy page.
A change is checked by opening the page in Chrome and by `npm run check`, and it is not done until
`npm run check` is green, `npm run a11y` passes (no serious or critical axe violation, every journey ok), and the five-minute manual
script has been run: Tab through the header, open and close the menu and the dialog by keyboard, read the Strength
section with VoiceOver from the top of the page, check the German labels. The accessibility owner is the site owner,
Junaid Ahmed, and the published statement is `/<campaign>/<locale>/accessibility`.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Next dev server on 3010 |
| `npm run check` | `typecheck`, `lint`, `test`, in that order; the gate |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .`, including the import-direction rules below |
| `npm test` | `node --test` over `src/**/*.test.ts` and `campaigns/**/*.test.ts`, no framework |
| `npm run build` / `npm start` | Static export to `out/`, then `serve` over it on 3010 with clean URLs, as Firebase serves it |
| `npm run a11y` | Against a running server (`A11Y_URL`, default `http://localhost:3010`): `scripts/a11y.mjs` runs axe over every page at desktop and phone width, then drives the keyboard journeys and measurements listed under _Accessibility_; the CI step and part of the definition of done |

## Content

Every page is an MDX file under `content/<campaign>/<locale>/`, compiled by `@next/mdx`, and every URL is a
file: `content/outrun/en/index.mdx` is `/outrun/en`, `content/outrun/en/roadshow.mdx` is `/outrun/en/roadshow`, and a
new locale folder `content/outrun/fr/` lights up `/outrun/fr` with no code change: routes, hreflang alternates and the
a11y page list are all walked from the content tree, and a campaign with one locale simply hides the switcher. A new
campaign is a `content/<name>/` folder plus its entries in `src/mdx/campaign.ts` and `campaigns/index.ts`, which fails
the build loudly when either is missing. `/`, `/<campaign>` and the pre-campaign `/en` and `/de` URLs all redirect in
`firebase.json`. `content/<campaign>/campaign.config.ts` holds the campaign's non-copy data, with no runtime imports:
the brand name (the logo link's accessible name), site URL, default locale, `mediaBase`, the logo (`component` from
the registry, inline `svg` markup, or an `image` URL), the models and their 360 frame folders, the site background and
the social meta. The site background is the campaign still
`background_concept.webp` (the supplied cheetah image mirrored so the cheetah sits right of the copy facing it, at 2560
wide) and `background_concept_portrait.webp`, the square crop from the source's left edge mirrored the same way, which
keeps the cheetah in the phone and tablet slots. `social.jpg`, the share card, is the same background at
1200×630: `magick background_concept.webp -gravity South -crop 2560x1344+0+0 +repage -resize 1200x630 social.jpg`,
the full width so the cheetah on the right stays in, with the trim taken from the sky. A page exports one `meta` object (its
title and description); everything else in the file is Markdown with components, never frontmatter.

`content/<campaign>/<locale>/site.mdx` is the locale's shell: an exported `strings` object (every label,
hint and status string a component renders) and the `<Footer>` as Markdown lists. The page
template loads it beside the page, and loads `roadshow.mdx` into the contact modal when it exists.

The components an author may use are the ones registered in `src/mdx-components.tsx`, one folder per
name under `src/sections/`, whose `<Name>.tsx` is the tag. A section is a top-level component with an
`id` and a `menu` label; the side menu is built by walking the page for exactly those two props, so a
section is listed once, where it is written, and the `menu` label is also the section's accessible name. Copy stays
Markdown inside the component (headings, paragraphs, `**bold**`, lists) and a line break inside a heading is `<br />`.
The page has one outline: `#` is the page heading and only the Hero writes it, `##` is a section heading, `###` a
card or fact heading, and `####` is the Roadshow kicker, which renders as a paragraph. Headings, menu labels and
quick-fact labels are written in sentence case and CSS uppercases them where the design shouts, so a screen reader
reads words rather than initialisms and the section names announce naturally. Presentation that is not
copy is a prop: `theme`, `layout`,
`backgroundColor`, image file names (relative to `public/media/`, raw names with spaces
are fine), a YouTube id for a feature video, a list of hero encodes, a folder to list.

| Component | Writes | Takes |
| --- | --- | --- |
| `<Hero>` | The full-viewport opener: the still, then a muted looping HTML5 video that fades in over it once the page has settled and pauses while scrolled away. `video` and `mobileVideo` are comma lists of encodes, best first, named `<name>.av1.mp4` or `<name>.h264.mp4` so the browser can pick by codec; `scripts/hero-video.sh <source>` produces all four from a master without dropping a frame, a `<name>.poster.webp` first frame of each set that the video shows while it buffers, and the two first-frame stills the page paints before the video mounts | `image`, `mobileImage` (optional), `video`, `mobileVideo`, `scrollTo`, `scrollText` |
| `<Welcome>` | Text column over the fixed background; `<More>word</More>` draws the scroll-linked underline | `mobileImage` |
| `<Strength>` | Text column with `<Charts>` of `<Chart value>` (its label is the child text), `<Savings heading>` of `<Saving icon value unit sticker>`, and a `<Note>` | `icon` names come from `content/icons.ts` |
| `<Roadshow>` | A band with `layout="normalPage"`: right-aligned text beside an image kept whole at the left edge (`contain`), at least half a viewport tall and taller when the copy needs it; `####` is the yellow kicker, the CTA follows the last paragraph | `image`, `mobileImage`, `cta` |
| `<Raising>` | The sticky scene: a portrait clip on the left that the scroll plays, its current time following the section from the moment the pane sticks to the moment it leaves; the `##` heading and first paragraph scrub in at the top right, line by line then word by word, and the `<Fact icon>` blocks, each `### heading` plus a paragraph, arrive as one column anchored to the bottom beside the clip. The clip takes 45% of the pane, 40% below 1366px where the intro narrows to 260px so the column has room. `scripts/raising-video.sh <source> [out]` encodes a 1080×1920 clip as `miles.h264.mp4`, a 4:5 crop with every frame a keyframe so any seek decodes one frame, plus `miles.webp`, its first frame, which is the poster and the stacked layout's image. `Clip` springs toward the scroll target, rounds to frame times and holds the next seek until the last one has landed, which is what keeps the scrub smooth | `video` (one H.264 encode), `mobileImage` |
| `<Decision>` | The quiz: a `##` heading, an intro paragraph, then `<Question id text>` of `<Option id>label</Option>`; the answers feed `src/rules/recommendation.ts` | `recommendLabel`, `defaultLabel` |
| `<Technical>` | The model bar, a `<ModelText model>` per model, and `<QuickFact icon label values>` rows | `factsHeading`, `defaultLabel` |
| `<Features>` | A `##` heading and a card grid of `<Feature image models video>`, each a `###` heading plus a paragraph; `models` is the comma list of models that offer it | |
| `<Media>` | Heading and text over the gallery listed from `folder/preview`, `folder/thumbnails` and `folder/full` | `folder`, `downloadText` |
| `<Events>` | The roadshow page and the contact modal: intro paragraphs, then `<Country name>` blocks whose list items are `[City](link) date` | `title`, `eventsHeading` |
| `<Footer>` | Four `<Column>` blocks of `### Heading` (optionally a link) and lists, a link's title `"fb"` picks a social icon, then `<Legal>` | `copyright`, `location`, `locationHref` |
| `<Statement>` | A standalone page with no menu section: the author's `#` heading, `##` headings and lists on a white, black-text article, styled by the global rules. The article is positioned at `z-index: 2`, like every `Section`, because the site-wide fixed background is positioned too and paints over anything left in normal flow, which hid the whole statement on desktop until `headingOnTop` began checking it | (none; wraps its Markdown children) |

A component that needs its Markdown as data (words to scrub, options to answer, links to lay out)
reads it on the server from the element tree with the helpers in `src/mdx/nodes.ts` (`ofType`,
`textOf`, `linesOf`), and hands plain data to the client section. Folder listings (`listFrames`,
`listGallery`) and `mediaUrl`, which prefixes the campaign's `mediaBase` and encodes each path segment so a file name
with spaces or colons is still a valid URL, live in `src/mdx/media.ts` and run at build time only. They read the
campaign's checked-in `content/<campaign>/media.manifest.json`, regenerated by `node scripts/media-manifest.mjs
<campaign>`, never the filesystem or a bucket listing, so the build is deterministic; a test verifies every manifest
entry exists under `public/media`. Every campaign's `mediaBase` is the public bucket
`firebase-cloud-491613-outrun-media` under a version prefix: `scripts/media-upload.sh <version>` uploads
`public/media` there with a year-long immutable `Cache-Control`, so a changed file means a new version prefix and a
`mediaBase` bump, never an overwrite. Hosting ignores `media/**`, and the pages, dev included, load media from the
bucket. `public/media` is a gitignored, local-only staging tree, never committed: the Pixabay Content License forbids
distributing content on a standalone basis, which a public repo of the original files would be, and the same rule is
why the gallery offers no zip of the originals. The media-existence tests skip where the staging tree is absent, as
on CI. `listGallery`
lists the full-size JPEG downloads and pairs each with its WebP preview and thumbnail. The section tags run without
route params, so the current campaign is request-scoped: layout, page and `generateMetadata` call `setCampaign` and
`media.ts`/`models.ts` read it through a React `cache()` holder in `src/mdx/campaign.ts`, which stays correct while
static pages generate in parallel where a module-level variable would bleed between interleaved renders.

## Layout

Files are organised by feature, never by kind, and a file's stylesheet always sits beside it with the
same base name (`Header.tsx`, `Header.module.css`; a test is `Name.test.ts`).

| Directory | Owns |
| --- | --- |
| `content/` | The campaigns' copy and data, one folder per campaign holding one folder per locale plus `campaign.config.ts` and `media.manifest.json`, and the shared `icons.ts` (inline SVG by name; each icon's ids carry the icon name as a prefix, from svgo's `cleanupIds` and `prefixIds`, because several icons are inlined on one page and a shared id would let one icon's mask clip another's, so a new icon goes through the same two plugins). Never imports code. Photos and clips are Pixabay assets listed by id in `scripts/pixabay.json`; `PIXABAY_KEY=... node scripts/pixabay.mjs` downloads them, derives the stills (feature cards at 1200×675), the gallery sizes and the three turntable frame sets cut from clips, all WebP but the gallery's full-size downloads, and regenerates the credits table in `CREDITS.MD` (linked from the README), so an asset is added to the manifest, never copied in by hand; it finds the table by its header row, padded or not, and replaces nothing else, and it stops before downloading anything when the table is missing. |
| `campaigns/<campaign>/` | The code one campaign may own, reached only through the registry `campaigns/index.ts`: a logo component (`outrun/Logo.tsx` is the cheetah gallop), a `next/font` face exporting the `--font-heading` variable, `recommendation.ts` mapping that campaign's quiz answers to a model with its table-driven test beside it, and a `theme.css` overriding design tokens under `[data-campaign='<campaign>']`. May import `src/components`, `src/lib`, `src/state`; never `src/app` or a section. |
| `src/app/` | The composition root: `[campaign]/[locale]/layout.tsx` (html lang, `data-campaign`, the campaign's font class, the state provider), `[campaign]/[locale]/[[...slug]]/page.tsx` (sets the request's campaign, loads the page and the shell MDX, derives the menu, renders header, content, rail, footer and modal), `tokens.css` (the `:root` design tokens, the reset, `.btn` and the few global utilities, all inside `@layer base` so a CSS Module always wins whatever order the production chunks load in), the only place a global selector may live beside a campaign's `theme.css`. |
| `src/mdx-components.tsx`, `src/mdx/` | How `content/` becomes React. `mdx-components.tsx` registers every authoring tag from `src/sections/`. `mdx/` is the build-time loaders and readers, no copy and no UI: `pages.ts` (list campaigns, locales and pages, load MDX modules), `campaign.ts` (`CampaignConfig`, the config registry and the `cache()`-scoped current campaign), `nodes.ts` (element-tree readers and `collectSections`), `media.ts` (`mediaUrl`, `listFrames`, `listGallery` over the campaign's manifest), `models.ts` (the model catalogue with its frame lists), `mdx.d.ts` (the shape of a `*.mdx` module). Imports nothing from the UI and never `@campaigns`. |
| `src/components/<Name>/` | One component per folder, `Name.tsx` and `Name.module.css`. `Section` wraps every section and exports `SectionProps`, the props every section tag shares and spreads into it: it registers the section's scroll progress and exposes it through `useSectionProgress`. `SkipLink` is the hidden "skip to content" anchor, shown on focus, targeting `<main id="content">`. `BackgroundImage` is the one art-directed image (`<picture>` over `getImageProps`, portrait below 980px); `FixedBackground` is the site-wide fixed one. `Header` (rendering the campaign's logo — a registry component such as `campaigns/outrun/Logo.tsx`, the campaign gallop traced from the cheetah clip as seventeen silhouette frames in a 134×60 box with integer coordinates, laid out as a strip that `motion` slides one frame per 8px of scroll travel in either direction so the cheetah only ever runs forward, through a playhead capped at 24 frames a second that never trails the scroll by more than one stride, so a flick makes it sprint for a beat rather than strobe — or the config's inline SVG markup or image URL, inside a link named by the campaign's brand, the motion control, a play/pause button whose label is the action it offers so it needs no pressed state, and the language switcher, a `<nav>` of `hreflang` links to the locales that have the current page, the current one marked `aria-current="page"` (links rather than a `<select>`, whose arrow keys would navigate on every change on Windows and Linux); the head carries the matching `hreflang` alternates; `HeaderBar inverse` is the same bar in yellow with Close in place of Register, rendered inside the modal), `SideMenu` (the rail with one progress ring per section; its yellow overlay rests on the panel's 300px edge, slides in from off-screen on the panel's own 240ms curve and sits one layer below the panel in both states, so its visible edge is always the panel's edge while opening and closing; Escape and its native anchors both move focus, to the first link on open and the Menu button on close), `Modal` (a native `<dialog>` opened with `showModal()`, so focus moves in and back, the page goes inert and Escape closes it; its `close` event dispatches `closeModal`, so state follows however it closed) are the shell. `YouTubePlayer` is the one YouTube embed, a plain `<iframe>` mounted only while the modal shows a feature video, playing from the privacy-enhanced `youtube-nocookie.com` host, which stores nothing until a video plays; the IFrame API it replaced only created and destroyed the player, which mounting and unmounting the iframe already does. `View360` is the drag-and-slider turntable: its preloaded frames stack in one grid cell with only the active frame visible (its range input carries `autoComplete="off"` and `suppressHydrationWarning` because its disabled state and value are client state that a browser can restore on reload before React hydrates, which showed up as a hydration mismatch on `disabled`); `Flip` and `Reveal` the two transitions; `RichText`, `Loading`, `ScrollIndicator`, `ShareLinks` the rest; `MotionFeatures` wraps the page in `LazyMotion` (`strict`, `domAnimation`), the one feature set the `m.*` elements need: `initial`, `animate`, `exit`, `whileInView`, variants and `AnimatePresence`. `BodyState` mirrors the store onto `<body>` (`data-locked`, `data-menu-open`, `data-motion-paused`) and the `motionPaused` motion value, and follows the motion preference `lib/motion` resolves: the OS reduced-motion setting, live, unless a header choice made under that same setting is stored. A component may read `state/` and `lib/`; it never imports `app/` or a section. |
| `src/sections/<Tag>/` | One folder per authoring tag, PascalCase, named exactly as the author writes it: `Hero`, `Welcome`, `Strength`, `Roadshow`, `Raising`, `Decision`, `Technical`, `Features`, `Media`, `Events`, `Footer`. The entry `<Tag>.tsx` is the tag, a thin server component that turns the Markdown children and props into plain data with `src/mdx/nodes.ts`, and it also holds the tag's child tags (`Fact`, `Question`, `Option`, `Feature`, `Country`, `Column`, `More`). `<Tag>Section.tsx` is the client body when the tag needs one; the rest of the folder is that section's parts, named by what they render so a part never shares a name with a tag (`Raising/` has `Intro`, `Frames`, `Connectors`, `Facts`; `Strength/` has `ChartFigure`, `SavingFigure`; `Decision/` has `QuestionRow`, `RecommendInfo`; `Technical/` has `ModelBar`, `QuickFactRow`; `Footer/` has `FooterColumn`). `ContentText.module.css` (the left text column, plus `container` and `paperOnTablet`, the section shell every full-height section composes with `cx`; `container` inherits the section's min-height so a full-height section's image and bottom rule reach its foot; from 1024px up a container holding the column is a grid with the column centred in flow, never absolutely positioned, so a section grows when the copy does, which is what keeps WCAG text spacing from overflowing it; a section never sets a min-height on it, and a band puts its floor on the in-flow copy instead) and `ModelFrame.module.css` sit at the root of the tree because more than one section shares them. A section never imports `app/`; a part two sections need (`RecommendInfo`) is imported across from its owning folder, and moves to `components/` the day a third needs it. |
| `src/state/` | `store.tsx`, the one React context (`useReducer`) for the low-frequency state: menu, modal, selected and recommended model, quiz answers. `sectionProgress.ts`, module-level `motion` values, one per section, plus the active section id, so scroll progress reaches the menu rings without a React render. |
| `src/lib/` | Infrastructure only, no domain rule: `browserStore` (`useSyncExternalStore` over a browser value, for the origin and the title), `cx`, `scrollTo` (no `behavior` option, so `scroll-behavior` on `html` decides and the reduced-motion rules can turn it off), `usePreloaded` (preloads a frame sequence and reports when every frame has arrived), `useMediaQuery`, `useRange` (a clamped 0..1 slice of a progress value), `useScrub` (`useRange` plus the matching `y` travel, the one scroll-linked reveal), `motion` (the `motionPaused` motion value every scroll-linked hook and scrubber reads, plus the preference: `followMotionPreference` subscribes to `prefers-reduced-motion` itself rather than through `useMediaQuery`, whose hydration pass reports `false` before the real value and would expire a stored choice; a header choice is stored as `paused|playing/<reduced>` and dropped, on load or live, the moment the OS setting differs from the one it was made under, so the newer signal always wins). Never imports `app/`, `components/`, `sections/` or `state/`. |

`eslint.config.mjs` enforces the direction with `no-restricted-imports`, one block per tree. It also raises `eslint-plugin-jsx-a11y`'s
recommended rules to `error` over `eslint-config-next`'s six warnings; the block carries only rules, under the same
`files` glob as Next's, because Next registers the plugin through an interop wrapper and flat config refuses a second
registration of the same name. `no-noninteractive-tabindex` allows `region` because a scrollable region (the gallery track) must be focusable to be scrolled by keyboard, which is axe's `scrollable-region-focusable` rule. `npm run a11y` (`scripts/a11y.mjs`) stays out of `check` so the pre-commit gate needs no
browser; it drives the installed Chrome locally and Playwright's Chromium when `CI` is set, and
`.github/workflows/deploy.yml` at the repo root runs it after `check` and `build` against `out/` served by `npm start`,
and deploys only when it passes. Axe audits the page as it loads, so a
scroll-linked reveal still at its start reads as low contrast; a contrast finding is confirmed on the scrolled page
before it is fixed. A
second rule, `no-restricted-syntax`, rejects importing `motion` from `framer-motion`; see _Dependencies_.

## Animation

Every scroll-linked effect reads the section's progress (0 when the section's top reaches the bottom
of the viewport, 1 when its bottom leaves the top) and maps a slice of it with `useRange`. Numbers
render as `motion` values (`<m.span>{digits}</m.span>`), never as React state, so a scrub
costs no render. The Raising scene is the one sticky scene (three viewports tall on desktop); below
1024px the same content renders stacked with `Reveal`. The OS reduced-motion setting and the header's motion
control (WCAG 2.2.2) are one switch, `data-motion-paused` on `<body>`: it follows the OS setting live, and a header
choice overrides it until the OS setting changes. With it, transitions and animations collapse, `useRange` resolves to 1 so every
scroll-linked reveal and counter shows its finished state, the hero video pauses, the modal fades are instant, and the Raising scene keeps its desktop
composition with the clip holding its poster frame, but its pane is one viewport tall and static rather than sticky over
three, so a paused page has nothing holding still under the scroll. Smooth scrolling is CSS, `scroll-behavior: smooth`
on `html` and the gallery track, so the same rules (and the `prefers-reduced-motion` media query before hydration)
reset it; no scroll call passes a `behavior`, which would override the property, and `<html data-scroll-behavior="smooth">`
lets Next keep a route change instant. The paused rule names `:root:has(body[data-motion-paused])` because `html` is
not a descendant of `body`.

## Accessibility

The site is built to WCAG 2.2 AA, and the rules below are the contract that keeps it there. Each rule names the gate
that catches its breach: _check_ is `npm run check` (a `node --test` file, or jsx-a11y at `error`), _journeys_ and
_axe_ are the two halves of `scripts/a11y.mjs`, and _manual_ is the five-minute script above. A rule without
an automated gate is one a reviewer reads for.

**Structure.** One `h1` per page (the Hero, or a page tag's title), `h2` per section, `h3` per card, fact or figure,
and no skipped level; a page's outline is read from its rendered headings, never from font size (_check_:
`src/mdx/content.test.ts`; _journeys_: `outline`). Every `<section>` carries `aria-label` from its `menu` label, so the
rotor lists it and the side menu and the region agree (_journeys_). Copy is written in sentence case and CSS shouts
where the design shouts, because a screen reader spells an all-caps word it takes for an initialism (_check_). Inline
icons carry ids prefixed with the icon's name, from svgo's `cleanupIds` and `prefixIds`, because several icons share a
page and a shared `mask` id clips the wrong shape (_check_; _journeys_ reports duplicate ids on the page).

**Focus.** `SkipLink` is the first element in `<body>` and the section `<nav>` precedes `<main id="content">`
(_journeys_: `skipLink`). An overlay is a native `<dialog>` opened with `showModal()`, with its close control inside
it, its opener marked `aria-haspopup="dialog"` and a name from the strings; the browser then moves focus in, keeps it
in, closes on Escape and returns it, and nothing re-implements that (_check_: no `role="dialog"`; _journeys_:
`dialog`). The menu focuses its first link on open and the Menu button on close, except when a link was followed, and
its labels show on `:focus-within` as well as hover (_journeys_: `menu`). A fragment link never calls `preventDefault`
and the scroll prompt is an `<a href="#…">`, so the browser sets the focus start point at the target. The logo links to
`/<locale>#home`: on the campaign page that is the same fragment jump to the top, and from every other page, the
dialog's bar included, it goes home, where a bare `#home` pointed at nothing.
`scroll-padding-top` covers the fixed header; a sticky bar inside a section is the one thing it does not cover.

**What a screen reader hears.** A value driven by a motion value (a counter, a scrubbed word) is `aria-hidden`
together with its sign and unit, and a `.srOnly` sibling carries the finished string, because the virtual cursor never
scrolls the reveal (_journeys_: `spokenValues`). Reading order matches visual order: in a sticky scene the heading
precedes the facts in the DOM (_journeys_). A change the user did not click on, such as a recommendation or the model
shown, is announced from a short `aria-live="polite"` status line, never from a paragraph that `Flip` remounts
(_journeys_). Toggles are `<button aria-pressed>` in a `role="group"` named by their question, faded rows are
`disabled` rather than `pointer-events: none`, and the tabs pattern is not used (_journeys_). Every label, hint and
status string a component renders comes from `useStrings()`, typed in `SiteStrings` and written in every
`content/<campaign>/<locale>/site.mdx`, with `fill()` for placeholders; a literal `aria-label` in a component is a
bug with no exception, since the logo's name comes from the campaign config (_check_: `src/conventions.test.ts`,
`src/mdx/strings.test.ts`; _journeys_: `localisedLabels` on every non-English locale). A link that opens a new tab renders through `ExternalLink`, which appends the hint; a
`download` link opens no tab (_check_). Decorative images have `alt=""`, a card image beside its heading is
decorative, and the gallery's photographs have no captions yet; they belong in the Pixabay manifest. The savings figures speak
their footnote as "note 1", not "star".

**Contrast, text and targets.** Copy over a photograph sits on the `Shadow` scrim (the fixed background and the
hero) or carries a text shadow, and the hero is measured behind the text, the heading at 3:1 and the prompt at 4.5:1
against the brightest pixels (_journeys_: `heroContrast`; _axe_ for solid backgrounds). Font sizes are rem, nothing
shrinks the body below a breakpoint, and no stylesheet sets `outline: none` (_check_). The shared text column is a
grid item of its section from 1024px up, so a section grows when WCAG text spacing is applied instead of clipping
(_journeys_: `textSpacing`). Every control is at least 24px tall and wide, or has clear space around it per 2.5.8;
the header buttons, locale links and share icons carry the padding that makes it so (_journeys_: `targetSize`; _axe_).
No control sits under another: the header bar is a `1fr auto 1fr` grid, so the logo keeps a column of its own and moves
off centre rather than cover a control when a locale's labels outgrow half the bar. The absolutely centred logo it
replaced sat over the motion button at 390px in both locales, so a tap on the button followed the logo link. `targetSize`
fails a control in view whose centre lies under another element, on `/en` and `/de`, because axe skips a header control
it takes for hidden behind the logo's frame strip, whose box overhangs the logo, and caught that overlap on one page of
four. Nothing invisible takes a tap: a closed side menu link takes the pointer only through a 30px `::before` column
over its ring, and not at all from 1024px down, where the closed rail sits off screen; the whole link takes it on hover,
on focus and while the menu is open. Its invisible labels once caught taps meant for the quiz, the share buttons and the
gallery beneath them (_journeys_: `closedMenu`, which also fails a desktop ring that stops taking the pointer), and
`targetSize` leaves out a control that takes no pointer, since that link's target is its ring column. A page heading is
never under another layer either (_journeys_: `headingOnTop`, on the roadshow and statement pages at desktop width,
since the fixed background only exists from 768px up); the index Hero is left to `heroContrast`, because its scrim and
the side menu sit over it by design. The 2.5.5 target of 44px is not met and is not promised.

**Motion.** Every `motion` transition reads `motionPaused` (`duration: 0` when paused) and every scroll-linked value
goes through `useRange`, so the header control and the OS setting stop everything (_journeys_: `motionControl`).

**Statement and owner.** `/<locale>/accessibility` is the published statement, rendered by `<Statement>` and linked
from the footer's legal list; it names the owner, lists the known limitations honestly, and its review date moves
with every audit. When a rule above changes, the statement's "How accessible this site is" section changes with it.

**Driving Chrome in automation.** The extension's tab usually reports `visibilityState` hidden, so smooth scrolls
stall, requestAnimationFrame pauses and screenshots show frozen fades: scroll with `behavior: 'instant'`, use real
key presses for focus, and trust measurements over screenshots there. `scripts/a11y.mjs` uses playwright-core
on the installed Chrome (`channel: 'chrome'`; Playwright's Chromium in CI) for that reason. Never open the YouTube
embed from automation: repeated cookie-less loads trip YouTube's bot check for the whole network for hours.

## Dependencies

The browser runs React, Next and `framer-motion`, nothing else. The 2018 site shipped swiper, gsap and gsap's
Draggable, about a third of its 310 KB of gzipped script; the platform replaced all three: the gallery is a
scroll-snap track, the sticky scene is `position: sticky` over `motion` values, and the turntable is a range
input with pointer events. `framer-motion` is imported directly rather than through `motion/react`, because
`motion/react` 13.4.x re-exports through `import * as fm` and reads `fm.motion` at module level, which keeps the
full `motion` component, with drag, pan and layout projection, in every bundle that imports anything from it,
about 17 KB compressed that no element uses. Elements are `m.*` under `MotionFeatures`, and the lint rule keeps
it that way; return to `motion/react` only once a release re-exports without that namespace read, and measure
first. `sharp` is a dev dependency because the media scripts import it; the static export has no image optimizer, so nothing ships it; `@mdx-js/react` is an
optional peer of `@next/mdx` that `src/mdx-components.tsx` makes unnecessary; `@mdx-js/loader` is the loader
`@next/mdx` requires. `npx next experimental-analyze --output` writes the per-module client sizes to
`.next/diagnostics/analyze`; a production build clears that folder, so copy it out before comparing.

Headings are set in Momo Trust Display, under the SIL Open Font License 1.1, loaded in `src/app/fonts.ts` through
`next/font/google`, which downloads it at build time and serves it from `/_next/static/media`, so no browser contacts
Google; the Latin file is the only one preloaded, and it covers the German copy. The face has one weight, so the heading
rule sets `font-synthesis: none` rather than let the browser smear a fake bold over it. English headings never
hyphenate: Firefox fills lines greedily and broke "NUM-BERS" and "chee-tahs" when they did. German headings hyphenate,
because the face is wide and compounds such as Verbreitungsgebiet cannot fit a column otherwise, but only in words of
twelve letters or more with five on each side of the break (`hyphenate-limit-chars: 12 5 5`), which stops Firefox
splitting "Gepar-den" or leaving "-BIET" on a line. Next has no metrics for the face, so there is no size-matched
fallback, and the dev server warns about that on start. Body text is the reader's system font, `--font` in
`tokens.css`, which needs no download and no licence; the footer inherits it rather than naming Arial. A normal-width
body face is wider than the condensed ones the layout was drawn for, so the strength section's chart row and counter
row share one grid, three equal `minmax(0, 1fr)` columns across `.inner`, which lines each counter up under its ring by
construction; the charts use `subgrid` rows, so the labels share one row and their tops align, and the rings share the
next. Each counter stacks its number above its label, top-aligned, so icons and numbers share a line; the sticker
becomes a pill for longer words, and the ring figures are 2rem so they sit inside the grey disc. A face added later needs
a licence that allows serving it from a web server. Univers LT Std left for want of one: Adobe's desktop licence forbids
web serving, and the project held no web licence.

## Known ceilings

- The hero plays one video per page; the 2018 site's multi-video carousel and its fading hero heading
  return as `<Hero>` props when content needs them.
- Images are one WebP per slot, sized for the largest screen that shows it, so a phone downloads the desktop file;
  a build step writing widths with `sharp`, already installed, behind a custom `next/image` loader brings responsive
  sizes back if page weight calls for it.

## Repo

| Path | Owns |
| --- | --- |
| `content/<campaign>/<locale>/*.mdx` | Every page and the shell, as Markdown with components (_Content_) |
| `campaigns/<campaign>/` | The code a campaign may own, behind `campaigns/index.ts` (_Layout_) |
| `CREDITS.MD` | The media credits table `scripts/pixabay.mjs` regenerates, linked from the README |
| `src/` | The code (_Layout_) |
| `public/media/` | The campaign imagery, WebP at the size the page shows: the gitignored, local-only staging copy `scripts/media-upload.sh` publishes to the bucket the site serves from — never committed, per the Pixabay licence note under _Content_ |
| `firebase.json`, `.firebaserc` | The Hosting site `outrun` in the shared project `firebase-cloud-491613`, whose Terraform lives in `poly-glot/firebase-cloud` |
| `.githooks/` | `pre-commit` runs `npm run check`, then `codegraph sync` and `zg index`; the LFS hooks live here too because `core.hooksPath` points at this folder |
| `.github/workflows/deploy.yml` | Every push: `npm ci`, `check`, `build`, then axe and the keyboard journeys against the served export; on the default branch it then deploys to Firebase through Workload Identity Federation |
| `.mcp.json`, `.claude/` | The codegraph and zvec-grep MCP servers, the hooks that keep their indexes current, and the project skills |

Campaign media lives only in the bucket and the local staging tree, never in git; the few binaries the repo does
carry (the favicon, the footer sprite) stay Git LFS objects (`.gitattributes`). The bucket is created by hand for
now and belongs in the `poly-glot/firebase-cloud` Terraform.

## Tooling

- Explore before you read, in this order, and stop at the first that answers: CodeGraph (`codegraph_explore`, or
  `codegraph explore "<symbols or question>"`) for code structure and call paths; the TypeScript LSP for a symbol's
  exact type, definition and every reference; zvec-grep (`zvec_grep_search`, or `zg query "<what you are looking
  for>"`) when you do not know the name, and for MDX content and CSS, which CodeGraph does not index; `rtk grep` for
  an exact string; `Read` with a line range last. Never `cat` a file over two hundred lines without a range. The
  `codegraph`, `typescript-lsp` and `zvec-grep` skills hold each tool's detail.
- Every shell command goes through `rtk` (the hook rewrites it; do not fight the hook). When a rewrite breaks a
  command, as `rtk find` does with compound predicates, rerun it as `rtk proxy <command>`.
- After a change to `src/`, `codegraph sync` and `zg index` keep the indexes current; the pre-commit hook runs both.
  `.codegraph/` and `.zvec-grep/` are indexes, ignored by git, rebuilt with `codegraph init -y` and
  `zg index --embedding local/potion-code-16m-v2` from the repo root.

## Ponytail

Before writing anything ask, in order: does it need to exist; is it already in `src/lib/`, `src/components/` or a
sibling section; does the platform do it (`position: sticky`, scroll-snap, `scrollIntoView`, `<input type="range">`
all replaced libraries here); does an installed dependency do it; can it be one function. Stop at the first rung that
holds. No abstraction with one implementation, no configuration for a value that never changes, no comment in code:
the reason lives in this file.

## Where the global rules stop

The global rule that puts every shared type in `src/types.ts`, with `.js` ESM imports, was written for another app and
does not apply here. This repo organises by feature: a type lives with the module that owns it and is exported from
there, importers bring it in with `import type` or an inline `type` modifier, and a type only its own module uses stays
unexported.

The workflows for this repo are project skills in `.claude/skills/`: adding content, starting a new campaign,
codegraph, zvec-grep, the TypeScript LSP, dead code, duplication and engineering practice. Reach for the matching skill
before improvising the procedure.
