---
name: typescript-lsp
description: Use the TypeScript language server through the LSP tool for exact, type-aware answers — a symbol's type, its definition through the @/ and @content/ aliases, every reference before a rename or deletion, implementations, and call hierarchies. Use this whenever you are about to rename, delete, or change the signature or type of anything in TypeScript, need the precise type of an expression, or want to confirm what CodeGraph or grep suggested.
---

# TypeScript LSP

The `typescript-lsp` plugin, enabled in `.claude/settings.json`, runs `typescript-language-server` over
`tsconfig.json`. The `LSP` tool therefore answers with the compiler's own knowledge: the path aliases (`@/*`
is `src/*`, `@content/*` is `content/*`), strict types, and references that text search can only guess at.

## Operations

Every call takes `filePath`, a 1-based `line` and a 1-based `character` on the symbol's first letter. Take the line
from CodeGraph or `Read` output and count the column in it.

| Need | Operation |
|---|---|
| Every use of a symbol, before renaming or deleting it | `findReferences` |
| The exact type of a symbol or expression | `hover` |
| Where it is defined, through the aliases | `goToDefinition` |
| Which functions call it, and what it calls | `incomingCalls`, `outgoingCalls` |
| A file's outline | `documentSymbol` |
| A symbol by name, anywhere in the project | `workspaceSymbol` with `query` |
| The implementations of an interface | `goToImplementation` |

A `hover` that returns nothing usually means the column landed on whitespace; move to the first letter of the name.

## What it cannot see

- **MDX.** Content is not type-checked, so a mistyped prop in `content/*.mdx` compiles. `npm test` covers the media a
  page names and the ids shared across locales; everything else in MDX is review.
- **CSS Module classes.** `styles.anything` is typed as a string, so an unknown class is not an error. The `dead-code`
  skill's script finds classes nothing reads.
- **Diagnostics.** The tool has no diagnostics call: run `npm run typecheck`, or `npm run check` for the full gate.

## When it fails

The plugin needs `typescript-language-server` on the PATH of the Node that Claude Code runs under. If `LSP` reports
that no server is available, install it for the active Node with `npm i -g typescript-language-server typescript` and
restart the session. Switching Node versions with nvm leaves global packages behind, which is the usual cause.
