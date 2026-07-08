const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add submittedStatus state
content = content.replace(
  'const [successRefId, setSuccessRefId] = useState("");',
  'const [successRefId, setSuccessRefId] = useState("");\n  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);'
);

// 2. Update loadUserApplication logic
const oldLoadLogic = `if (app.status === "APPROVED" || app.status === "REJECTED" || app.status === "PRE-APPROVED") {
              setSuccessRefId(app.id);
              setGlobalSuccess(true);
            }`;

const newLoadLogic = `if (app.status) {
              setSuccessRefId(app.id);
              setSubmittedStatus(app.status);
              setGlobalSuccess(true);
            }`;

content = content.replace(oldLoadLogic, newLoadLogic);

// 3. Update saveApplication logic on final submission
const oldSubmitLogic = `setSuccessRefId(uniqueId);
    setGlobalSuccess(true);`;

const newSubmitLogic = `setSuccessRefId(uniqueId);
    setSubmittedStatus("UNDER_VERIFICATION"); // Default status upon submission
    setGlobalSuccess(true);`;

content = content.replace(oldSubmitLogic, newSubmitLogic);

fs.writeFileSync('src/App.tsx', content);
