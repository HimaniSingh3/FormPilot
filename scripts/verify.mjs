import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const required = [
  "index.html",
  "package.json",
  "vite.config.js",
  "src/main.js",
  "src/config/constants.js",
  "src/data/fieldTypes.js",
  "src/data/templates.js",
  "src/core/dom.js",
  "src/core/state.js",
  "src/services/exporter.js",
  "src/services/projectIO.js",
  "src/services/storage.js",
  "src/services/validation.js",
  "src/utils/download.js",
  "src/utils/escape.js",
  "src/utils/id.js",
  "src/styles/base.css",
  "src/styles/layout.css",
  "src/styles/components.css",
  "src/styles/forms.css",
  "src/styles/themes.css",
  "src/styles/responsive.css",
  "public/logo.svg"
];

for (const file of required) {
  await stat(join(root, file));
}

const banned = ["node_modules", "dist", ".vite", ".cache", ".DS_Store"];
const allFiles = await listFiles(root);
const badFiles = allFiles.filter((file) => banned.some((item) => file.includes(`/${item}/`) || file.endsWith(`/${item}`)));

if (badFiles.length) {
  throw new Error(`Unexpected generated/cache files found: ${badFiles.join(", ")}`);
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

if (!packageJson.scripts?.dev || !packageJson.scripts?.build) {
  throw new Error("package.json is missing dev/build scripts.");
}

console.log(`Verified ${required.length} required files and ${allFiles.length} total files.`);

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}
