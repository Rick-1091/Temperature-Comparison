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

const stylesheet = '<link rel="stylesheet" href="src/styles.css">';
const dataScript = '<script src="src/data.js"></script>';
const script = '<script src="src/app.js"></script>';
if (!html.includes(stylesheet) || !html.includes(dataScript) || !html.includes(script)) {
  throw new Error("Source asset references changed; update the Hugging Face builder.");
}

const bundled = html
  .replace(stylesheet, `<style>\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`)
  .replace(dataScript, `<script>\n${data.replace(/<\/script/gi, "<\\/script")}\n</script>`)
  .replace(script, `<script>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`);

const destination = join(projectRoot, "huggingface");
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "index.html"), bundled, "utf8");
console.log("Built huggingface/index.html (self-contained CSS and JavaScript)");

