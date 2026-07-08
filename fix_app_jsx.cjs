const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\!currentUser \? \(\s*\{isAdminLoginView \? \(/;
content = content.replace(regex, '{!currentUser ? (\n          <>\n            {isAdminLoginView ? (');

const regexEnd = /Admin Access\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\}\s*\)\s*:\s*currentUser\.role === "admin" \? \(/;
content = content.replace(/Admin Access[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\)\}/, '$&            </>\n');

fs.writeFileSync('src/App.tsx', content);
