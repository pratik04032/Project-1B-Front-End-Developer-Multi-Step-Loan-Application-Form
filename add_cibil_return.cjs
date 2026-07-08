const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const returnStatementRegex = /return \(\n\s*<div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 antialiased flex flex-col justify-between" id="app-wrapper">/;

const newReturn = `
  if (!cibilChecked && currentUser?.role !== "admin" && !resumeModalData && !globalSuccess && !isAdminView) {
    return <CibilChecker onComplete={(score) => {
      localStorage.setItem("lendswift_cibil_checked", "true");
      setCibilChecked(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 antialiased flex flex-col justify-between" id="app-wrapper">`;

content = content.replace(returnStatementRegex, newReturn);
fs.writeFileSync('src/App.tsx', content);
