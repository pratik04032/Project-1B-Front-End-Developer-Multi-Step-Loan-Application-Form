const fs = require('fs');
let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

content = content.replace(/\{\/\* Captcha Verification \*\/\}/, '</div>\n          {/* Captcha Verification */}');

fs.writeFileSync('src/components/LoginPortal.tsx', content);
