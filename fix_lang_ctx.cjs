const fs = require('fs');
let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');
content = content.replace(
  /if \(saved === "hi" \|\| saved === "or" \|\| saved === "en"\) \{/,
  'if (["en", "hi", "or", "bn", "te", "ta", "mr"].includes(saved || "")) {'
);
fs.writeFileSync('src/context/LanguageContext.tsx', content);
