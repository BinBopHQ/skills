---
name: lint-writing
description: Check writing with the writing linter. Use when asked to lint or review text, or after drafting substantial text.
---

1. Run `writing check <file.md|file.txt>`, or pipe plain text to `writing check --stdin`. Use `pnpm exec writing check` if the command is installed in the project.
2. Review the findings and revise the text as appropriate, preserving its meaning and voice. Rerun the check after changes.
3. Run any other checks required by the project.

The task is complete when the writing check and applicable project checks pass. If a check cannot run or cannot pass without harming the text, report the failure and why.
