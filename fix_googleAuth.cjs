const fs = require('fs');
let content = fs.readFileSync('src/lib/googleAuth.ts', 'utf8');
content = content.replace(
  /import \{ app \} from '\.\/firebase';/,
  `import app from './firebase';`
);
fs.writeFileSync('src/lib/googleAuth.ts', content);
