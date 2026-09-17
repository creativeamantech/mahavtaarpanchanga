const fs = require('fs');
const file = 'src/components/TattvaView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const currentNadi = useMemo(() => {
    if (!panchangaData) return "ida";
    const activeTithiNum = currentTithiTattva ? (currentTithiTattva.paksha === "Krishna" ? currentTithiTattva.tithi + 15 : currentTithiTattva.tithi) : (panchangaData.tithi?.[0]?.number || 1);
    return getCanonicalNadiAtTime(
      now,
      activeTithiNum,
      panchangaData.sunrise,
      panchangaData.sunset,
      panchangaData.moonrise,
      panchangaData.moonset,
      panchangaData.timezone,
    );
  }, [now, panchangaData, currentTithiTattva]);`;

const repStr = `  const currentNadi = useMemo(() => {
    if (!currentTithiTattva) return "ida";
    // Tithi Swara alternates every 60 minutes starting from the Tithi's start time
    const msElapsed = now - currentTithiTattva.startTime;
    const hoursElapsed = Math.floor(msElapsed / (60 * 60 * 1000));
    const isOpposite = (hoursElapsed % 2) !== 0;
    
    if (isOpposite) {
      return currentTithiTattva.startNadi === "ida" ? "pingala" : "ida";
    }
    return currentTithiTattva.startNadi;
  }, [now, currentTithiTattva]);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched currentNadi');
