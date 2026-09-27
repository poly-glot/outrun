---
name: engineering-practice
description: How to write, change and verify code in this repo the way its owner expects — the ponytail ladder, root-cause fixes, no comments, naming and paragraph style, import direction, the accessibility and motion contracts, the verification gates, docs that move with the code, and git rules. Use this whenever you write or modify code (TypeScript, TSX, CSS, scripts), review a change, fix a bug, or are about to report work as done.
---

# Engineering practice

The rules live in `CLAUDE.md` and in the user's global instructions. This skill is the
order to apply them in, so nothing is skipped on the way to done.

## 1. Understand before changing

- Trace the real flow first: `codegraph explore` on the symbols involved, `codegraph impact` for the blast radius, the
  LSP's `findReferences` before a rename or deletion. For a bug, find every caller of the function you are about to
  touch: one guard where all callers meet beats one per caller.
- Look before writing (the `duplication` skill): `src/lib/`, `src/components/`, a sibling section, the platform, an
  installed dependency, in that order (_Ponytail_ in `CLAUDE.md`).
- Work on the Node in `.nvmrc` (`nvm use`); CI runs on it, and a different major can pass here and fail there.

## 2. Write it the house way

- No comments of any kind in code. A reason worth keeping goes into `CLAUDE.md`; a name that needs a comment
  gets renamed, or the logic gets extracted into a named helper.
- Logical paragraphs, with blank lines between setup, work and result. Early exits over nesting. Functions that take
  their inputs instead of reaching for globals. Sets and maps for lookups inside loops, and loop invariants hoisted out.
- CSS properties and YAML keys in alphabetical order. Type in rem, never px, and never `outline: none`.
- Files by feature, with each stylesheet beside its component; imports only in the directions `eslint.config.mjs`
  allows; types beside their owner and exported only when another module imports them (section 4 of the root
  `CLAUDE.md`, which also records that the global `src/types.ts` rule does not apply here).
- Every label comes from `useStrings()`; links that open a tab go through `ExternalLink`; overlays are native
  `<dialog>`s; animation is `m.*` under `MotionFeatures`, reads `motionPaused`, and scroll effects go through
  `useRange`. The Accessibility and Animation sections of `CLAUDE.md` give the reason for each.

## 3. Verify, in order

1. `npm run check`: typecheck, lint and tests, about ten seconds.
2. `npm run build` for anything that changes the output.
3. `npm start`, then `npm run a11y`, for anything that renders. It needs Google Chrome.
4. Open the page in Chrome. Layout and typography changes also go through Firefox, in both locales, at phone and
   desktop width (`tasks/lessons.md`). In automation the tab can report itself hidden: scroll with
   `behavior: 'instant'` and trust measurements over screenshots.

Firefox runs headless here: `/Applications/Firefox.app/Contents/MacOS/firefox --headless --profile <dir>
--screenshot <file>.png --window-size=390,844 <url>`, where `<dir>` is an empty folder whose `user.js` sets
`ui.prefersReducedMotion` to 1, so scroll effects show their final state.

For a change to layout, layering or a fixed or sticky layer, measure the page itself. axe skips a control it takes for
hidden, and an element faded to `opacity: 0` still takes taps, so check what `document.elementFromPoint` returns at a
control's or heading's centre, as the `targetSize`, `headingOnTop` and `closedMenu` journeys do, at 320, 390, 768 and
1366px in both locales, and at several scroll positions where a fixed layer passes over the page. A change that moves
no box, such as a rule, a string or a test, needs none of this; the gates cover it.

Report what ran and what it returned, and report a skipped step as skipped. A gate that already failed before your
change is still reported as failing, with its cause, and fixed in its own change. A bug that was already there and
blocks your change is the exception: fix it at its source in the same change and name it in the report as a separate
fix. Routing around it in the new code, with a z-index, an offset or a guard in the new component, protects only the
new element and leaves everything else the bug touches broken.

## 4. Close the gap that let it through

When a bug reached the page past the gates, add the check that would have caught it in the same change: a journey in
a journey in `scripts/a11y.mjs` or a node test beside the code. Show it failing on the unfixed code before it passes on the
fix; a check that has never failed proves nothing.

## 5. Leave the docs true

Search `README.MD` and `CLAUDE.md` for anything you renamed, moved or removed, and fix them in the
same change; drifted docs have already misled work here more than once. After a correction from the user, add the
pattern to `tasks/lessons.md`.

## 6. Git

Local commits are fine; keep someone else's unfinished work out of yours. Take the author identity from the remote, as
the global instructions say; this repo has used `Junaid Ahmed <me@junaid.guru>`. Never push without explicit
permission for that push. The pre-commit hook runs `npm run check` once `git config core.hooksPath .githooks` is set.
