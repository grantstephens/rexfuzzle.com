import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import subsetFont from "subset-font";
import { decodeHTML } from "entities";

const FONTS = [
  { family: "IBM Plex Sans", weight: 400, src: "@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-Regular.woff2" },
  { family: "IBM Plex Sans", weight: 600, src: "@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-SemiBold.woff2" },
  { family: "IBM Plex Sans", weight: 700, src: "@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-Bold.woff2" },
  { family: "IBM Plex Mono", weight: 400, src: "@ibm/plex-mono/fonts/complete/woff2/IBMPlexMono-Regular.woff2" },
];

// A small guaranteed baseline on top of whatever the site's actual content
// scan turns up, so a font never ships missing basic ASCII just because no
// post happened to use e.g. a digit or a semicolon.
const BASELINE_CHARS =
  " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
  ".,:;!?'\"()-/&@#%";

function collectSiteText(outputDir) {
  const chars = new Set(BASELINE_CHARS);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        const html = fs
          .readFileSync(full, "utf8")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ");
        for (const ch of decodeHTML(html)) chars.add(ch);
      }
    }
  };
  walk(outputDir);
  return [...chars].join("");
}

// Subsets IBM Plex Sans/Mono down to only the glyphs this site's built
// output actually uses, writes each as a content-hashed (thus immutably
// cacheable) woff2 under outputDir/assets/fonts/, and returns the @font-face
// CSS block referencing them - self-hosted, so no Google Fonts round trip.
export async function buildSubsetFonts(outputDir) {
  const text = collectSiteText(outputDir);
  const fontsDir = path.join(outputDir, "assets/fonts");
  fs.mkdirSync(fontsDir, { recursive: true });

  const rules = [];
  for (const { family, weight, src } of FONTS) {
    const sourcePath = path.join(process.cwd(), "node_modules", src);
    const sourceBuffer = fs.readFileSync(sourcePath);
    const subsetBuffer = await subsetFont(sourceBuffer, text, { targetFormat: "woff2" });
    const hash = crypto.createHash("sha256").update(subsetBuffer).digest("hex").slice(0, 10);
    const filename = `${family.replace(/\s+/g, "-")}-${weight}.${hash}.woff2`;
    fs.writeFileSync(path.join(fontsDir, filename), subsetBuffer);
    rules.push(
      `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(/assets/fonts/${filename}) format("woff2")}`
    );
  }
  return rules.join("");
}
