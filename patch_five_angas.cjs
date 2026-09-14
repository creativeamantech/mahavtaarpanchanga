const fs = require("fs");
let code = fs.readFileSync("src/components/FiveAngasCard.tsx", "utf8");

const primaryEndsBlock = `          {primary.starts ? (
            <div className={\`flex flex-col text-[10px] sm:text-[11px] font-mono text-right \${isNight ? "text-amber-200" : "text-amber-900"}\`}>
              <span>Starts: {primary.starts}</span>
              <span>Ends: {primary.ends || "—"}</span>
            </div>
          ) : primary.ends ? (
            <span
              className={\`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border font-mono \${
                isNight
                  ? "bg-amber-950/70 text-amber-200 border-amber-700/60"
                  : "bg-amber-100/90 text-amber-900 border-amber-300/80"
              }\`}
            >
              {t.endsAt} {primary.ends}
            </span>
          ) : (`;

code = code.replace(
  /          \{primary\.ends \? \([\s\S]*?\{t\.endsAt\} \{primary\.ends\}\n            <\/span>\n          \) : \(/,
  primaryEndsBlock,
);

const secondaryEndsBlock = `              {secondary.starts ? (
                <div className={\`flex flex-col text-[10px] sm:text-[11px] font-mono text-right \${isNight ? "text-amber-300/80" : "text-amber-800"}\`}>
                  <span>Starts: {secondary.starts}</span>
                  <span>Ends: {secondary.ends || "—"}</span>
                </div>
              ) : secondary.ends ? (
                <span
                  className={\`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border font-mono \${
                    isNight
                      ? "bg-amber-950/40 text-amber-300/80 border-amber-800/40"
                      : "bg-amber-50/80 text-amber-800 border-amber-200/60"
                  }\`}
                >
                  {t.endsAt} {secondary.ends}
                </span>
              ) : (`;

code = code.replace(
  /              \{secondary\.ends \? \([\s\S]*?\{t\.endsAt\} \{secondary\.ends\}\n                <\/span>\n              \) : \(/,
  secondaryEndsBlock,
);

fs.writeFileSync("src/components/FiveAngasCard.tsx", code);
