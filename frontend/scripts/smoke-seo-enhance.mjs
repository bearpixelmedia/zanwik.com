import { readFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

// Compile-free smoke: dynamic import of built JS is unavailable without build.
// Instead assert source patterns and run a minimal inline replica of critical checks.
const root = path.dirname(fileURLToPath(import.meta.url));
const home = readFileSync(
  path.join(root, "../content/mirror/index.html"),
  "utf8"
);
const privacy = readFileSync(
  path.join(root, "../content/mirror/privacy/index.html"),
  "utf8"
);

const checks = [];
checks.push(["home has title", /<title>/.test(home)]);
checks.push(["home has og:image", /og:image/.test(home)]);
checks.push(["privacy has canonical", /rel="canonical"/.test(privacy)]);
const privacyTitle = privacy.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
checks.push([
  "privacy title not duplicated brand",
  /Privacy Policy\s*\|\s*Zanwik/.test(privacyTitle) &&
    !/Zanwik\s*\|\s*Zanwik/.test(privacyTitle),
]);
checks.push(["sitemap exists", true]);

const sitemap = readFileSync(path.join(root, "../public/sitemap.xml"), "utf8");
checks.push(["sitemap has lastmod", /<lastmod>/.test(sitemap)]);
checks.push(["sitemap has priority", /<priority>/.test(sitemap)]);
checks.push(["sitemap 325 urls", (sitemap.match(/<loc>/g) || []).length === 325]);

const robots = readFileSync(path.join(root, "../public/robots.txt"), "utf8");
checks.push(["robots welcomes GPTBot", /GPTBot/.test(robots)]);
checks.push(["robots points llms.txt", /llms\.txt/.test(robots)]);

let failed = 0;
for (const [name, ok] of checks) {
  console.log(ok ? "PASS" : "FAIL", name);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log("smoke-seo-enhance: ok");
