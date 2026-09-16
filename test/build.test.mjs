import { test } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

test("site builds and renders the homepage", async () => {
  const elev = new Eleventy("src", "_site", {
    configPath: "eleventy.config.js",
  });
  const results = await elev.toJSON();
  const home = results.find((page) => page.url === "/");
  assert.ok(home, "expected a page at /");
  assert.match(home.content, /href="\/posts\//);
});
