const fs = require('fs');

let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

// Replace handleLogin logic
content = content.replace(/if \(false\) \{[\s\S]*?\} else \{/, '');
content = content.replace(/\/\/ Applicant Login/, '');

// Remove the closing bracket of the else block
// Since the structure was:
// setTimeout(() => {
//   if (false) {
//      ...
//   } else {
//      ...
//   }
// }, 1000)
// Let's just manually replace the whole block
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
            ? "ଦୟାକରି ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ପ୍ରଦାନ କରନ୍ତୁ।"
            : "Please enter a valid email address."
        );
        setIsLoading(false);
      } else {
        triggerWebAuthn({ email: email.trim(), role: "applicant" });
      }
    }, 1000);
  };
`;

content = content.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 1000\);\n  \};/, newHandleLogin);

// Remove the test admin credentials button
const fillAdminRegex = /<div className="pt-2">[\s\S]*?Fill Test Admin Credentials[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(fillAdminRegex, '');

// Clean up {false ? ... : ...} expressions in JSX
content = content.replace(/\{false \? "Admin Email Address" : "Applicant Email Address"\}/g, '"Applicant Email Address"');
content = content.replace(/\{false \? "admin@lendswift\.com" : "you@example\.com"\}/g, '"you@example.com"');

// Remove password field completely since applicants don't use it
const passwordFieldRegex = /\{false && \([\s\S]*?\}\)/;
content = content.replace(passwordFieldRegex, '');

fs.writeFileSync('src/components/LoginPortal.tsx', content);
