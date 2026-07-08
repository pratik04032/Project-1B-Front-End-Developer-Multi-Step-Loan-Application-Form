const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import statement
content = content.replace(
  'import AdminLoginPortal from "./components/AdminLoginPortal";',
  'import AdminLoginPortal from "./components/AdminLoginPortal";\nimport ApplicationStatusView from "./components/ApplicationStatusView";'
);

// 2. Replace the UI inside globalSuccess ? ... : ...
const blockRegex = /\) : globalSuccess \? \([\s\S]*?<div className="bg-white border border-zinc-200 rounded-xl p-8 text-center max-w-xl mx-auto space-y-6 my-12 animate-fadeIn" id="success-portal">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*:\s*\(/;

const newBlock = `) : globalSuccess ? (
          <ApplicationStatusView 
            referenceId={successRefId}
            status={submittedStatus}
            language={language}
            onPrint={() => window.print()}
            onDownloadKFS={() => {
              const dataUri = "data:application/pdf;base64,JVBERi0xLjQKJ..." // Mock download
              const link = document.createElement("a");
              link.href = dataUri;
              link.download = \`LendSwift_Summary_\${successRefId}.pdf\`;
              link.click();
            }}
          />
        ) : (`;

if (blockRegex.test(content)) {
  content = content.replace(blockRegex, newBlock);
} else {
  console.log("Could not find the block to replace.");
}

fs.writeFileSync('src/App.tsx', content);
