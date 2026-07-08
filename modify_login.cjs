const fs = require('fs');

let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

// Remove activeTab
content = content.replace(/const \[activeTab, setActiveTab\] = useState<"applicant" \| "admin">\("applicant"\);\n/, '');

// Replace activeTab references with "applicant"
content = content.replace(/activeTab/g, '"applicant"');
content = content.replace(/"applicant" === "admin"/g, 'false');
content = content.replace(/"applicant" === "applicant"/g, 'true');

// Remove tab switcher UI
const tabSwitcherRegex = /\{\/\* Tab Switcher \*\/\}[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(tabSwitcherRegex, '');

fs.writeFileSync('src/components/LoginPortal.tsx', content);
