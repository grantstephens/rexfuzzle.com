import { test } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

test("HTML output has collapsed whitespace between tags", async () => {
  const elev = new Eleventy(
    "test/__fixtures__/site",
    "_site_test_minify",
    { configPath: "eleventy.config.js" }
  );
  const results = await elev.toJSON();
  const home = results.find((page) => page.url === "/");
  assert.doesNotMatch(home.content, />\s{2,}</);
});
