const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add imports
content = content.replace(
  /import \{ \n  ArrowLeft,/,
  `import { googleSignIn, getAccessToken, initAuth } from "../lib/googleAuth";\nimport { \n  ArrowLeft,\n  FileSpreadsheet,`
);

// Add state
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  `const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
  }, []);

  const handleExportToSheets = async () => {
    try {
      setIsExporting(true);
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        if (result) {
          token = result.accessToken;
          setNeedsAuth(false);
        } else {
          throw new Error("Failed to authenticate with Google");
        }
      }
      
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${token}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: \`LendSwift Loan Applicants - \${new Date().toLocaleDateString()}\`
          }
        })
      });
      
      if (!createRes.ok) throw new Error("Failed to create spreadsheet");
      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;
      
      const headers = [
        "Application ID", "Reference ID", "Date", "Full Name", "Mobile Number", "Email", "PAN", "Aadhaar", "Loan Type", "Amount", "Tenure", "City", "Risk Profile", "Status"
      ];
      
      const rows = filteredApps.map(app => [
        app.id,
        app.referenceId || "N/A",
        new Date(app.timestamp).toLocaleDateString(),
        app.fullName,
        app.mobileNumber,
        app.email,
        app.panNumber,
        app.aadhaarNumber,
        app.loanType,
        app.loanAmount.toString(),
        app.loanTenure.toString(),
        app.currentCity,
        app.isDefaulter ? "CRITICAL RISK (DEFAULTER)" : "STANDARD",
        app.status || "Pending"
      ]);
      
      const updateRes = await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED\`, {
        method: "PUT",
        headers: {
          "Authorization": \`Bearer \${token}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [headers, ...rows]
        })
      });
      
      if (!updateRes.ok) throw new Error("Failed to update spreadsheet");
      
      await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}:batchUpdate\`, {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${token}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                    textFormat: { bold: true }
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)"
              }
            }
          ]
        })
      });
      
      window.open(\`https://docs.google.com/spreadsheets/d/\${spreadsheetId}\`, "_blank");
      
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export to Google Sheets.");
    } finally {
      setIsExporting(false);
    }
  };`
);

// Add button
content = content.replace(
  /<\/p>\n        <\/div>\n        <div className="flex gap-2 w-full md:w-auto">/,
  `</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={handleExportToSheets}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm w-full md:w-auto"
          >
            {isExporting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full block"></span>
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            <span>Export to Google Sheets</span>
          </button>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
