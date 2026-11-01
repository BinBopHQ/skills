# Writing prototype

This package provides a `writing` command and a `lint-writing` skill. The command checks Markdown or plain text with Vale and writehuman. Both run locally. Install Node 22 or later, pnpm, and mise, then run `pnpm install` in this directory. The command uses mise to run Vale 3.25.1.

```sh
node bin/writing.mjs check path/to/draft.md
printf 'A short draft.\n' | node bin/writing.mjs check --stdin
```

`--stdin` accepts UTF-8 plain text. File input accepts `.md` and `.txt`. The command does not modify or send the text and does not save a report. It exits nonzero on a Vale error, a writehuman score above 133.2, or a tool failure. Warnings and individual writehuman findings require judgment. Short text and structured writing can score poorly for reasons unrelated to quality.

When installed as a dependency, use `pnpm exec writing` instead of `node bin/writing.mjs`.

This is a prototype. It does not yet replace the product repository's writing check, check HTML, or run Markdown formatting and link checks. The Vale rules here were copied from product for evaluation; consolidation is needed before using both in production.
