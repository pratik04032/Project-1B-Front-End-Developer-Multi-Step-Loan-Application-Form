// Verhoeff algorithm matrices
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 1, 4, 6, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates Aadhaar number using the Verhoeff checksum algorithm.
 */
export function validateAadhaar(aadhaar: string): boolean {
  const sanitized = aadhaar.replace(/\s+/g, "");
  if (!/^\d{12}$/.test(sanitized)) {
    return false;
  }
  let c = 0;
  const digits = sanitized.split("").map(Number);
  for (let i = 0; i < 12; i++) {
    const digit = digits[11 - i];
    c = d[c][p[i % 8][digit]];
  }
  return c === 0;
}

/**
 * Validates PAN number based on official Indian income tax formats.
 * Format: AAAAA9999A
 * 4th character validation: P for individual, C for company, etc.
 * Personal/Home Loans: Only P (Individual) is accepted.
 * Business Loans: P, C, or F (Firm) are accepted.
 */
export function validatePAN(
  pan: string,
  loanType: string
): { valid: boolean; error?: string } {
  const cleanPan = pan.toUpperCase().trim();
  if (!cleanPan) {
    return { valid: false, error: "PAN number is required." };
  }
  if (cleanPan.length !== 10) {
    return { valid: false, error: "PAN must be exactly 10 characters." };
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
    return {
      valid: false,
      error: "Invalid format. Expected 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F)."
    };
  }

  const fourthChar = cleanPan[3];
  const validEntityTypes = ["P", "C", "H", "A", "B", "G", "J", "L", "F", "T"];
  if (!validEntityTypes.includes(fourthChar)) {
    return {
      valid: false,
      error: `PAN 4th character must indicate entity type (P for Individual, C for Company, etc.).`
    };
  }

  if (loanType === "Personal" || loanType === "Home") {
    if (fourthChar !== "P") {
      return {
        valid: false,
        error: "PAN 4th character must indicate entity type 'P' (Individual) for Personal or Home loans."
      };
    }
  } else if (loanType === "Business") {
    if (fourthChar !== "P" && fourthChar !== "C" && fourthChar !== "F") {
      return {
        valid: false,
        error: "PAN 4th character must indicate entity type P (Individual), C (Company), or F (Firm) for Business loans."
      };
    }
  }

  return { valid: true };
}

/**
 * Validates GSTIN (Goods and Services Tax Identification Number)
 * Format: 15 characters
 * 1st-2nd: State code (digits)
 * 3rd-12th: PAN card of the business
 * 13th: Entity code (digit or letter)
 * 14th: Z (by default)
 * 15th: Checksum digit or letter
 */
export function validateGST(gst: string, expectedPan?: string): { valid: boolean; error?: string } {
  const cleanGst = gst.toUpperCase().trim();
  if (!cleanGst) {
    return { valid: false, error: "GST Number is required." };
  }
  if (cleanGst.length !== 15) {
    return { valid: false, error: "GST number must be exactly 15 characters." };
  }
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
    return {
      valid: false,
      error: "Invalid GST format. Expected 2 digits, 5 letters, 4 digits, 1 letter, 1 entity code, 'Z', and 1 checksum."
    };
  }

  // Check 14th character is Z
  if (cleanGst[13] !== "Z") {
    return { valid: false, error: "GST 14th character must be 'Z'." };
  }

  // Cross-validation with primary PAN if provided
  if (expectedPan) {
    const gstPan = cleanGst.substring(2, 12);
    if (gstPan !== expectedPan.toUpperCase().trim()) {
      return {
        valid: false,
        error: `GST must contain your PAN (${expectedPan}) at characters 3 to 12. Found: ${gstPan}`
      };
    }
  }

  return { valid: true };
}

/**
 * Calculates reducing-balance EMI, Total Cost, Processing Fee
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  processingFee: number;
} {
  const r = annualRate / 12 / 100;
  let emi = 0;
  if (r === 0) {
    emi = principal / tenureMonths;
  } else {
    emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);
  const processingFee = Math.max(2000, Math.min(25000, principal * 0.01));

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    processingFee: Math.round(processingFee)
  };
}

/**
 * Formats currency values in the Indian Number System (Lakh/Crore format)
 */
export function formatINR(value: number): string {
  const x = Math.round(value).toString();
  if (x.length <= 3) return "₹" + x;
  let lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return "₹" + formattedOthers + "," + lastThree;
}

/**
 * Helper to calculate age from DOB string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
