const fs = require('fs');

// We will recreate LoginPortal from AdminLoginPortal
let adminContent = fs.readFileSync('src/components/AdminLoginPortal.tsx', 'utf8');

let userContent = adminContent;

// 1. Rename component
userContent = userContent.replace(/export default function AdminLoginPortal/, 'export default function LoginPortal');

// 2. Change Admin strings to Applicant strings
userContent = userContent.replace(/"Admin Email Address"/g, '"Applicant Email Address"');
userContent = userContent.replace(/"admin@lendswift.com"/g, '"you@example.com"');

// 3. Remove the password field block completely
const passStart = userContent.indexOf('{/* Password field (Admin only) */}');
const captchaStart = userContent.indexOf('{/* Captcha Verification */}');
if (passStart !== -1 && captchaStart !== -1) {
  userContent = userContent.slice(0, passStart) + userContent.slice(captchaStart);
}

// 4. Update the handleLogin logic for applicant
const handleLoginStart = userContent.indexOf('const handleLogin = (e: React.FormEvent) => {');
const handleLoginEnd = userContent.indexOf('}, 1000);\n  };') + '}, 1000);\n  };'.length;

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
  };
`;
userContent = userContent.slice(0, handleLoginStart) + newHandleLogin + userContent.slice(handleLoginEnd);

// 5. Remove quickFillAdmin for LoginPortal
userContent = userContent.replace(/const quickFillAdmin = \(\) => \{[\s\S]*?setError\(null\);\n  \};\n/, '');

fs.writeFileSync('src/components/LoginPortal.tsx', userContent);

