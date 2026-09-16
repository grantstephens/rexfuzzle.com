import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Eleventy from "@11ty/eleventy";

test("body images are upgraded to a responsive picture element", async () => {
  const elev = new Eleventy(
    "test/__fixtures__/site",
    "_site_test_images",
    { configPath: "eleventy.config.js" }
  );
  await elev.write();

  const html = fs.readFileSync("_site_test_images/posts/image-post/index.html", "utf8");
  assert.match(html, /<picture[ >]/);
  assert.match(html, /srcset=/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /alt="A test photo"/);

  fs.rmSync("_site_test_images", { recursive: true, force: true });
});

test("the feature image shortcode renders a picture element", async () => {
  const elev = new Eleventy(
    "test/__fixtures__/site",
    "_site_test_images",
    { configPath: "eleventy.config.js" }
  );
  await elev.write();

  const html = fs.readFileSync("_site_test_images/posts/image-post/index.html", "utf8");
  const pictureCount = (html.match(/<picture[ >]/g) || []).length;
  assert.equal(pictureCount, 2, "expected one picture for the feature image and one for the body image");

  fs.rmSync("_site_test_images", { recursive: true, force: true });
});
