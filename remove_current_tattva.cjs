const fs = require('fs');
const file = 'src/components/TattvaView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /      \{\/\* CURRENT TATTVA \(LIVE STATE\) \*\/\}\s+<div[\s\S]*?<\/div>\s+\{\/\* TITHI TATTVA & NADI \*\/\}/;
const match = content.match(targetRegex);

if (match) {
    const repStr = `      {/* TITHI TATTVA & NADI */}`;
    content = content.replace(targetRegex, repStr);
    fs.writeFileSync(file, content);
    console.log('Removed Current Tattva section');
} else {
    console.log('Could not find Current Tattva section');
}
