#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: npm run new-post -- "Post Title"');
  process.exit(1);
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slug = slugify(title);
if (!slug) {
  console.error(`Couldn't derive a slug from "${title}" - pick a title with some letters/numbers in it.`);
  process.exit(1);
}

const postsDir = path.join(process.cwd(), "src/content/posts");
const postPath = path.join(postsDir, `${slug}.md`);
const imagesDir = path.join(process.cwd(), "src/assets/images", slug);

if (fs.existsSync(postPath)) {
  console.error(`Already exists: ${path.relative(process.cwd(), postPath)}`);
  process.exit(1);
}

const date = new Date().toISOString().replace(/\.\d{3}Z$/, ".000Z");

const frontmatter = `---
title: ${title}
slug: ${slug}
date: ${date}
tags: []
description: ''
---

`;

fs.mkdirSync(postsDir, { recursive: true });
fs.writeFileSync(postPath, frontmatter);
fs.mkdirSync(imagesDir, { recursive: true });

console.log(`Created ${path.relative(process.cwd(), postPath)}`);
console.log(`Image folder ready at ${path.relative(process.cwd(), imagesDir)}/`);
console.log(`\nNext:`);
console.log(`  - Write the post, drop any photos into that image folder`);
console.log(`  - Set featureImage in the frontmatter if the post has a hero photo`);
console.log(`  - npm run serve to preview`);
