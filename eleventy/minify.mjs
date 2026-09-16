import { minify } from "html-minifier-terser";

export function minifyHtml(content) {
  return minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
}
