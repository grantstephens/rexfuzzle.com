# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Eleventy (11ty) static site for the personal blog "RexFuzzle".
Originally migrated from a self-hosted Ghost blog (the one-time migration
tooling has since been removed - `src/content/posts/*.md` is now the
permanent source of truth; edit those files directly for content changes).
Content is authored in Markdown, built with Eleventy, and deployed to
Cloudflare Pages.

## Common Commands

```bash
npm install       # install dependencies
npm run serve     # start the Eleventy dev server
npm run build     # build the site to _site/
npm test          # run build tests (node:test)
```

## Architecture

- **Content**: `src/content/posts/*.md`, Markdown with YAML frontmatter
  (`title`, `slug`, `date`, `tags`, `description`, `featureImage`). Edit
  these files directly to add/change posts.
- **Templates**: `src/_includes/*.njk` (Nunjucks).
- **Images**: `src/assets/images/<slug>/...`, processed at build time by
  `@11ty/eleventy-img` into responsive AVIF/WebP output under
  `_site/assets/generated/`.
- **Deploy**: Cloudflare Pages, Git-integrated, build command `npm run
  build`, output directory `_site`.

## Notes

- No Ghost `gallery`/`bookmark` card handling — confirmed unused in all
  live content (see `docs/superpowers/specs/` for the full design).
