const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

if (!content.includes('const [isExporting')) {
  content = content.replace(
    /const \[searchTerm, setSearchTerm\] = useState\(""\);/,
    `const [searchTerm, setSearchTerm] = useState("");
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
}
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
