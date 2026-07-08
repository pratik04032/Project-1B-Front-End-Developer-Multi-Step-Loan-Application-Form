const fs = require('fs');

const blockRegex = /<div className="flex flex-wrap justify-center gap-2 pt-1">[\s\S]*?<\/div>\s*<\/div>\s*<\/form>/;

['src/components/LoginPortal.tsx', 'src/components/AdminLoginPortal.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(blockRegex, '</div>\n        </form>');
  fs.writeFileSync(file, content);
});
