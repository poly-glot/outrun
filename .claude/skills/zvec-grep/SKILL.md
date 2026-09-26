---
name: zvec-grep
description: Search this repo by meaning with zvec-grep — find code, MDX content, CSS or docs when the exact name is unknown, find code that looks like a snippet before writing a new helper, and answer questions that span files. Use this whenever the wording or location is unknown, when the question is about content (content/*.mdx) or styles (*.css) that CodeGraph does not index, or when checking whether something similar already exists.
---

# zvec-grep

zvec-grep keeps a local hybrid index, full text plus embeddings from `local/potion-code-16m-v2`, in `.zvec-grep/`
(ignored by git). It covers what CodeGraph does not: MDX content with its heading structure, CSS, JSON, YAML, shell
scripts and Markdown docs, beside the TypeScript. It leaves out `public/media`, `build/`, `volumes/` and SQL dumps.

## When to reach for it

- You know what you want but not what it is called: "where does the menu ring read scroll progress".
- The answer lives in content or styles: "which section uses the yellow kicker", "where is the German registration
  copy".
- Before writing a helper, to see whether the codebase already has one: search with the snippet or a description of
  it. Pasting the body of the frame preloader returns `usePreloaded` first.
- Not for an exact string (grep is exhaustive and cheaper) or for callers and call paths (CodeGraph).

## Calls

The MCP tool is `zvec_grep_search`. Always pass `root`, the absolute path of the repo, and combine routes:

| Field | Use |
|---|---|
| `query` | One hybrid group in plain words |
| `vector` | A semantic route; paste a code snippet here to find its look-alikes |
| `fts` | An exact anchor such as a symbol, class name or error message |
| `globs` | Narrow the search: `["src/**"]`, `["content/**"]`, `["**/*.module.css"]` |
| `limit` | Results per group; the default is 7 |

Results carry real source with line numbers; when a snippet answers the question, treat it as read rather than opening
the file. From Bash the same index answers `zg query "<question>"`, with `--fts "<anchor>"`, `--vector "<snippet>"`,
`--fuse` to merge the groups, `-g '<glob>'` and `--limit <n>`; `zg query --rg -F "<string>" <path>` is an exhaustive
ripgrep through the same tool.

## Freshness

Each result reports `freshness`. The MCP server refreshes in the background after edits, and the pre-commit hook runs
`zg index`, which takes a few seconds when little has changed; run it yourself after a large batch of edits made
through Bash. `zg status` shows coverage. Creating, rebuilding or dropping the index is the user's decision; if they ask
for a rebuild, it is `zg index --embedding local/potion-code-16m-v2` from the repo root.
