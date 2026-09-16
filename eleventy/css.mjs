import CleanCSS from "clean-css";

export function minifyCss(css) {
  return new CleanCSS({}).minify(css).styles;
}
