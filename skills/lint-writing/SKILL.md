---
name: lint-writing
description: Check writing for clarity, style, and common writing problems. Use when asked to lint or review text, or after drafting substantial text.
---

Run `writing check <file.md|file.txt>` to check a file, or pipe plain text to `writing check --stdin`. In a pnpm project, use `pnpm exec writing check` if needed. The checker requires Node and mise; if it cannot run, report that the check did not complete.

Review findings in context and revise as appropriate. Preserve meaning, facts, voice, and useful structure. A finding or score is a prompt to review, not proof that a passage is wrong. Do not change the meaning or make the writing worse to pass a check. If a required check cannot pass without doing so, report the failure and explain why.

Follow the user's instructions and any applicable project guidance. Run other required checks separately. Do not claim that a check passed unless it ran successfully.
