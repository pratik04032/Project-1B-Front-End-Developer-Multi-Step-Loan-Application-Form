const fs = require('fs');
let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');

const tFunction = `
  const t = (key: string): string => {
    const langDict = (translations as any)[language];
    if (langDict && key in langDict) {
      return langDict[key];
    }
    // Fallback to English
    const engDict = (translations as any)["en"];
    let englishText = key;
    if (engDict && key in engDict) {
      englishText = engDict[key];
    }
    
    // If not English and we don't have a translation, show placeholder prefix
    if (language !== "en") {
      // For testing/placeholder purposes, prefix the string with language code
      return \`[\${language.toUpperCase()}] \${englishText}\`;
    }
    return englishText;
  };
`;

content = content.replace(
  /const t = \(key: string\): string => \{[\s\S]*?return key;\n  \};/,
  tFunction.trim()
);

fs.writeFileSync('src/context/LanguageContext.tsx', content);
