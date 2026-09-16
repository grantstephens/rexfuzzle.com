import { test } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

async function buildFixtureSite() {
  const elev = new Eleventy(
    "test/__fixtures__/site",
    "_site_test_feed",
    { configPath: "eleventy.config.js" }
  );
  return elev.toJSON();
}

test("RSS feed includes one entry per post", async () => {
  const results = await buildFixtureSite();
  const feed = results.find((page) => page.url === "/feed/feed.xml");
  assert.ok(feed, "expected /feed/feed.xml");
  const entryCount = (feed.content.match(/<entry>/g) || []).length;
  assert.equal(entryCount, 3, "expected one entry per fixture post");
});

test("sitemap includes the homepage, tag pages, and one url per post", async () => {
  const results = await buildFixtureSite();
  const sitemap = results.find((page) => page.url === "/sitemap.xml");
  assert.ok(sitemap, "expected /sitemap.xml");
  assert.match(sitemap.content, /<loc>https:\/\/rexfuzzle\.com\/<\/loc>/);
  assert.match(sitemap.content, /<loc>https:\/\/rexfuzzle\.com\/tags\/<\/loc>/);
  assert.match(sitemap.content, /<loc>https:\/\/rexfuzzle\.com\/tags\/photography\/<\/loc>/);
  assert.match(sitemap.content, /<loc>https:\/\/rexfuzzle\.com\/tags\/travel\/<\/loc>/);
  const urlCount = (sitemap.content.match(/<url>/g) || []).length;
  // 3 fixture posts + homepage + /tags/ + 2 distinct tags (photography, travel)
  assert.equal(urlCount, 7);
});
