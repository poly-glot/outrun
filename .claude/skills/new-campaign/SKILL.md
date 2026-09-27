---
name: new-campaign
description: Turn this site into a new campaign — new subject, copy, quiz options, brand, imagery, logo, typeface, domain, Firebase Hosting site and GitHub pipeline — or plan one. Use this whenever someone wants to reuse the Outrun Extinction page for a different cause, product, brand or event, rebrand it, or launch it on a new *.junaid.guru subdomain, even when they only say "do the same page for X".
---

# Building a new campaign

This page was a Cat excavator launch in 2018 and became Outrun Extinction in 2026 without its layout code changing. A
campaign is content, configuration and media poured into a fixed page algorithm: keep the algorithm, replace everything
the visitor reads and sees.

## The page algorithm

Each section does one job, and a new campaign fills the same slots in the same order.

| Tag | Job | What it needs |
|---|---|---|
| `Hero` | The statement | a looping video and still (master → `scripts/hero-video.sh`); the campaign name as the only `#` |
| `Welcome` | The case | a few lines, with `<More>` words the scroll underlines |
| `Strength` | The numbers | `<Chart value>` rings (percentages up to 100), `<Saving>` counters (whole numbers) with icons, a sourced `<Note>` |
| `Roadshow` | The event | an image and its portrait crop, a `####` kicker, a call to action |
| `Raising` | Where it goes | a portrait clip the scroll plays (`scripts/raising-video.sh`) and four `<Fact icon>` blocks |
| `Decision` | Which option fits you | five questions whose answers `src/rules/recommendation.ts` maps to one of three options |
| `Technical` | The three options | a 36-frame turntable per option and `<QuickFact>` rows |
| `Features` ×3 | What each option offers | card grids of `<Feature image models video>`, filtered by the option chosen |
| `Media` | Spread the word | twelve gallery photos, their download zip and share links |

The "models" in code are the three options the quiz chooses between: excavators in 2018, the ways to take part (Solo,
Coalition, Guardian) now. Choose three options a visitor could genuinely be recommended between; the quiz and the card
filter only make sense then.

## Steps

1. **Brief and repository.** Settle the subject, the three options, the locales, the subdomain (`<name>.junaid.guru`)
   and every fact with its source before writing; ask for what is missing instead of inventing it. Do the work in a new
   repository, or on a branch nothing deploys: `.github/workflows/deploy.yml` ships the default branch to its `SITE_ID`,
   so retargeting it inside the Outrun repo stops Outrun deploying, and merging a half-done rebrand publishes it.
2. **Copy.** Rewrite `content/<locale>/index.mdx` slot by slot, then `site.mdx` (strings and footer), `roadshow.mdx`
   (dates and registration links) and `accessibility.mdx` (owner and review date), following the `add-content` skill.
   Keep every id identical across locales. A German commercial site also needs an Impressum page.
3. **Options and ids.** In `content/site.config.ts` set `siteUrl`, the three `models` (id, which is also the button text, and frame folder),
   `defaultModel`, the background pair and the share card, and in `public/manifest.json` the `name` and `short_name`:
   like `siteUrl` they name the site, on a phone's home screen, so they change with the domain rather than wait for
   the brand. A model id is also written in the MDX of every locale, in `<ModelText model>`, the keys of each
   `<QuickFact values>` and every `<Feature models>` list: rename them all, or those parts of the page render empty
   while `npm run check` stays green. Rewrite `recommendModel` and its table test for the new questions.
   `scripts/a11y.mjs` looks up the sections `home`, `strength`, `miles` and `ways` by id: keep those ids or
   update the script.
4. **Brand.** The brand name is the logo's `aria-label` in `src/components/Header/Header.tsx` and `brandLabel` in
   `src/conventions.test.ts`; change both together. The brand colour is `--brand` in `src/app/tokens.css`, plus
   `#FDC529` in `src/sections/Strength/ChartFigure.tsx` and `#EB0029` in `src/sections/Decision/RecommendInfo.tsx`; it sits
   behind black text and is used as text on black, so it needs 4.5:1 against black. `public/manifest.json` carries the
   theme colour, and `public/favicon.ico` the icon. The footer's social sprite
   (`public/footer/social-icons.png`) has Facebook, Google+, LinkedIn, Twitter and YouTube only.
5. **Media.** `scripts/pixabay.mjs` fetches Pixabay stock only and names gallery files `cheetah-<id>`, and
   `scripts/hero-video.sh` crops the phone video at `iw*0.41`, where the cheetah runs: change both for the new subject.
   A product needs the client's own photography, which the script cannot fetch; encode it to the same slots by hand
   (feature stills 1200×675 WebP, gallery previews 1280×720 and thumbnails 400×225 WebP with full-size JPEGs and their
   zip, 36 turntable frames of 1024×768 per option) and credit it in the README. Make the background pair and
   `social.jpg` (the command is in the Content section of `CLAUDE.md`). New icons go through svgo `cleanupIds`
   and `prefixIds`; the icon test fails when no icon carries an id.
6. **Logo.** The header logo is campaign art: `src/components/Header/CheetahLogo.tsx` is a traced animation. Replace it
   by following `references/logo-trace.md`, or with a still SVG if the campaign has no moving mark.
7. **Typeface.** A new face needs a licence that allows serving it from a web server (the OFL does; Adobe desktop
   licences do not). Load it in `src/app/fonts.ts`, then audit every box sized for the old face, in both locales, at
   phone and desktop width, in Chrome and Firefox; `tasks/lessons.md` records what went wrong when this was skipped.
8. **Hosting.** In `~/Desktop/projects/firebase-cloud`, copy `terraform/apps/outrun.tf` to `<name>.tf` with
   `github_repo` set to the new repository, and the five `outrun_*` outputs in `terraform/apps/outputs.tf` and
   `terraform/outputs.tf`, renaming as you go. Hosting site ids are global, and a 404 from `<name>.web.app` does not prove
   one is free: an unused name and a claimed site with no deploy return the same page. `terraform plan` and apply are the
   real test, so keep a fallback such as `<name>-junaid` (photobank needed one). Here, set `site` in
   `firebase.json`, the target in `.firebaserc` and `SITE_ID` in the workflow. Pushing, opening the PR,
   creating the GitHub repo, setting its secrets and the DNS records are the user's calls: prepare them, then ask.
9. **Docs, in the same change.** The README's title, URL, glossary and Before launch list, the identity paragraph of
   `CLAUDE.md`, and every mention of `outrun` or the old domain in it. Docs that still describe
   the old campaign mislead the next agent.

## Verify

`npm run check`, `npm run build`, `npm start` with `npm run a11y`, then both locales in Chrome and Firefox at phone and
desktop width. The cross-locale id and media tests in `src/mdx/content.test.ts` catch some rebrand mistakes; the model
references in step 3 and the brand strings in step 4 are yours to check. Run the `dead-code` skill last: a rebrand
leaves the old campaign's media, icons and styles behind.
