const fs = require('fs');
let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

const regex = /const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 600\);\n  \};/;

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

content = content.replace(regex, newHandleLogin);

// Also remove quickFillAdmin and password state entirely from LoginPortal.tsx
content = content.replace(/const quickFillAdmin = \(\) => \{[\s\S]*?setError\(null\);\n  \};\n/, '');
content = content.replace(/const \[password, setPassword\] = useState\(""\);\n/, '');
content = content.replace(/const \[showPassword, setShowPassword\] = useState\(false\);\n/, '');

// Fix closing tags that were dangling
// "src/components/LoginPortal.tsx(361,13): error TS17002: Expected corresponding JSX closing tag for 'form'."
// Let's just fix the whole form structure.
