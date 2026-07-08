const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import LoginPortal from "\.\/components\/LoginPortal";/,
  `import LoginPortal from "./components/LoginPortal";\nimport AdminLoginPortal from "./components/AdminLoginPortal";`
);

content = content.replace(
  /const \[currentUser, setCurrentUser\] = useState<{ email: string; role: "admin" \| "applicant" } \| null>\(\(\) => \{/,
  `const [isAdminLoginView, setIsAdminLoginView] = useState(false);\n  const [currentUser, setCurrentUser] = useState<{ email: string; role: "admin" | "applicant" } | null>(() => {`
);

// We need to replace the LoginPortal rendering with the view toggle logic
const loginPortalRegex = /<LoginPortal\s*onLogin=\{\(user\) => \{\s*setCurrentUser\(user\);\s*localStorage\.setItem\("lendswift_user", JSON\.stringify\(user\)\);\s*\}\}\s*language=\{language\}\s*\/>/;

const newLoginView = `
          {isAdminLoginView ? (
            <div className="w-full max-w-md mx-auto">
              <AdminLoginPortal
                onLogin={(user) => {
                  setCurrentUser(user);
                  localStorage.setItem("lendswift_user", JSON.stringify(user));
                }}
                language={language}
              />
              <div className="text-center mt-4 pb-8">
                <button 
                  onClick={() => setIsAdminLoginView(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  Return to Applicant Login
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <LoginPortal
                onLogin={(user) => {
                  setCurrentUser(user);
                  localStorage.setItem("lendswift_user", JSON.stringify(user));
                }}
                language={language}
              />
              <div className="text-center mt-4 pb-8">
                <button 
                  onClick={() => setIsAdminLoginView(true)}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Admin Access
                </button>
              </div>
            </div>
          )}
`;

content = content.replace(loginPortalRegex, newLoginView);

fs.writeFileSync('src/App.tsx', content);
