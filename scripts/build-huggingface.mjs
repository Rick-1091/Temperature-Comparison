import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(projectRoot, "index.html"), "utf8");
const css = readFileSync(join(projectRoot, "src", "styles.css"), "utf8");
const js = readFileSync(join(projectRoot, "src", "app.js"), "utf8");

const stylesheet = '<link rel="stylesheet" href="src/styles.css">';
const script = '<script src="src/app.js"></script>';
if (!html.includes(stylesheet) || !html.includes(script)) {
  throw new Error("Source asset references changed; update the Hugging Face builder.");
}

const bundled = html
  .replace(stylesheet, `<style>\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`)
  .replace(script, `<script>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`);

const destination = join(projectRoot, "huggingface");
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "index.html"), bundled, "utf8");
console.log("Built huggingface/index.html (self-contained CSS and JavaScript)");

