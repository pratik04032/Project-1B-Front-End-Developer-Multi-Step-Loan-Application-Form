const fs = require('fs');

let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
content = content.replace('status: "PRE-APPROVED",', 'status: "UNDER_VERIFICATION",');
fs.writeFileSync('src/lib/firebase.ts', content);
