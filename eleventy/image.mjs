import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
import sharp from "sharp";

export async function generateImageHtml(inputDir, outputDir, src, alt, { sizes = "100vw", eager = false, viewTransitionName = null, backgroundColor = null } = {}) {
  const inputPath = path.join(inputDir, src);
  const imageOutputDir = path.join(outputDir, "assets/generated/");
  fs.mkdirSync(imageOutputDir, { recursive: true });
  const metadata = await Image(inputPath, {
    widths: [400, 800, 1200],
    formats: ["avif", "webp", "jpeg"],
    outputDir: imageOutputDir,
    urlPath: "/assets/generated/",
  });
  const style = [
    // Same name on a post's hero image and its card thumbnail is what
    // tells the browser to morph the actual photo across the navigation
    // instead of just cross-fading the whole page.
    viewTransitionName && `view-transition-name: ${viewTransitionName}`,
    // Paints the picture's own average color immediately, so there's no
    // flash of blank space while the real image is still loading.
    backgroundColor && `background-color: ${backgroundColor}`,
  ].filter(Boolean).join("; ");

  return Image.generateHTML(
    metadata,
    {
      alt,
      sizes,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
      ...(eager ? { fetchpriority: "high" } : {}),
    },
    style ? { pictureAttributes: { style } } : {}
  );
}

// Average color of the source image (downsampled to a single pixel), for
// use as a placeholder background while the real image is still loading -
// closer to the actual photo than a flat gray box.
export async function getImageDominantColor(inputDir, src) {
  if (!src) return null;
  const inputPath = path.join(inputDir, src);
  const { data } = await sharp(inputPath)
    .resize(1, 1, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = data;
  return `rgb(${r} ${g} ${b})`;
}

// Just the URL of a single optimised JPEG, for use in og:image/twitter:image
// meta tags (social platforms fetch these directly and don't run <picture>
// negotiation, so they need one concrete URL, not a responsive source set).
export async function generateOgImageUrl(inputDir, outputDir, src) {
  const inputPath = path.join(inputDir, src);
  const imageOutputDir = path.join(outputDir, "assets/generated/");
  fs.mkdirSync(imageOutputDir, { recursive: true });
  const metadata = await Image(inputPath, {
    widths: [1200],
    formats: ["jpeg"],
    outputDir: imageOutputDir,
    urlPath: "/assets/generated/",
  });
  return metadata.jpeg[0].url;
}

// height/width ratio of the source image, so callers can compute a real
// contain-intrinsic-size instead of guessing one flat placeholder height
// for every card regardless of what the actual photo's shape is.
export async function getImageAspectRatio(inputDir, outputDir, src) {
  if (!src) return 0.75;
  const inputPath = path.join(inputDir, src);
  const imageOutputDir = path.join(outputDir, "assets/generated/");
  fs.mkdirSync(imageOutputDir, { recursive: true });
  const metadata = await Image(inputPath, {
    widths: [400],
    formats: ["jpeg"],
    outputDir: imageOutputDir,
    urlPath: "/assets/generated/",
  });
  const { width, height } = metadata.jpeg[0];
  return height / width;
}
