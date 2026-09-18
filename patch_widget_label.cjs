const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{lang === "hi" ? "आगामी प्रमुख गोचर" : "Next Major Ingress"}',
  '{lang === "hi" ? "आगामी गोचर (Next Ingress)" : "Next Ingress"}'
);

fs.writeFileSync(file, content);
console.log('patched label');
