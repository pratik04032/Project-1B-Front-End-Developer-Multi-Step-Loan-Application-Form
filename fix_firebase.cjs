const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
content = content.replace(
  /export const db = firebaseConfig\.firestoreDatabaseId\n  \? getFirestore\(app, firebaseConfig\.firestoreDatabaseId\)\n  : getFirestore\(app\);/,
  `export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);`
);
fs.writeFileSync('src/lib/firebase.ts', content);
