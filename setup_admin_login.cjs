const fs = require('fs');

let content = fs.readFileSync('src/components/AdminLoginPortal.tsx', 'utf8');

// Replace activeTab with just "admin" logic
content = content.replace(/const \[activeTab, setActiveTab\] = useState<"applicant" \| "admin">\("applicant"\);\n/, '');
content = content.replace(/activeTab/g, '"admin"');
content = content.replace(/"admin" === "admin"/g, 'true');
content = content.replace(/"admin" === "applicant"/g, 'false');

// Remove tab switcher UI
const tabSwitcherRegex = /\{\/\* Tab Switcher \*\/\}[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(tabSwitcherRegex, '');

// Clean up {true ? ... : ...} in JSX
content = content.replace(/\{true \? "Admin Email Address" : "Applicant Email Address"\}/g, '"Admin Email Address"');
content = content.replace(/\{true \? "admin@lendswift\.com" : "you@example\.com"\}/g, '"admin@lendswift.com"');

// Simplify password field logic
content = content.replace(/\{true && \(/, '');
// Since we removed `{true && (`, we need to find the matching closing `)}` and remove it
content = content.replace(/<\/div>\s*\)\}/, '</div>');

// Only allow admin login in handleLogin
const newHandleLogin = `
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isCaptchaVerified) {
      setError(
        language === "hi"
          ? "कृपया 'मैं रोबोट नहीं हूँ' सत्यापन पूरा करें।"
          : language === "or"
          ? "ଦୟାକରି 'ମୁଁ ରୋବର୍ଟ ନୁହେଁ' ଯାଞ୍ଚ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।"
          : "Please complete the 'I'm not a robot' verification."
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === "admin@lendswift.com" && password === "admin123") {
        triggerWebAuthn({ email: email.trim(), role: "admin" });
      } else if (email.trim().toLowerCase() === "pratikkumarjena04@gmail.com" && password === "admin123") {
        triggerWebAuthn({ email: email.trim(), role: "admin" });
      } else {
        setError(
          language === "hi"
            ? "अमान्य क्रेडेंशियल्स। कृपया admin@lendswift.com और पासवर्ड admin123 का उपयोग करें।"
            : language === "or"
            ? "ଅମାନ୍ୟ କ୍ରେଡେନ୍ସିଆଲ୍ | ଦୟାକରି admin@lendswift.com ଏବଂ ପାସୱାର୍ଡ admin123 ବ୍ୟବହାର କରନ୍ତୁ |"
            : "Invalid administrator credentials. Please use admin@lendswift.com & password admin123"
        );
        setIsLoading(false);
      }
    }, 1000);
  };
`;

content = content.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 1000\);\n  \};/, newHandleLogin);

// Rename component
content = content.replace(/export default function LoginPortal/, 'export default function AdminLoginPortal');

fs.writeFileSync('src/components/AdminLoginPortal.tsx', content);
