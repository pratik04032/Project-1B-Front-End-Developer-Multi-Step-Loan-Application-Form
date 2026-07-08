const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLoginPortal.tsx', 'utf8');

// fix error closing tag
content = content.replace(
  /<span className="font-medium leading-normal">\{error\}<\/span>\s*<\/div>/,
  '<span className="font-medium leading-normal">{error}</span>\n            </div>\n          )}'
);

// fix password dangling brace
content = content.replace(
  /<\/div>\s*<\/div>\s*\)\}/,
  '</div>\n              </div>'
);

fs.writeFileSync('src/components/AdminLoginPortal.tsx', content);
