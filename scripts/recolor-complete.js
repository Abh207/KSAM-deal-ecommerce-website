import fs from "fs";
import path from "path";

// 1. Files to update
const DIRS_TO_SCAN = [
  "src",
  "public"
];

const ROOT_FILES = fs.readdirSync(".").filter(f => f.endsWith(".html"));

// Replacements to apply across JSX, JS, CSS, HTML
const RULES = [
  // Specific Hex patterns
  { search: /#22FF88/gi, replace: "#8cff00" },
  { search: /#22C55E/gi, replace: "#8cff00" },
  { search: /#4ADE80/gi, replace: "#8cff00" },
  { search: /#86EFAC/gi, replace: "#a8ff3e" },
  { search: /#DCFCE7/gi, replace: "rgba(140, 255, 0, 0.14)" },
  { search: /#BBF7D0/gi, replace: "rgba(140, 255, 0, 0.35)" },
  { search: /#00F5A0/gi, replace: "#8cff00" },
  { search: /#10b981/gi, replace: "#8cff00" },
  { search: /#34d399/gi, replace: "#8cff00" },

  // Dark green text on light backgrounds
  { search: /#16A34A/gi, replace: "#448000" },
  { search: /#15803D/gi, replace: "#448000" },
  { search: /#059669/gi, replace: "#448000" },
  { search: /#047857/gi, replace: "#3f7800" },
  { search: /#166534/gi, replace: "#3f7800" },
  { search: /#1b5e20/gi, replace: "#2b5400" },
  { search: /#2e7d32/gi, replace: "#366800" },
  { search: /#08C76A/gi, replace: "#70d900" },
  { search: /#0a9d52/gi, replace: "#448000" },

  // URL encoded SVG strokes
  { search: /%2322ff88/gi, replace: "%238cff00" },
  { search: /%2322FF88/gi, replace: "%238cff00" },
  { search: /%2322c55e/gi, replace: "%238cff00" },

  // Theme color in meta tags
  { search: /<meta name="theme-color" content="#0b1f1a">/gi, replace: '<meta name="theme-color" content="#050a02">' },

  // RGBA patterns
  { search: /rgba\(\s*34\s*,\s*255\s*,\s*136\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { search: /rgba\(\s*34\s*,\s*197\s*,\s*94\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { search: /rgba\(\s*22\s*,\s*163\s*,\s*74\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { search: /rgba\(\s*74\s*,\s*222\s*,\s*128\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { search: /rgba\(\s*0\s*,\s*245\s*,\s*160\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, $1)" },
  { search: /rgba\(\s*220\s*,\s*252\s*,\s*231\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, 0.14)" },
  { search: /rgba\(\s*187\s*,\s*247\s*,\s*208\s*,\s*([0-9.]+)\s*\)/gi, replace: "rgba(140, 255, 0, 0.35)" }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const rule of RULES) {
    if (rule.search.test(content)) {
      content = content.replace(rule.search, rule.replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
    return 1;
  }
  return 0;
}

function walkDir(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        count += walkDir(full);
      }
    } else if (/\.(jsx|js|css|html|json)$/.test(entry.name)) {
      count += processFile(full);
    }
  }
  return count;
}

let total = 0;
for (const dir of DIRS_TO_SCAN) {
  total += walkDir(dir);
}
for (const file of ROOT_FILES) {
  total += processFile(file);
}

// Also process tailwind.config.js
if (fs.existsSync("tailwind.config.js")) {
  total += processFile("tailwind.config.js");
}

console.log(`Finished! Total files updated: ${total}`);

