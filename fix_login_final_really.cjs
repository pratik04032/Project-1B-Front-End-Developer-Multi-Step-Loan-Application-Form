const fs = require('fs');

let content = fs.readFileSync('src/components/AdminLoginPortal.tsx', 'utf8');

// Component name
content = content.replace(/export default function AdminLoginPortal/g, 'export default function LoginPortal');

// Strings
content = content.replace(/"Admin Email Address"/g, '"Applicant Email Address"');
content = content.replace(/"admin@lendswift.com"/g, '"you@example.com"');

// Password field
const pStart = content.indexOf('{/* Password field (Admin only) */}');
const captchaStart = content.indexOf('{/* Captcha Verification */}');
if (pStart !== -1 && captchaStart !== -1) {
  content = content.substring(0, pStart) + '</div>\n          ' + content.substring(captchaStart);
}

// handleLogin
// Regex to precisely match handleLogin method
content = content.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 1000\);\n  \};/, 
`const handleLogin = (e: React.FormEvent) => {
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
      if (!email.trim() || !email.includes("@")) {
        setError(
          language === "hi"
            ? "कृपया एक वैध ईमेल पता दर्ज करें।"
            : language === "or"
            ? "ଦୟାକରି ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ |"
            : "Please enter a valid email address."
        );
      } else {
        triggerWebAuthn({ email: email.trim().toLowerCase(), role: "applicant" });
      }
      setIsLoading(false);
    }, 600);
  };`);

// Password state
content = content.replace(/const \[password, setPassword\] = useState\(""\);\n/, '');
content = content.replace(/const \[showPassword, setShowPassword\] = useState\(false\);\n/, '');

// quickFillAdmin
content = content.replace(/const quickFillAdmin = \(\) => \{[\s\S]*?setError\(null\);\n  \};\n/, '');

// Remove quick fill admin button
const fillAdminRegex = /<div className="pt-2">[\s\S]*?Fill Test Admin Credentials[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(fillAdminRegex, '');

fs.writeFileSync('src/components/LoginPortal.tsx', content);
