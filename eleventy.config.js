import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { generateImageHtml, generateOgImageUrl, getImageAspectRatio, getImageDominantColor } from "./eleventy/image.mjs";
import { minifyHtml } from "./eleventy/minify.mjs";
import { minifyCss } from "./eleventy/css.mjs";
import { buildSubsetFonts } from "./eleventy/fonts.mjs";
import { firstSentence, readingTime, firstBodyImage } from "./eleventy/text.mjs";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("firstSentence", (html) => firstSentence(html || ""));
  eleventyConfig.addFilter("readingTime", (html) => readingTime(html || ""));
  eleventyConfig.addFilter("firstBodyImage", (html) => firstBodyImage(html || ""));

  // Which post (by slug) will render the first image on a card grid -
  // used to eager-load just that one image instead of every card image.
  eleventyConfig.addFilter("firstImagePostSlug", (posts) => {
    for (const post of posts) {
      const img = post.data.featureImage || firstBodyImage(post.templateContent || "");
      if (img) return post.data.slug;
    }
    return null;
  });

  // A post's number is its fixed position in chronological (oldest-first)
  // order, not its position in the newest-first display list - otherwise
  // every post's number would shift each time a new one gets published.
  eleventyConfig.addFilter("postNumber", (post, oldestFirst) =>
    oldestFirst.findIndex((p) => p.data.slug === post.data.slug) + 1
  );

  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  eleventyConfig.addFilter("readableDate", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy")
  );

  eleventyConfig.addFilter("htmlDateString", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd")
  );

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("**/content/posts/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("postsOldestFirst", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("**/content/posts/*.md")
      .sort((a, b) => a.date - b.date)
  );

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const posts = collectionApi.getFilteredByGlob("**/content/posts/*.md");
    const tags = new Set();
    posts.forEach((post) => {
      (post.data.tags || []).forEach((tag) => tags.add(tag));
    });
    return [...tags].sort();
  });

  eleventyConfig.addFilter("postsByTag", (posts, tag) =>
    posts.filter((post) => (post.data.tags || []).includes(tag))
  );

  eleventyConfig.addFilter("postBySlug", (posts, slug) =>
    posts.find((post) => post.data.slug === slug)
  );

  eleventyConfig.addAsyncShortcode("image", (src, alt, sizes, eager, viewTransitionName, backgroundColor) =>
    generateImageHtml(
      eleventyConfig.directories.input,
      eleventyConfig.directories.output,
      src,
      alt,
      {
        sizes: sizes || "100vw",
        eager: !!eager,
        viewTransitionName: viewTransitionName || null,
        backgroundColor: backgroundColor || null,
      }
    )
  );

  eleventyConfig.addAsyncShortcode("ogImageUrl", (src) =>
    generateOgImageUrl(
      eleventyConfig.directories.input,
      eleventyConfig.directories.output,
      src
    )
  );

  eleventyConfig.addAsyncFilter("imageAspectRatio", (src) =>
    getImageAspectRatio(
      eleventyConfig.directories.input,
      eleventyConfig.directories.output,
      src
    )
  );

  eleventyConfig.addAsyncFilter("imageDominantColor", (src) =>
    getImageDominantColor(eleventyConfig.directories.input, src)
  );

  eleventyConfig.addTransform("bodyImages", async function (content) {
    if (!this.outputPath || !this.outputPath.endsWith(".html")) return content;
    const imgTagPattern = /<img src="(\/assets\/images\/[^"]+)" alt="([^"]*)">/g;
    const matches = [...content.matchAll(imgTagPattern)];
    let result = content;
    for (const match of matches) {
      const [fullTag, src, alt] = match;
      const backgroundColor = await getImageDominantColor(eleventyConfig.directories.input, src);
      const picture = await generateImageHtml(
        eleventyConfig.directories.input,
        eleventyConfig.directories.output,
        src,
        alt,
        { sizes: "(max-width: 680px) 100vw, 620px", backgroundColor }
      );
      result = result.replace(fullTag, picture);
    }
    return result;
  });

  eleventyConfig.addTransform("minifyHtml", function (content) {
    if (!this.outputPath || !this.outputPath.endsWith(".html")) return content;
    return minifyHtml(content);
  });

  // Passthrough copy doesn't process file contents, so the stylesheet is
  // minified as a post-build step instead, once the raw copy is in place.
  // Font subsetting also runs here: it needs the full built HTML output to
  // scan for the site's actual character set, so it can only happen after
  // every page has been written.
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const cssPath = path.join(dir.output, "assets/css/style.css");
    if (!existsSync(cssPath)) return;
    const fontFaceRules = await buildSubsetFonts(dir.output);
    const raw = readFileSync(cssPath, "utf8");
    writeFileSync(cssPath, minifyCss(fontFaceRules + raw));
  });
}
