const fs = require('fs');

let content = fs.readFileSync('src/components/ApplicationStatusView.tsx', 'utf8');

content = content.replace(/\\\`/g, '`');

fs.writeFileSync('src/components/ApplicationStatusView.tsx', content);
