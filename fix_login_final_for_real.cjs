const fs = require('fs');

let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

// handleLogin
content = content.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 600\);\n  \};/, 
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

fs.writeFileSync('src/components/LoginPortal.tsx', content);
