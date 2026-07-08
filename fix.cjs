const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /filteredErrors\[key\] = currentErrors\[key\];/,
  "filteredErrors[key] = t(currentErrors[key]);"
);
fs.writeFileSync('src/App.tsx', content);
