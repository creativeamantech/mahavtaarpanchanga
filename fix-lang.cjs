const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const files = execSync('grep -rl "lang === \\"sa\\"" src/').toString().trim().split("\n");

files.forEach((f) => {
  if (!f) return;
  let text = fs.readFileSync(f, "utf8");

  // Replace patterns like:
  // lang === "hi" ? A : lang === "sa" ? B : C
  // with: lang === "hi" ? A : C
  // We'll use a regex that matches `lang === "sa" ? (something) : (something)`
  // Wait, regex for nested ternaries is hard. Let's do it with a simple AST parser or just manual replacements for the most common ones.

  // 1. : lang === "sa" ? "..." :
  text = text.replace(/:\s*lang === "sa"\s*\?\s*(`[^`]*`|"[^"]*"|'[^']*')\s*:/g, ":");

  // 2. : lang === "sa" ? (...) :
  text = text.replace(/:\s*lang === "sa"\s*\?\s*\([^)]*\)\s*:/g, ":");

  // 3. ? lang === "sa" ? A : B
  text = text.replace(/\?\s*lang === "sa"\s*\?\s*([^:]+)\s*:\s*([^:]+)\s*:/g, "? $2 :");

  // Let's just remove "sa" from the UI options in SettingsModal.tsx
  if (f.includes("SettingsModal.tsx")) {
    text = text.replace(/<option value="sa">Sanskrit \(संस्कृतम्\)<\/option>/g, "");
  }

  fs.writeFileSync(f, text);
});

console.log("Replaced simple SA ternaries.");
