# Duplicate finder samples

Two ways to find duplicate functions in a TypeScript codebase, and a script that puts them side by side. Companion code for the dev.to post "An AST fingerprint and an embedding model both look for duplicate code. Here's where each one is wrong".

```sh
bun install
bun ast-duplicates.ts samples --fuzzy 0.8             # fingerprint, plus a fuzzy pass
bun embedding-duplicates.ts samples --threshold 0.8   # needs Ollama with nomic-embed-text
bun combine.ts samples                                # both, sorted by which finder saw a pair
bun check-equivalence.ts                              # same inputs into two "duplicates"
```

`ast-duplicates.ts` also takes `--baseline <file>` (exit 1 on a group that is not in the file) and `--write-baseline`.

| File | What it does |
|---|---|
| `lib/functions.ts` | finds every function with a body of at least 120 characters (TypeScript compiler API) |
| `lib/ast.ts` | normalizes bodies (identifiers to `_`, literals to `#`), exact fingerprint groups, optional fuzzy pass |
| `lib/embedding.ts` | embeds each body through Ollama and compares pairs by cosine similarity |
| `samples/` | small functions that reproduce the cases from the post; they are parsed, not run (except the ones `check-equivalence.ts` imports) |

Ollama runs on `http://localhost:11434` by default; set `OLLAMA_URL` or `EMBED_MODEL` to change it. Install the model with `ollama pull nomic-embed-text`. The scores in the post come from Ollama 0.31.2; another model or version gives other numbers.

Known gap: the normalizer works on text with regexes, so a quote character inside a regex literal (`/"/g`) throws the string replacement off. See the post.

MIT licensed.
