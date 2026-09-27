---
name: add-content
description: Add or change content on the Outrun Extinction site — copy, pages, sections, feature cards, facts, quiz questions, roadshow dates, strings, locales, photos, videos and icons. Use this whenever a task touches content/*.mdx, content/site.config.ts, content/icons.ts, scripts/pixabay.json or public/media, even when the ask is only "update the text", "add a German page", "add a question" or "swap this photo".
---

# Adding content

Content is data. Every page is `content/<locale>/<page>.mdx`, and the code turns it into the site at build
time, so most content changes need no code at all. The component catalogue, which tags exist and the props each
takes, is the Content section of `CLAUDE.md`; read it before writing MDX. It is the single source of truth
and this skill does not repeat it.

## Rules that are easy to break

- **Change every locale.** English and German share one structure: the same section, question and option `id`s in the
  same order, with only the words translated. The quiz rules in `src/rules/recommendation.ts` read those ids, so
  `npm test` fails when the locales drift.
- **Headings are an outline.** `#` appears once, in the Hero or a page tag's title; `##` per section, `###` per card or
  fact, `####` only for the Roadshow kicker. Write them in sentence case: CSS uppercases them where the design shouts,
  and a screen reader spells out a capitalised word it takes for an initialism. A line break in a heading is `<br />`.
- **Copy is Markdown inside the tag; presentation is a prop**: `theme`, `layout`, `backgroundColor`, file names.
- **Every label, hint or status a component renders comes from `strings`** in `content/<locale>/site.mdx`, typed by
  `SiteStrings` in `src/mdx/pages.ts`. A new string goes into the interface and every locale's `site.mdx` together.
- **Content changes stay content.** If the look you were asked for needs a code fix, such as a shared component that
  renders wrongly, make it a separate change and name it in your report with the reason, so it can be reviewed apart.
- **Media names are relative to `public/media/`.** Pictures are WebP at the size the page shows, because
  the site is a static export with no image optimizer; only the gallery downloads and `social.jpg` are JPEG.

## Recipes

**Change copy.** Edit the MDX in every locale. Nothing else.

**Add a page.** Create `content/<locale>/<name>.mdx` exporting `meta` (`title`, `description`) in each locale that
should have it; its path is its URL. Use the same file name in every locale: the language switcher and the `hreflang`
alternates pair pages by file name. Add the paths to `PAGES` in `scripts/a11y.mjs`, or axe never audits the page, and
decide where the page is linked from, usually a footer column in each `site.mdx`; ask when that is unclear.

**Add a locale.** Copy `content/en/` to `content/<code>/`, translate the words and keep the ids, then add its pages to
`PAGES`. The language switcher and the `hreflang` alternates pick the locale up on their own.

**Add a feature card, fact or roadshow date.** Copy a sibling block inside the same tag. A feature's `models` is the
comma list of options that offer it, using the ids in `content/site.config.ts` (`Solo`, `Coalition`, `Guardian`). A
roadshow date is a list item `[City](registration link) date` inside its `<Country name>`.

**Add or change a quiz question.** A `<Question id text>` holds `<Option id>label</Option>`s. An answer only matters if
`recommendModel` in `src/rules/recommendation.ts` reads it, so change the rule and its table test
`recommendation.test.ts` together.

**Add or replace a photo.** First check the photo: fetch `https://pixabay.com/photos/id-<id>/` (WebFetch works where
curl gets a 403) and confirm it shows what was asked for. If it does not, stop and ask for the right id: the manifest
feeds every later run of the script, so a wrong id would come back on the next unrelated swap. Then add the Pixabay id
to `scripts/pixabay.json` (a still with its `file`, `use` and size, a
gallery id, or a turntable clip) and run `PIXABAY_KEY=… node scripts/pixabay.mjs`. It downloads,
writes WebP, rebuilds the gallery zip and regenerates the credits table in `README.MD`. Never copy a picture
in by hand: the manifest is what keeps credits and sizes right. If there is no key, ask for one rather than working
around it.

**Re-encode a video.** `scripts/hero-video.sh <master>` writes the hero's AV1 and H.264 encodes, posters and stills;
`scripts/raising-video.sh <source>` writes the Raising clip and its still. Both need ffmpeg with libsvtav1, libx264
and libwebp.

**Add an icon.** Icons are inline SVG strings in `content/icons.ts`, keyed by name. Run a new SVG through svgo with
`cleanupIds` and `prefixIds` so every id starts with the icon's name: several icons share a page, and a shared `mask`
id clips the wrong shape. `npm test` enforces the prefix.

**Add a section.** That is code, not content. Follow the `engineering-practice` skill and the Layout section of
`CLAUDE.md`, register the tag in `src/mdx-components.tsx`, and give it `id` and `menu` in the MDX: the side
menu is built from exactly those two props.

## Verify

1. `npm run check`. The content tests fail on a skipped heading level, a heading in capitals, a
   missing string, ids that drift between locales, and a page naming media that does not exist.
2. For anything visible: `npm run build`, then `npm start` and `npm run a11y`.
3. Open the changed page in Chrome at desktop and phone width in every locale. A layout or typography change is also
   checked in Firefox; `tasks/lessons.md` records why.
