const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace filteredErrors assignment in useEffect
content = content.replace(
  /filteredErrors\[key\] = stepErrors\[key\];/,
  "filteredErrors[key] = t(stepErrors[key]);"
);

// Replace setErrors(stepErrors) in handleNext
content = content.replace(
  /setErrors\(stepErrors\);/,
  `const translatedStepErrors: Record<string, string> = {};
      Object.keys(stepErrors).forEach(k => translatedStepErrors[k] = t(stepErrors[k]));
      setErrors(translatedStepErrors);`
);

// Replace flatErrors[k] = v; in handleSubmitApplication
content = content.replace(
  /flatErrors\[k\] = v;/,
  "flatErrors[k] = t(v);"
);

fs.writeFileSync('src/App.tsx', content);
