import { test } from "node:test";
import assert from "node:assert/strict";
import { minifyCss } from "./css.mjs";

test("minifyCss strips comments and collapses whitespace", () => {
  const input = `
    /* a comment */
    .foo {
      color: red;
      margin: 0px;
    }
  `;
  const result = minifyCss(input);
  assert.doesNotMatch(result, /\/\* a comment \*\//);
  assert.ok(result.length < input.length);
  assert.match(result, /\.foo\{color:red;margin:0\}/);
});
