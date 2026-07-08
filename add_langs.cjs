const fs = require('fs');

let content = fs.readFileSync('src/utils/translations.ts', 'utf8');

// Add to Language type
content = content.replace(
  /export type Language = "en" \| "hi" \| "or";/,
  'export type Language = "en" | "hi" | "or" | "bn" | "te" | "ta" | "mr";'
);

// Add to LANGUAGES array
const newLangs = `
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" }
`;
content = content.replace(
  /\{ code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" \}\n\];/,
  `{ code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },${newLangs}];`
);

// Add empty objects for bn, te, ta, mr in translations
content = content.replace(
  /};$/,
  `  bn: {},\n  te: {},\n  ta: {},\n  mr: {}\n};`
);

fs.writeFileSync('src/utils/translations.ts', content);
