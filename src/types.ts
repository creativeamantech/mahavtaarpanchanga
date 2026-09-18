export interface Planet {
  id: string;
  name: string;
  englishName: string;
  deity: string;
  dhyanMantra: string;
  gayatriMantra: string;
  vedoktaMantra: string;
  beejMantra: string;
  japCount: string;
  samidha: string;
  gemstone: string;
  direction: string;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    lightBg: string;
  };
}
