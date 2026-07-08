const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  /import Step1LoanType from "\.\/components\/Step1LoanType";/,
  `import CibilChecker from "./components/CibilChecker";\nimport Step1LoanType from "./components/Step1LoanType";`
);

// Add state
content = content.replace(
  /const \[currentStep, setCurrentStep\] = useState\(1\);/,
  `const [cibilChecked, setCibilChecked] = useState(() => localStorage.getItem("lendswift_cibil_checked") === "true");\n  const [currentStep, setCurrentStep] = useState(1);`
);

// Replace resume modal data
content = content.replace(
  /setResumeModalData\({\n *loanType: type,\n *step: Number\(meta\.step\),\n *encryptedState: encrypted\n *}\);/,
  `setResumeModalData({
          loanType: type,
          step: Number(meta.step),
          encryptedState: encrypted,
          timestamp: meta.timestamp || Date.now()
        });`
);

fs.writeFileSync('src/App.tsx', content);
