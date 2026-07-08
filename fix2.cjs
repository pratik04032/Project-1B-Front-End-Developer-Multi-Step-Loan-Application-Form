const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /Object\.assign\(flatErrors, stepErrors\[Number\(stepNum\)\]\);/,
  "const errs = stepErrors[Number(stepNum)]; Object.keys(errs).forEach(k => flatErrors[k] = t(errs[k]));"
);
fs.writeFileSync('src/App.tsx', content);
