const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetMatrix = `      {/* View 1: Graha Status Grid (Matrix) */}`;

if (content.includes(targetMatrix)) {
    // We are going to replace the ENTIRE matrix rendering with a simpler list view that matches the clean timeline.
    console.log("Found matrix layout block");
}
