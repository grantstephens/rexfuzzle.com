import { test } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

async function buildFixtureSite() {
  const elev = new Eleventy(
    "test/__fixtures__/site",
    "_site_test_templates",
    { configPath: "eleventy.config.js" }
  );
  return elev.toJSON();
}

test("home page lists posts newest first", async () => {
  const results = await buildFixtureSite();
  const home = results.find((page) => page.url === "/");
  const firstIndex = home.content.indexOf("First Post");
  const secondIndex = home.content.indexOf("Second Post");
  assert.ok(secondIndex < firstIndex, "newest post should list first");
});

test("home page is wrapped in the base layout, not rendered standalone", async () => {
  const results = await buildFixtureSite();
  const home = results.find((page) => page.url === "/");
  assert.match(
    home.content,
    /^<!doctype html>/i,
    "homepage must declare layout: base.njk so it gets <head>/nav/stylesheet, not just its own fragment"
  );
});

test("each post renders at /posts/<slug>/", async () => {
  const results = await buildFixtureSite();
  const post = results.find((page) => page.url === "/posts/first-post/");
  assert.ok(post, "expected /posts/first-post/");
  assert.match(post.content, /Hello from the first post\./);
});

test("tag pages list only posts with that tag", async () => {
  const results = await buildFixtureSite();
  const travelPage = results.find((page) => page.url === "/tags/travel/");
  assert.ok(travelPage);
  assert.match(travelPage.content, /Second Post/);
  assert.doesNotMatch(travelPage.content, /First Post/);
});

test("post pages include OG/meta tags with an absolute canonical URL", async () => {
  const results = await buildFixtureSite();
  const post = results.find((page) => page.url === "/posts/first-post/");
  assert.match(post.content, /<meta property="og:type" content="article">/);
  assert.match(post.content, /<meta property="og:title" content="First Post">/);
  assert.match(
    post.content,
    /<link rel="canonical" href="https:\/\/rexfuzzle\.com\/posts\/first-post\/">/
  );
});

test("a post with no frontmatter description falls back to its own first sentence", async () => {
  const results = await buildFixtureSite();
  const post = results.find((page) => page.url === "/posts/second-post/");
  assert.doesNotMatch(post.content, /<meta name="description" content="">/);
  assert.match(
    post.content,
    /<meta name="description" content="Hello from the second post\.">/
  );
});
