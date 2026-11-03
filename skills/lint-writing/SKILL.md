---
name: lint-writing
description: Check agent-written prose intended for outside the current chat for "AI smell", including documentation, comments, pull requests, emails, and published copy. Do not use for chat replies unless asked.
---

1. Install the checker package if needed, then run `lint-writing <file.md|file.txt>`, or pipe plain text to `lint-writing --stdin`. Use `pnpm exec lint-writing` if the command is installed in the project.
2. Review the findings and revise the text as appropriate.
3. Rerun the check after changes.

The task is only complete when the check passes.
