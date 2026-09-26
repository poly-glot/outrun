---
name: codegraph
description: Use CodeGraph, this repo's pre-built code knowledge graph, to understand or change TypeScript before reading files — a symbol's source, who calls it, what a change affects, which components render which. Use this whenever you need to find where code lives, trace a call chain, check the blast radius before editing or deleting, or answer "how does X work" in src, and reach for it before grep or opening files.
---

# CodeGraph

CodeGraph is a SQLite graph of every symbol, import and call in the repo, kept in `.codegraph/` (ignored by git). One
query returns verbatim, line-numbered source plus the paths between symbols, including hops grep cannot follow, such as
one component rendering another (`Hero → Section [dynamic: renders <Section>]`). That is why it comes first for code
questions: one call usually replaces a dozen file reads.

## What it covers

It indexes `.ts`, `.tsx`, `.js` and `.mjs`, plus the legacy PHP and YAML: about a hundred files. It does not index MDX
content or CSS. For `content/**/*.mdx` and `*.module.css`, use zvec-grep (the `zvec-grep` skill) or an exact
grep. Exclusions live in `codegraph.json`.

## Calls

Prefer the MCP tool `codegraph_explore` (load it through tool search when it is deferred) and name several symbols or
files at once: `"BackgroundImage FixedBackground HeroSection"` returns their source, how they connect and who depends
on them. The CLI answers the same from Bash and adds a few questions of its own:

| Question | Command |
|---|---|
| How does this area work? | `codegraph explore "<symbols or a question>"` |
| One symbol with callers and callees, or a file with line numbers and dependents | `codegraph node <name or path>` |
| Who calls it? | `codegraph callers <symbol>` |
| What does it call? | `codegraph callees <symbol>` |
| What is affected if I change it? | `codegraph impact <symbol>` |
| Where is a symbol with this name? | `codegraph query <name>` |

`codegraph affected <files>` lists the tests that import the changed files, but most tests here read files rather
than import them, so it misses them. The whole suite runs in under a second: run `npm test` instead.

## Keep it fresh

The MCP server watches files, and the project hook syncs after the Edit and Write tools. Edits made through Bash (sed,
heredocs, scripts) can outrun both, so run `codegraph sync` (under a second) before trusting results after them.
`codegraph status` shows the counts and whether the index is current; `codegraph index` rebuilds it from scratch if it
is ever corrupted. The pre-commit hook syncs as well.

## Before you edit or delete

Read `codegraph impact <symbol>` or `codegraph callers <symbol>` first: that list is the blast radius. Confirm an exact,
type-aware reference list with the LSP's `findReferences` before a rename or deletion (the `typescript-lsp` skill). A
tag registered in `src/mdx-components.tsx` is also used by name in MDX, which neither CodeGraph nor the LSP reads, so
search the content too.
