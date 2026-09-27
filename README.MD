# Outrun Extinction

The campaign site for Outrun Extinction, a UK run series raising money for cheetah conservation, served at
[outrun.junaid.guru](https://outrun.junaid.guru). It is Next.js 16 (App Router, React 19, TypeScript, CSS Modules,
`framer-motion`) exported to static HTML and hosted on Firebase. Every page is an MDX file under `content/<locale>/`, in
English and German. `CLAUDE.md` beside this file is the rulebook for people as much as for agents: read its Layout and
Accessibility sections before your first change.

## Prerequisites

| Tool                                                                 | Needed for                                                                                            |
|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Node 24                                                              | Everything. `.nvmrc` names it and nothing enforces it, so run `nvm use`                               |
| Git LFS                                                              | Every image, video and font. Without it a checkout holds pointer files and the page has no pictures   |
| Google Chrome                                                        | `npm run a11y`, which drives the installed Chrome                                                     |
| ffmpeg with `libsvtav1`, `libx264` and `libwebp`, `zip`, ImageMagick | Only to regenerate media with the scripts in `scripts/`                                               |
| `PIXABAY_KEY`                                                        | Only for `scripts/pixabay.mjs`; a free key from [pixabay.com/api/docs](https://pixabay.com/api/docs/) |

## First run

```sh
git lfs install
git clone git@github.com:poly-glot/outrun.git
cd outrun
git config core.hooksPath .githooks
nvm use
npm ci
npm run dev
```

Open http://localhost:3010/en. Git does not carry `core.hooksPath` across a clone; without it `.githooks/pre-commit`
never runs `npm run check` and the LFS hooks beside it never fire. The pre-commit check is skipped while
`node_modules` is missing, so install before the first commit.

## Commands

| Command         | Does                                                                                                                     |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|
| `npm run dev`   | Dev server on http://localhost:3010                                                                                      |
| `npm run check` | `typecheck`, `lint` and `test`, in that order; the pre-commit gate                                                       |
| `npm run build` | Static export to `out/`                                                                                                  |
| `npm start`     | Serves `out/` on 3010 with clean URLs, as Firebase does                                                                  |
| `npm run a11y`  | axe and the keyboard journeys against `A11Y_URL` (default http://localhost:3010); run `npm run build && npm start` first |
| `npm test`      | `node --test` over `src/**/*.test.ts` on plain Node, so a module a test imports uses relative `.ts` imports, never `@/`  |

## How a page is built

- `content/<locale>/<page>.mdx` is a page, and its path is the URL: `content/en/roadshow.mdx` is `/en/roadshow`. A page
  exports `meta` (title and description); the rest is Markdown with components.
- `content/<locale>/site.mdx` is the shell: the `strings` every label and hint comes from, and the footer.
- `content/site.config.ts` holds what is not copy: the site URL, the default locale, the background and the three models
  with their turntable frames.
- `src/app/[locale]/[[...slug]]/page.tsx` loads a page with its shell and renders the header, content, side menu, footer
  and modal. `generateStaticParams` names every locale and page, so `npm run build` writes one HTML file for each.
- `src/mdx-components.tsx` registers the tags an author may write. Each tag is a folder in `src/sections/<Tag>/`:
  `<Tag>.tsx` runs at build time and reads its Markdown children into plain data with `src/mdx/nodes.ts`, and
  `<Tag>Section.tsx` is the client component that draws it.
- `src/components/` holds the shared components, `src/lib/` the infrastructure, `src/state/` the one store and
  `src/rules/` the quiz logic. ESLint enforces which may import which.

The tag names come from the 2018 excavator site this one was rebuilt from, so the code says model where the page says
role:

| Tag         | On the page                                                                          |
|-------------|--------------------------------------------------------------------------------------|
| `Hero`      | Outrun Extinction, the opening video                                                 |
| `Welcome`   | Run with them                                                                        |
| `Strength`  | Strength in numbers                                                                  |
| `Roadshow`  | The run 2027                                                                         |
| `Raising`   | Where your miles go, the clip the scroll plays                                       |
| `Decision`  | Which works best for you?, the quiz; `src/rules/recommendation.ts` recommends a role |
| `Technical` | Three ways in: the models Solo, Coalition and Guardian are the three roles           |
| `Features`  | On the day, In your kit bag and Know your cheetah                                    |
| `Media`     | Spread the word, the gallery and its download                                        |
| `Events`    | The roadshow page and the Register modal                                             |
| `Statement` | The accessibility statement                                                          |
| `Footer`    | The footer, written in `site.mdx`                                                    |

## Common tasks

- **Change copy.** Edit the MDX in every locale. Write headings in sentence case; CSS uppercases them where the design
  shouts. `npm run check` fails on a skipped heading level or a heading typed in capitals.
- **Add a page.** Add `content/<locale>/<name>.mdx` with a `meta` export, then add its paths to `PAGES` in
  `scripts/a11y.mjs`, or axe never sees it.
- **Add a locale.** Copy `content/en/` to `content/<code>/` and translate it. `src/mdx/strings.test.ts` fails until every
  string exists; add the new pages to `PAGES` too.
- **Add a section.** Make `src/sections/<Tag>/`, register the tag in `src/mdx-components.tsx`, and give it `id` and
  `menu` in the MDX; the side menu lists it from those two props.
- **Add or replace a photo.** Add its Pixabay id to `scripts/pixabay.json` and run
  `PIXABAY_KEY=… node scripts/pixabay.mjs`. The script downloads it, writes WebP, rebuilds the gallery zip and
  regenerates the credits table below. Never copy a picture in by hand.
- **Re-encode a video.** `scripts/hero-video.sh <master>` writes the hero's AV1 and H.264 encodes, posters and stills;
  `scripts/raising-video.sh <source>` writes the Raising clip and its still.
- **Add an icon.** Icons are inline SVG in `content/icons.ts`. Run a new one through svgo's `cleanupIds` and `prefixIds`
  so its ids are unique on the page; `npm run check` fails otherwise.

## Configuration

The site reads no environment variables: the canonical URL is `siteUrl` in `content/site.config.ts`. It sets no cookies
and runs no analytics, and YouTube loads from `youtube-nocookie.com` only when someone opens a video; analytics comes
back only behind an Accept and Decline choice with a cookie policy page. The scripts read three variables:
`PIXABAY_KEY` for `scripts/pixabay.mjs`, and `A11Y_URL` and `CI` for `npm run a11y`, where `CI` swaps the installed
Chrome for Playwright's Chromium.

## Build, CI and deploy

`npm run build` writes `out/`: one HTML file per page, `404.html`, the hashed `_next/static` bundle and everything in
`public/`. Images are served as they are (`images.unoptimized`), so every picture under `public/media` is already WebP at
the size the page shows; the gallery downloads and `social.jpg` stay JPEG.

`firebase.json` serves `out/` from the Hosting site `outrun` in the shared project `firebase-cloud-491613`: clean URLs,
`/` redirected to `/en`, `_next/static` cached for a year, and pages revalidated on every visit.

`.github/workflows/deploy.yml` at the repository root runs on every push: `npm ci`, `npm run check`, `npm run build`,
then axe and the journeys against the served `out/`. On the default branch it then deploys with
`firebase deploy --only hosting:outrun`, signed in without keys through Workload Identity Federation. A deploy by hand is
`npm run build && npx firebase-tools deploy --only hosting:outrun` after `npx firebase-tools login`.

The infrastructure lives in `poly-glot/firebase-cloud`, in `terraform/apps/outrun.tf`: the Hosting site, the custom
domain and the deploy service account. Once it is applied, its outputs become this repository's secrets and DNS; from
`firebase-cloud/terraform`:

```sh
gh secret set WIF_PROVIDER -R poly-glot/outrun --body "$(terraform output -raw outrun_wif_provider)"
gh secret set GCP_SA_EMAIL -R poly-glot/outrun --body "$(terraform output -raw outrun_gcp_sa_email)"
terraform output outrun_required_dns
```

## Troubleshooting

- **No pictures, or 130-byte files under `public/media`.** Git LFS was missing at clone time: `git lfs install && git lfs pull`.
- **`npm start` finds port 3010 taken.** An older dev or start server is still running; `lsof -i :3010` finds it.
- **The build warns `Failed to find font override values for font Momo Trust Display`.** Expected: Next has no metrics
  for the face, so there is no size-matched fallback.
- **axe reports low contrast on a section you have not scrolled to.** Scroll-linked reveals start faded; confirm the
  finding on the scrolled page before fixing it.
- **`npm run a11y` cannot find Chrome.** Install Google Chrome, or run `npx playwright-core install chromium` and set
  `CI=1`.
- **Never script the YouTube embed.** Repeated automated loads trip YouTube's bot check for the whole network for hours.

## Before launch

- Every registration link in `content/*/roadshow.mdx` points at `example.com/register/<city>`.
- The footer's Privacy, Terms and Contact entries, and its social accounts, are plain text with nothing behind them.
- `outrun.junaid.guru` needs the DNS records from `terraform output outrun_required_dns` at the registrar.
- The repository needs its `WIF_PROVIDER` and `GCP_SA_EMAIL` secrets before the first deploy.

## Accessibility

The site is built to [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA. It asks the public to register, give money
and share the campaign, so it is a service under the Equality Act 2010, and AA is the level the UK's public-sector
regulations and most procurement frameworks name.
The [Understanding documents](https://www.w3.org/WAI/WCAG22/Understanding/)
explain each criterion with examples and are the reference for anything below; the
[quick reference](https://www.w3.org/WAI/WCAG22/quickref/) is the checklist form. `/en/accessibility` and
`/de/accessibility` are the published statement, linked from the footer, with the owner and the known limitations.

### Present state, criterion by criterion

The table lists every criterion the site's design touches and what the code does about it today. Criteria with
nothing on the page that could fail them (audio, timing, flashing, forms with error recovery) are left out.

| Criterion                                                                                                                                                                                   | State         | What the site does                                                                                                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [1.1.1 Non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)                                                                                                      | Partial       | Decorative images and icons carry `alt=""` or `aria-hidden`; a card image beside its heading is decorative. The gallery photographs still have no captions; they belong in `scripts/pixabay.json`                                  |
| [1.2.2 Captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded) and [1.2.5 Audio description](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded) | Open          | The two site videos are silent, so nothing applies to them. The four feature videos are YouTube embeds; the player is asked for captions in the page language, and whether each upload has them is a content check not yet done    |
| [1.3.1 Info and relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)                                                                                          | Pass          | One `h1` per page, `h2` per section, `h3` per card or fact; every section is a named region; quiz rows are groups labelled by their question; footer lists are lists; the kicker is a paragraph                                    |
| [1.3.2 Meaningful sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)                                                                                                | Pass          | In the sticky Raising scene the heading precedes the facts in the DOM, as it does on screen                                                                                                                                        |
| [1.4.1 Use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)                                                                                                             | Pass          | The active menu item is `aria-current` and bold, not only yellow; pressed toggles are announced as pressed                                                                                                                         |
| [1.4.3 Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)                                                                                                    | Pass          | Solid backgrounds sit between 6:1 and 21:1. Copy over photographs sits on a scrim or carries a text shadow; the hero heading measures 7:1 and the scroll prompt 4.9:1 against the brightest pixels behind them                     |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)                                                                                                                         | Pass to 390px | The page reflows to one column with no horizontal scroll at 390px. The 320px width that 400% zoom produces has not been checked                                                                                                    |
| [1.4.12 Text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)                                                                                                             | Pass          | From 1024px up the text column is a grid item of its section, so a section grows when the spacing overrides are applied instead of clipping                                                                                        |
| [1.4.13 Content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)                                                                                   | Pass          | The side menu's labels appear on keyboard focus as well as hover                                                                                                                                                                   |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard)                                                                                                                      | Pass          | Every control is a native element; the phone footer's accordion is a button with `aria-expanded`; the gallery track is a focusable region                                                                                          |
| [2.2.2 Pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)                                                                                                      | Pass          | A header control stops every animation and video, persists the choice, and follows the operating system's reduced-motion setting when it changes                                                                                   |
| [2.3.3 Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) (AAA)                                                                          | Pass          | Every scroll-linked value and every JavaScript transition reads the same motion flag                                                                                                                                               |
| [2.4.1 Bypass blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks)                                                                                                            | Pass          | A skip link is the first element in the body and the section navigation precedes `main`                                                                                                                                            |
| [2.4.3 Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)                                                                                                                | Pass          | Overlays are native `<dialog>` elements, so focus moves in, stays in, and returns to the opener; the menu focuses its first link on open and the Menu button on close; fragment links keep the browser's own focus point           |
| [2.4.6 Headings and labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)                                                                                                | Pass          | Headings and labels are written in sentence case and uppercased by CSS where the design wants capitals, so a screen reader reads words rather than spelling out what it takes for an initialism                                    |
| [2.4.7 Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)                                                                                                            | Pass          | No stylesheet suppresses the browser's focus ring                                                                                                                                                                                  |
| [2.4.11 Focus not obscured (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)                                                                               | Pass          | `scroll-padding-top` allows for the fixed header.                                                                                                                                                                                  |
| [2.5.3 Label in name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)                                                                                                            | Pass          | The dialog's close control says Close; every control's accessible name contains its visible text                                                                                                                                   |
| [2.5.8 Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)                                                                                              | Pass          | Header buttons, locale links and share icons are 24px or larger, and none sits under another element; the AAA size of 44px ([2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)) is not met and not promised |
| [3.1.1 Language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page) and [3.1.2 Language of parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts)         | Pass          | `lang` per locale and per locale link, `hreflang` alternates in the head, and every label, hint and status string comes from the locale's `strings` in `content/<locale>/site.mdx`                                                 |
| [3.2.2 On input](https://www.w3.org/WAI/WCAG22/Understanding/on-input)                                                                                                                      | Pass          | The language switcher is two links, not a `<select>` that navigates on change                                                                                                                                                      |
| [4.1.2 Name, role, value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)                                                                                                      | Pass          | Every control has a name; toggles are `aria-pressed` buttons in named groups; the dialog and the menu button carry `aria-haspopup`, `aria-expanded` and `aria-controls` as appropriate                                             |
| [4.1.3 Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)                                                                                                        | Pass          | The recommendation and the model shown are announced from short polite live regions; the counters carry their final value in hidden text because the animated digits start at zero                                                 |

### What is checked automatically

Three layers run without anyone remembering to.

`npm run check`, which the pre-commit hook runs, holds the browser-free rules. `eslint-plugin-jsx-a11y`'s recommended
rules fail the lint. `src/mdx/content.test.ts` reads every page in `content/` and fails on more than one page heading,
a skipped heading level, a heading or label typed in capitals, or an inline icon whose SVG ids are not unique and
prefixed with its name. `src/conventions.test.ts` scans the source for a literal `aria-label` (labels must come from
the locale strings), a `target="_blank"` outside `ExternalLink` (which adds the new-tab hint), a `role="dialog"` (the
site uses the native element), `outline: none`, and a font size in px. `src/mdx/strings.test.ts` fails when a locale
is missing a string.

`npm run a11y` needs a served build and Google Chrome, and is a step of `.github/workflows/deploy.yml`, which deploys
only when it passes. `scripts/a11y.mjs` runs axe-core with the WCAG 2.x A and AA tags over the six pages in its `PAGES`
list at 1366×768 and 390×844, after scrolling each page so scroll-driven reveals have settled, and fails on any serious
or critical violation.
The same script then drives the keyboard: the skip link, the dialog (open, four Tabs stay inside, Escape
returns focus to the opener), the menu (open focuses the first link, Escape returns to the button), the closed menu
(its hidden labels let taps through to the page at both widths, and its rings take them on desktop), the rendered
outline and section names and duplicate ids on four pages, the spoken counter values, the reading order of the
Raising scene, the model bar's pressed buttons and status line, English text left on `/de`, target size under the
2.5.8 spacing rule and any control in view whose centre lies under another element, on `/en` and `/de` at both widths,
the page heading on top of every other layer on the roadshow and statement pages at desktop width, text-spacing
overflow section by section, the hero's contrast measured behind its text, and the motion control.

Two things stay manual, and `CLAUDE.md` makes them part of the definition of done: a five-minute pass with
VoiceOver on Safari (Tab through the header, open and close the menu and the dialog by keyboard, read the Strength
section from the top of the page, check the German labels), and a look at 320px, which the automation cannot reach.

The rules themselves, and which gate enforces each one, are in the Accessibility section of `CLAUDE.md`.

## Font

Headings are set in [Momo Trust Display](https://fonts.google.com/specimen/Momo+Trust+Display) by Type Associates,
copyright 2024 The MoMo Trust Display Project Authors, under the [SIL Open Font License 1.1](https://openfontlicense.org).
The licence allows commercial use, self-hosting, subsetting and modification with no fee and no credit on the page; it
forbids selling the font on its own, and every copy must keep its copyright notice and licence, which the served files
carry in their metadata. `next/font/google` downloads its one weight at build time and serves it from the site itself,
so no visitor's browser contacts Google.

Everything else is set in the reader's own system font: San Francisco on Apple devices, Segoe UI on Windows and Roboto
on Android, falling back to Helvetica and Arial. Body text therefore needs no download and no licence.

## Media credits

Every photo and clip below comes from Pixabay under the [Pixabay Content License](https://pixabay.com/service/license-summary/),
which allows free commercial use and modification without attribution, and forbids selling or distributing the content
on its own in substantially its Pixabay form, using it in a trademark, or misleading or immoral use; identifiable people
are the user's to clear. The [API terms](https://pixabay.com/api/docs/) forbid hotlinking and mass downloading, so
`scripts/pixabay.mjs` downloads each asset listed in `scripts/pixabay.json` once, derives the WebP stills, frames and
gallery sizes, and regenerates this table, which is why a change belongs in the manifest rather than here.

| Used for                                                         | File                                    | Subject                              | By                | Source                                                                                                                                     |
|------------------------------------------------------------------|-----------------------------------------|--------------------------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| On the day, The 5K                                               | `features/day/5k.webp`                  | woman, runner, sport                 | MahmurMarganti    | [pixabay.com/photos/woman-runner-sport-running-run-5605529/](https://pixabay.com/photos/woman-runner-sport-running-run-5605529/)           |
| On the day, The 10K                                              | `features/day/10k.webp`                 | marathon, endurance, runner          | wal_172619        | [pixabay.com/photos/marathon-endurance-runner-sports-4646827/](https://pixabay.com/photos/marathon-endurance-runner-sports-4646827/)       |
| On the day, The Cub Dash                                         | `features/day/cub-dash.webp`            | kids, race, competition              | GPoulsen          | [pixabay.com/photos/kids-race-competition-children-6665603/](https://pixabay.com/photos/kids-race-competition-children-6665603/)           |
| On the day, Race the Cheetah                                     | `features/day/race-the-cheetah.webp`    | running track, numbers, fog          | RemazteredStudio  | [pixabay.com/photos/running-track-numbers-fog-1201014/](https://pixabay.com/photos/running-track-numbers-fog-1201014/)                     |
| On the day, The Guardian Line                                    | `features/day/guardian-line.webp`       | hands, marathon, gesture             | wal_172619_II     | [pixabay.com/photos/hands-marathon-gesture-running-8297611/](https://pixabay.com/photos/hands-marathon-gesture-running-8297611/)           |
| On the day, The Finish                                           | `features/day/finish.webp`              | match, arrival, track                | taniadimas        | [pixabay.com/photos/match-arrival-track-finish-line-2405991/](https://pixabay.com/photos/match-arrival-track-finish-line-2405991/)         |
| In your kit bag, Your fundraising page                           | `features/kit/fundraising-page.webp`    | iphone, hand, screen                 | JESHOOTS-com      | [pixabay.com/photos/iphone-hand-screen-smartphone-apps-410311/](https://pixabay.com/photos/iphone-hand-screen-smartphone-apps-410311/)     |
| In your kit bag, The training plan                               | `features/kit/training-plan.webp`       | sport shoes, running shoes, shoes    | Couleur           | [pixabay.com/photos/sport-shoes-running-shoes-shoes-1470061/](https://pixabay.com/photos/sport-shoes-running-shoes-shoes-1470061/)         |
| In your kit bag, The captain's pack                              | `features/kit/captains-pack.webp`       | people, business, meeting            | 089photoshootings | [pixabay.com/photos/people-business-meeting-1979261/](https://pixabay.com/photos/people-business-meeting-1979261/)                         |
| In your kit bag, The school pack                                 | `features/kit/school-pack.webp`         | teacher, learning, school            | 14995841          | [pixabay.com/photos/teacher-learning-school-teaching-4784917/](https://pixabay.com/photos/teacher-learning-school-teaching-4784917/)       |
| In your kit bag, Matched giving                                  | `features/kit/matched-giving.webp`      | shaking hands, handshake, hands      | geralt            | [pixabay.com/photos/shaking-hands-handshake-hands-3091906/](https://pixabay.com/photos/shaking-hands-handshake-hands-3091906/)             |
| In your kit bag, Field updates                                   | `features/kit/field-updates.webp`       | cheetah, animal, savanna             | katerinavulcova   | [pixabay.com/photos/cheetah-animal-savanna-wild-speed-10271817/](https://pixabay.com/photos/cheetah-animal-savanna-wild-speed-10271817/)   |
| In your kit bag, Sponsor a runner                                | `features/kit/sponsor-a-runner.webp`    | runner, running, jog                 | wal_172619        | [pixabay.com/photos/runner-running-jog-sports-7876675/](https://pixabay.com/photos/runner-running-jog-sports-7876675/)                     |
| Know your cheetah, Nought to sixty                               | `features/cheetah/nought-to-sixty.webp` | cheetah, africa, namibia             | DrZoltan          | [pixabay.com/photos/cheetah-africa-namibia-cat-run-2859581/](https://pixabay.com/photos/cheetah-africa-namibia-cat-run-2859581/)           |
| Know your cheetah, Seven metres a stride                         | `features/cheetah/seven-metres.webp`    | cheetah, acinonyx jubatus, predator  | tehzeebrokhri     | [pixabay.com/photos/cheetah-acinonyx-jubatus-predator-10327323/](https://pixabay.com/photos/cheetah-acinonyx-jubatus-predator-10327323/)   |
| Know your cheetah, The tear marks                                | `features/cheetah/tear-marks.webp`      | cheetah, predator, africa            | Glavo             | [pixabay.com/photos/cheetah-predator-africa-wild-animal-3450433/](https://pixabay.com/photos/cheetah-predator-africa-wild-animal-3450433/) |
| Know your cheetah, The cat that can't roar                       | `features/cheetah/cant-roar.webp`       | cheetah, cheetah mother, cheetah cub | carolehenderson   | [pixabay.com/photos/cheetah-cheetah-mother-cheetah-cub-3424526/](https://pixabay.com/photos/cheetah-cheetah-mother-cheetah-cub-3424526/)   |
| Know your cheetah, One species, four subspecies                  | `features/cheetah/four-subspecies.webp` | cheetah, animal, portrait            | rupertbanano      | [pixabay.com/photos/cheetah-animal-portrait-nature-10274270/](https://pixabay.com/photos/cheetah-animal-portrait-nature-10274270/)         |
| Know your cheetah, India got its cheetahs back                   | `features/cheetah/india.webp`           | cheetah, biodiversity, kenya         | 7523944           | [pixabay.com/photos/cheetah-biodiversity-kenya-wildlife-7143835/](https://pixabay.com/photos/cheetah-biodiversity-kenya-wildlife-7143835/) |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-8242729.*`           | cheetah, animal, mammal              | ambquinn          | [pixabay.com/photos/cheetah-animal-mammal-feline-8242729/](https://pixabay.com/photos/cheetah-animal-mammal-feline-8242729/)               |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-4818603.*`           | cheetah, animal, wild                | Wildfaces         | [pixabay.com/photos/cheetah-animal-wild-predator-cat-4818603/](https://pixabay.com/photos/cheetah-animal-wild-predator-cat-4818603/)       |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-2859581.*`           | cheetah, africa, namibia             | DrZoltan          | [pixabay.com/photos/cheetah-africa-namibia-cat-run-2859581/](https://pixabay.com/photos/cheetah-africa-namibia-cat-run-2859581/)           |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-5689870.*`           | cheetah, animal, safari              | Callmebaz         | [pixabay.com/photos/cheetah-animal-safari-cat-wild-cat-5689870/](https://pixabay.com/photos/cheetah-animal-safari-cat-wild-cat-5689870/)   |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-171315.*`            | cheetahs, animals, feline            | zgmorris13        | [pixabay.com/photos/cheetahs-animals-feline-wild-171315/](https://pixabay.com/photos/cheetahs-animals-feline-wild-171315/)                 |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-7277665.*`           | cheetah, africa, safari              | greatplaces360    | [pixabay.com/photos/cheetah-africa-safari-cat-wildlife-7277665/](https://pixabay.com/photos/cheetah-africa-safari-cat-wildlife-7277665/)   |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-3424526.*`           | cheetah, cheetah mother, cheetah cub | carolehenderson   | [pixabay.com/photos/cheetah-cheetah-mother-cheetah-cub-3424526/](https://pixabay.com/photos/cheetah-cheetah-mother-cheetah-cub-3424526/)   |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-7438381.*`           | cheetah, african cat, big cat        | LionMountain      | [pixabay.com/photos/cheetah-african-cat-big-cat-7438381/](https://pixabay.com/photos/cheetah-african-cat-big-cat-7438381/)                 |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-5177601.*`           | cheetah, predator, animal            | Val3re            | [pixabay.com/photos/cheetah-predator-animal-wildlife-5177601/](https://pixabay.com/photos/cheetah-predator-animal-wildlife-5177601/)       |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-10327323.*`          | cheetah, acinonyx jubatus, predator  | tehzeebrokhri     | [pixabay.com/photos/cheetah-acinonyx-jubatus-predator-10327323/](https://pixabay.com/photos/cheetah-acinonyx-jubatus-predator-10327323/)   |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-4405001.*`           | cheetah and cubs, cheetahs, wildlife | nickyduplessis28  | [pixabay.com/photos/cheetah-and-cubs-cheetahs-wildlife-4405001/](https://pixabay.com/photos/cheetah-and-cubs-cheetahs-wildlife-4405001/)   |
| Spread the word, the gallery and its download                    | `gallery/*/cheetah-1036450.*`           | cheetah, cheetah head, big cat       | IrmaB             | [pixabay.com/photos/cheetah-cheetah-head-big-cat-1036450/](https://pixabay.com/photos/cheetah-cheetah-head-big-cat-1036450/)               |
| Three ways in, the Solo frames the drag scrubs                   | `360/solo/frame-*.webp`                 | cheetah, sprint, running             | Solarselle77      | [pixabay.com/videos/id-307555/](https://pixabay.com/videos/id-307555/)                                                                     |
| Three ways in, the Coalition frames the drag scrubs              | `360/coalition/frame-*.webp`            | cheetah, predator, dangerous         | NickyPe           | [pixabay.com/videos/id-202278/](https://pixabay.com/videos/id-202278/)                                                                     |
| Three ways in, the Guardian frames the drag scrubs               | `360/guardian/frame-*.webp`             | cheetah, cubs, mother and cubs       | MikoEP            | [pixabay.com/videos/id-264386/](https://pixabay.com/videos/id-264386/)                                                                     |
| Hero video and still, encoded by scripts/hero-video.sh           | `Pixabay video 307555`                  | cheetah, sprint, running             | Solarselle77      | [pixabay.com/videos/id-307555/](https://pixabay.com/videos/id-307555/)                                                                     |
| Where your miles go, the clip the scroll plays                   | `Pixabay video 264386`                  | cheetah, cubs, mother and cubs       | MikoEP            | [pixabay.com/videos/id-264386/](https://pixabay.com/videos/id-264386/)                                                                     |
| The header logo, traced frame by frame from this silhouette clip | `Pixabay video 232970`                  | cheetah, jaguar, feline              | u_jtszgb2flp      | [pixabay.com/videos/id-232970/](https://pixabay.com/videos/id-232970/)                                                                     |
| Downloaded for the hero, not on the page                         | `Pixabay video 336178`                  | cheetah, savanna, africa             | Solarselle77      | [pixabay.com/videos/id-336178/](https://pixabay.com/videos/id-336178/)                                                                     |
