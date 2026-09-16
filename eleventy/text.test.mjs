import { test } from "node:test";
import assert from "node:assert/strict";
import { firstSentence, readingTime, firstBodyImage } from "./text.mjs";

test("firstSentence strips HTML and returns just the first sentence", () => {
  const html = "<p>Routes we did together. This is the second sentence.</p>";
  assert.equal(firstSentence(html), "Routes we did together.");
});

test("firstSentence falls back to the whole text when there's no terminal punctuation", () => {
  const html = "<p>No punctuation here</p>";
  assert.equal(firstSentence(html), "No punctuation here");
});

test("firstSentence truncates an overly long first sentence with an ellipsis", () => {
  const longSentence = "word ".repeat(50).trim() + ".";
  const html = `<p>${longSentence}</p>`;
  const result = firstSentence(html, { maxLength: 40 });
  assert.ok(result.length <= 41, `expected <=41 chars, got ${result.length}`);
  assert.match(result, /…$/);
});

test("readingTime estimates minutes from word count at 200wpm, minimum 1", () => {
  const html = `<p>${"word ".repeat(400)}</p>`;
  assert.equal(readingTime(html), 2);
});

test("readingTime never returns less than 1 minute", () => {
  const html = "<p>short</p>";
  assert.equal(readingTime(html), 1);
});

test("firstBodyImage returns the src of the first in-body image", () => {
  const html =
    '<p>So this is the actual beginning.</p><p><img src="/assets/images/blue-sunset/DSC00553-1024x768.jpg" alt="Photo"></p>';
  assert.equal(
    firstBodyImage(html),
    "/assets/images/blue-sunset/DSC00553-1024x768.jpg"
  );
});

test("firstBodyImage returns null when the post has no images", () => {
  assert.equal(firstBodyImage("<p>No images here.</p>"), null);
});

