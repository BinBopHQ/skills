---
name: lint-writing
description: Double-check text for "AI smell". Use when writing, communicating, etc.
---

1. Run `lint-writing <file.md|file.txt>`, or pipe plain text to `lint-writing --stdin`. Use `pnpm exec lint-writing` if the command is installed in the project.
2. Review the findings and revise the text as appropriate.
3. Rerun the check after changes.

The task is only complete when the check passes.
