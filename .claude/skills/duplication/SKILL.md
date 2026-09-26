---
name: duplication
description: Find duplicated and near-duplicated code and decide whether to merge it — copy-paste clones, look-alike helpers, repeated CSS, and existing code a new change would re-implement. Use this whenever you are about to write a helper, hook, component or style rule (check it does not already exist first), when reviewing a change for repetition, or when asked to find duplication, DRY things up or reduce copy-paste.
---

# Duplication

Re-implementing what already lives a few files over is the most common slop and the cheapest to prevent: search
before writing. Merging duplicates that already exist is a judgement call, not a reflex.

## Before writing new code

Describe or paste what you are about to write, and search for it:

- zvec-grep's vector route finds look-alikes by meaning: `zvec_grep_search` with `vector` set to the snippet and
  `globs: ["src/**"]`, or `zg query --vector "<snippet>" -g 'src/**'` from Bash. Pasting the body of
  the frame preloader returns `usePreloaded` first and the promise-based YouTube loader next.
- `codegraph query <likely name>` finds helpers by name. `src/lib/` holds the infrastructure (`cx`, `useRange`,
  `useScrub`, `scrollTo`, `useMediaQuery`, `browserStore`, `motion`, `usePreloaded`) and `src/mdx/nodes.ts` the
  Markdown readers (`ofType`, `textOf`, `linesOf`).

## Scan for clones

From the repo root:

`npx --yes jscpd@4 src scripts --min-tokens 40 --reporters console --format "typescript,tsx,javascript,css"`

It reports exact clones and clones with renamed identifiers, with both files and line ranges. The last run found a
single one: five lines in `src/sections/Events/Events.tsx` and `src/sections/Footer/Footer.tsx`, both reading a
Markdown list of links into data. Lower `--min-tokens` to see smaller repeats; raise it to cut noise.

## Decide

- Merge copies that change for the same reason, two paths that must stay in step. Leave copies that only look alike
  today and will diverge; the Events and Footer readers are small and parse different shapes, so they stay until a
  third reader appears.
- Put a merged part where the Layout section of `CLAUDE.md` says: a part two sections share is imported
  across from its owner and moves to `components/` the day a third needs it; infrastructure goes to `src/lib/`,
  Markdown readers to `src/mdx/nodes.ts`, pure rules to `src/rules/`.
- Do not deduplicate translations (each locale repeats the structure on purpose, and a test keeps their ids in step),
  table-driven tests, or CSS that shares values but styles different things.
- After merging, run `npm run check` and, for anything that renders, the build and accessibility gates.
