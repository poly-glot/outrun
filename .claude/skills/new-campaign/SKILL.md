---
name: new-campaign
description: Add a campaign to this multi-tenant site — new subject, copy, quiz options, brand, imagery, logo, typeface — or plan one. Use this whenever someone wants the Outrun Extinction page for a different cause, product, brand or event, a rebrand, or a new campaign on a path of this host, even when they only say "do the same page for X".
---

# Building a new campaign

This page was a Cat excavator launch in 2018 and became Outrun Extinction in 2026 without its layout code changing;
since 2026 one build hosts many campaigns, each at `/<campaign>/<locale>`. A campaign is content, configuration and
media poured into a fixed page algorithm: keep the algorithm, add a campaign beside the existing ones. `pace`
(Paws & Pace) is the worked example — single locale, inline-SVG logo, its own colour, face and quiz rules.

## The page algorithm

Each section does one job, and a new campaign fills the same slots in the same order.

| Tag | Job | What it needs |
|---|---|---|
| `Hero` | The statement | a looping video and still (master → `scripts/hero-video.sh`); the campaign name as the only `#` |
| `Welcome` | The case | a few lines, with `<More>` words the scroll underlines |
| `Strength` | The numbers | `<Chart value>` rings (percentages up to 100), `<Saving>` counters (whole numbers) with icons, a sourced `<Note>` |
| `Roadshow` | The event | an image and its portrait crop, a `####` kicker, a call to action |
| `Raising` | Where it goes | a portrait clip the scroll plays (`scripts/raising-video.sh`) and four `<Fact icon>` blocks |
| `Decision` | Which option fits you | questions whose answers `campaigns/<name>/recommendation.ts` maps to one of three options |
| `Technical` | The three options | a 36-frame turntable per option and `<QuickFact>` rows |
| `Features` | What each option offers | card grids of `<Feature image models video>`, filtered by the option chosen |
| `Media` | Spread the word | twelve gallery photos and share links |

The "models" in code are the three options the quiz chooses between: excavators in 2018, the ways to take part now.
Choose three options a visitor could genuinely be recommended between; the quiz and the card filter only make sense
then. `roadshow.mdx` is optional: without it the Register button and contact modal simply do not render.

## Steps

1. **Brief.** Settle the subject, the three options, the locales, the campaign's path name (its folder name is its
   URL segment) and every fact with its source before writing; ask for what is missing instead of inventing it.
   Adding a campaign never touches the existing ones, so work on `main` is safe until the push, which deploys it.
2. **Copy.** Write `content/<name>/<locale>/index.mdx` slot by slot, then `site.mdx` (strings and footer, whose
   accessibility link is `/<name>/<locale>/accessibility`), `accessibility.mdx` (owner and review date) and, when the
   campaign takes registrations, `roadshow.mdx`, following the `add-content` skill. Keep every id identical across
   locales; a single-locale campaign is one folder. A German commercial site also needs an Impressum page.
   `scripts/a11y.mjs` finds the section ids `home`, `strength`, `miles` and `ways`: keep those ids or update the script.
3. **Config and registries.** `content/<name>/campaign.config.ts` holds the data: `brand`, `siteUrl`, `defaultLocale`,
   `mediaBase`, the `logo` (`{ kind: 'component' }`, `{ kind: 'svg', markup }` or `{ kind: 'image', src }`), the
   background pair, the share card, the three `models` (id, which is also the button text, and frame folder) and
   `defaultModel`. Register it in `src/mdx/campaign.ts` and the campaign's code in `campaigns/index.ts`; a content
   folder missing from either fails the build loudly. A model id is also written in the MDX, in `<ModelText model>`,
   the keys of each `<QuickFact values>` and every `<Feature models>` list: name them all consistently, or those parts
   of the page render empty while `npm run check` stays green. Write `campaigns/<name>/recommendation.ts` and its
   table test. Add `public/<name>/manifest.json` (name, short name, theme colour, `start_url /<name>/<locale>`) and a
   `/<name>` → `/<name>/<defaultLocale>` redirect in `firebase.json`.
4. **Brand.** The brand name lives in the config; components never carry a literal `aria-label`
   (`src/conventions.test.ts`). Colours are token overrides in `campaigns/<name>/theme.css` under
   `[data-campaign='<name>']` — start with `--brand` and `--chart-stroke`; the brand colour sits behind black text and
   is used as text on black, so it needs 4.5:1 against black. The footer's social sprite
   (`public/footer/social-icons.png`) has Facebook, Google+, LinkedIn, Twitter and YouTube only.
5. **Media.** Encode to the same slots (feature stills 1200×675 WebP, gallery previews 1280×720 and thumbnails
   400×225 WebP with full-size JPEGs, 36 turntable frames of 1024×768 per option, the background pair
   and `social.jpg` — the command is in the Content section of `CLAUDE.md`). Pixabay stock goes through
   `scripts/pixabay.mjs`, which names gallery files after its subject and writes the credits to `CREDITS.MD`; client
   photography is encoded by hand and credited there. Then `node scripts/media-manifest.mjs <name>` writes the
   campaign's `media.manifest.json`; the build reads only the manifest, so a campaign may share another's files (as
   `pace` shares `outrun`'s) or bring its own. New icons go through svgo `cleanupIds` and `prefixIds`; the icon test
   fails when no icon carries an id.
6. **Logo.** A still mark is config only: inline `svg` markup (mind the viewBox width against the wordmark) or an
   `image` URL. A moving mark is a component in `campaigns/<name>/`, registered with the campaign; trace one by
   following `references/logo-trace.md`.
7. **Typeface.** A new face needs a licence that allows serving it from a web server (the OFL does; Adobe desktop
   licences do not). Load it in `campaigns/<name>/fonts.ts` exporting the `--font-heading` variable, then audit every
   box sized for the old face, in every locale, at phone and desktop width, in Chrome and Firefox; `tasks/lessons.md`
   records what went wrong when this was skipped.
8. **A domain of its own, only when asked.** A campaign lives on a path of this host. When one needs its own
   subdomain, that is a Hosting site in `~/Desktop/projects/firebase-cloud` (copy `terraform/apps/outrun.tf` and its
   outputs; site ids are global, `terraform plan` is the only real free-name test) and the user's call on DNS,
   secrets and repos: prepare, then ask.
9. **Docs, in the same change.** The README's glossary and Before launch list, the identity paragraph of `CLAUDE.md`,
   and this skill when the flow itself changes. Docs that still describe the old shape mislead the next agent.

## Verify

`npm run check`, `npm run build`, `npm start` with `npm run a11y` — the audit and journeys discover the new campaign's
pages from the content tree by themselves — then every locale in Chrome and Firefox at phone and desktop width,
alongside an existing campaign to prove nothing bled between them. The cross-locale id and media tests in
`src/mdx/content.test.ts` catch some mistakes; the model references in step 3 are yours to check. Run the `dead-code`
skill last when a campaign replaced media or icons.
