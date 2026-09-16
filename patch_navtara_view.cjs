const fs = require('fs');
let code = fs.readFileSync('src/components/NavtaraView.tsx', 'utf8');

// Update Props
code = code.replace(
  /theme: AppTheme;\n}/,
  `theme: AppTheme;
  birthNakshatra: number;
  onBirthNakshatraChange?: (n: number) => void;
}`
);

// Update Component Signature and local state
code = code.replace(
  /export function NavtaraView\(\{ data, lang, theme \}: NavtaraViewProps\) \{\n  const \[birthNakshatra, setBirthNakshatra\] = useState<number>\(1\);\n  const \[table, setTable\] = useState<NavtaraResult\[\]>\(\[\]\);\n  \n  useEffect\(\(\) => \{\n    \/\/ Try to load from local storage\n    const saved = localStorage\.getItem\("mahavtaar_birth_nakshatra"\);\n    if \(saved\) \{\n      setBirthNakshatra\(parseInt\(saved, 10\)\);\n    \}\n  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    setTable\(generateNavtaraTable\(birthNakshatra\)\);\n    localStorage\.setItem\("mahavtaar_birth_nakshatra", birthNakshatra\.toString\(\)\);\n  \}, \[birthNakshatra\]\);/s,
  `export function NavtaraView({ data, lang, theme, birthNakshatra, onBirthNakshatraChange }: NavtaraViewProps) {
  const [table, setTable] = useState<NavtaraResult[]>([]);
  
  useEffect(() => {
    setTable(generateNavtaraTable(birthNakshatra));
  }, [birthNakshatra]);`
);

// Update the select onChange
code = code.replace(
  /onChange=\{\(e\) => setBirthNakshatra\(parseInt\(e\.target\.value, 10\)\)\}/,
  `onChange={(e) => onBirthNakshatraChange?.(parseInt(e.target.value, 10))}`
);

fs.writeFileSync('src/components/NavtaraView.tsx', code);
