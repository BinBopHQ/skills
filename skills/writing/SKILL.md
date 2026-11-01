---
name: writing
description: Write, review, or revise prose for BinBop, including documentation, issues, messages, and email drafts. Use when preparing substantial writing or when asked to check prose.
---

Write for the reader and purpose. Be clear and specific. Preserve the author's meaning, facts, voice, and useful formatting.

Run `writing check <file>` or pipe a draft to `writing check --stdin`. In a pnpm project, use `pnpm exec writing` if the command is not on PATH. The tool needs Node and mise; report missing tools or failed checks rather than claiming success.

Review the findings in context and make useful changes. Do not distort a fact or remove useful structure just to lower a score. If the threshold cannot be met without making the writing worse, explain the problem and leave the check failed.

For repository changes, also run the repository's required checks. For messages and email, prepare a draft; do not send or post it unless separately instructed.
