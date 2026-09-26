---
name: dead-code
description: Find and remove dead code — unused files, exports, types, dependencies, CSS Module classes, strings and media. Use this whenever a task asks to clean up, prune, slim down or audit the codebase, after a rebrand or a feature removal, before a release, whenever you suspect something is no longer used, and before deleting anything, to prove it is dead.
---

# Dead code

Dead code costs twice: every reader and agent spends attention on it, and in a static export every dead file under
`public/` still ships to Firebase. Prove a thing is dead with more than one signal, delete it, then run the gates.

## Scan

Run everything from the repo root. Each layer finds what the others miss.

| Layer | Command | Finds |
|---|---|---|
| Compiler | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | unused locals, parameters and imports |
| knip | `npx --yes knip@5 --config .claude/skills/dead-code/knip.json --no-progress --reporter compact` | unused files, exports, exported types and dependencies |
| CSS Modules | `node .claude/skills/dead-code/scripts/unused-css-classes.mjs` | classes no component reads |
| Strings | `node .claude/skills/dead-code/scripts/unused-strings.mjs` | `SiteStrings` keys no component reads |
| Media | `npm run build`, then `node .claude/skills/dead-code/scripts/unused-media.mjs` | files under `public/` that no built page references |

`knip.json` marks the two kinds of entry knip cannot discover by itself: the MDX pages, which `src/mdx/pages.ts`
loads by path, and the scripts in `scripts/`, which people run by hand. Because every script counts as an entry, judge
a script by whether `package.json`, a README or a `CLAUDE.md` still tells anyone to run it.

## Triage before deleting

A finding is a lead, not a verdict. Confirm it with a second signal:

- For code: `codegraph callers <symbol>` and the LSP's `findReferences`.
- For anything named in MDX (tags registered in `src/mdx-components.tsx`, props, icon names from `content/icons.ts`,
  media file names): search the content with zvec-grep or grep, because CodeGraph and the LSP do not read MDX.
- For dynamic access: `styles[theme]` and `styles[layout]` in `Section.tsx` pick classes named by MDX props
  (`theme="white"`, `layout="normalPage"`); `listFrames` and `listGallery` read whole media folders; Next loads
  `page.tsx`, `layout.tsx` and `not-found.tsx` by convention; `:global(...)` classes are applied as plain strings. The
  CSS script marks modules it saw read dynamically instead of calling their classes unused.
- For files outside the module graph (old CI files, Dockerfiles, deploy scripts, reports), which none of the scans
  see: search the whole repo for the file's name. A file that only its own docs mention is dead, and those docs go
  with it.

Two findings are not deletions. An exported type that only its own module uses loses its `export` (_Where the global rules stop_ in
`CLAUDE.md`). A string no component reads leaves the `SiteStrings` interface and every locale's `site.mdx`
together, or the strings test fails.

## Delete and verify

Delete one kind at a time, then run `npm run check`, `npm run build` and, for anything that renders, `npm start` with
`npm run a11y`. Search `README.MD` and `CLAUDE.md` for whatever you removed and correct them in
the same change, because stale docs mislead the next agent. In auto mode, deleting tracked files can need the user's
confirmation: list what goes and why when you ask.
