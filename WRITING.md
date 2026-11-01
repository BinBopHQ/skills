# Lint writing

This package provides a `lint-writing` command and a `lint-writing` skill. The command checks Markdown or plain text with Vale and writehuman. Both run locally. The skill explains how to use the checker and review its findings. Install Node 22 or later, pnpm, and mise, then run `pnpm install` in this directory. The command uses mise to run Vale 3.25.1.

```sh
node bin/lint-writing.mjs path/to/draft.md
printf 'A short draft.\n' | node bin/lint-writing.mjs --stdin
```

`--stdin` accepts UTF-8 plain text. File input accepts `.md` and `.txt`. The command does not modify or send the text and does not save a report. It exits nonzero on a Vale error, a writehuman score above 133.2, or a tool failure. Warnings and individual writehuman findings require judgment. Short text and structured writing can score poorly for reasons unrelated to quality.

When installed as a dependency, use `pnpm exec lint-writing` instead of `node bin/lint-writing.mjs`. For a configured Git repository, `lint-writing --repo` checks Markdown formatting and local links, applies the shared Vale rules and local overrides, and saves writehuman reports in `.cache/writehuman/`. It also checks authored site HTML with Vale.

Repository checks require Git, mise, a `.writehuman.json` threshold, and any project-specific Markdown configuration. The command does not install the skill automatically.
