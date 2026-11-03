# Skills

Reusable agent skills and supporting tools for work across BinBop.

## Getting started

The `lint-writing` skill checks drafts and repositories using Vale and writehuman. Repository checks also use Markdownlint.

Install Node.js and pnpm, then add the package with `pnpm add -D github:BinBopHQ/skills#<commit>`. Run `pnpm exec lint-writing <file.md|file.txt>` or pipe text to `pnpm exec lint-writing --stdin`. Use `pnpm exec lint-writing --repo` to check Markdown in a Git repository. The repository check also reviews tracked and unignored HTML and Astro page text with Vale and saves reports in `.cache/writehuman/`.

The package includes Vale for macOS, Linux, and Windows on x64 and ARM64. Installing the skill alone does not install the package. The check fails on Vale errors or a writehuman score above 133.2; a repository may override that limit in `.writehuman.json`.

The `handbook` repository describes BinBop's product and working practices, including Ready, Set, Go. Each repository's README and CONTRIBUTING.md explain its own purpose and how to work there.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to change and check shared guidance.

## History

See the [commit history](https://github.com/BinBopHQ/skills/commits/main/) for changes to this repository.
