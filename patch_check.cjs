const fs = require('fs');
let code = fs.readFileSync('src/PanchangaApp.tsx', 'utf8');

code = code.replace(
  /Hourglass\n\} from "lucide-react";/,
  `Hourglass,\n  Check\n} from "lucide-react";`
);

fs.writeFileSync('src/PanchangaApp.tsx', code);
