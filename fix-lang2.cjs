const fs = require("fs");
const { execSync } = require("child_process");

const files = execSync('grep -rl "lang === \\"sa\\"" src/').toString().trim().split("\n");

files.forEach((f) => {
  if (!f) return;
  let text = fs.readFileSync(f, "utf8");

  // Case 1: lang === "sa" ? "..." : lang === "hi" ? "..." : "..."
  text = text.replace(
    /lang\s*===\s*"sa"\s*\?\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[\w\.]+)\s*:\s*lang\s*===\s*"hi"\s*\?/g,
    'lang === "hi" ?',
  );

  // Case 2: lang === "hi" ? "..." : lang === "sa" ? "..." : "..."
  text = text.replace(/:\s*lang\s*===\s*"sa"\s*\?\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[\w\.]+)\s*:/g, ":");

  // Case 3: lang === "hi" || lang === "sa"  => lang === "hi"
  text = text.replace(/lang\s*===\s*"hi"\s*\|\|\s*lang\s*===\s*"sa"/g, 'lang === "hi"');
  text = text.replace(/lang\s*===\s*"sa"\s*\|\|\s*lang\s*===\s*"hi"/g, 'lang === "hi"');

  // Case 4: lang === "sa" ? "..." : "..."
  // If we just had `lang === "sa" ? A : B`, since "sa" is removed, it evaluates to B. So we can replace it directly with B.
  // But wait, there might not be any standalone `lang === "sa" ? A : B` that we want to keep as A.
  // We'll replace it with B.
  text = text.replace(
    /lang\s*===\s*"sa"\s*\?\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[\w\.]+)\s*:\s*((?:"[^"]*"|'[^']*'|`[^`]*`|[\w\.]+))/g,
    "$1",
  );

  // Corner case in FiveAngasCard: lang === "sa" ? "sa" : lang === "hi" ? "hi" : "en"
  text = text.replace(/lang\s*===\s*"sa"\s*\?\s*"sa"\s*:\s*lang\s*===\s*"hi"/g, 'lang === "hi"');

  fs.writeFileSync(f, text);
});
console.log("Done");
