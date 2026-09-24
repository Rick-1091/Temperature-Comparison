import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = join(projectRoot, "public", "signals");
// The chapter bar only works inside the combined website, so the standalone Space drops it.
const html = readFileSync(join(siteRoot, "index.html"), "utf8")
  .replace(/\s*<link rel="stylesheet" href="chapters\.css">/, "")
  .replace(/<nav class="chapterbar"[\s\S]*?<\/nav>\s*/, "")
  .replace(/\s*<a class="cb-next"[^>]*>[\s\S]*?<\/a>/, "");
const css = readFileSync(join(siteRoot, "src", "styles.css"), "utf8");
const data = readFileSync(join(siteRoot, "src", "data.js"), "utf8");
const js = readFileSync(join(siteRoot, "src", "app.js"), "utf8");
const accuracyCss = readFileSync(join(siteRoot, "src", "accuracy.css"), "utf8");
const accuracyJs = readFileSync(join(siteRoot, "src", "accuracy.js"), "utf8");

const stylesheet = '<link rel="stylesheet" href="src/styles.css">';
const accuracyStylesheet = '<link rel="stylesheet" href="src/accuracy.css">';
const dataScript = '<script src="src/data.js"></script>';
const script = '<script src="src/app.js"></script>';
const accuracyScript = '<script src="src/accuracy.js"></script>';
if ([stylesheet, accuracyStylesheet, dataScript, script, accuracyScript].some((tag) => !html.includes(tag))) {
  throw new Error("Source asset references changed; update the Hugging Face builder.");
}

const inlineStyle = (source) => `<style>\n${source.replace(/<\/style/gi, "<\\/style")}\n</style>`;
const inlineScript = (source) => `<script>\n${source.replace(/<\/script/gi, "<\\/script")}\n</script>`;
// Function replacers keep "$" sequences in the sources from being read as replacement patterns.
const bundled = html
  .replace(stylesheet, () => inlineStyle(css))
  .replace(accuracyStylesheet, () => inlineStyle(accuracyCss))
  .replace(dataScript, () => inlineScript(data))
  .replace(script, () => inlineScript(js))
  .replace(accuracyScript, () => inlineScript(accuracyJs));

const destination = join(projectRoot, "huggingface");
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "index.html"), bundled, "utf8");
console.log("Built huggingface/index.html (self-contained CSS and JavaScript)");

