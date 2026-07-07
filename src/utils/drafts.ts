export interface DraftInfo {
  loanType: string;
  step: number;
  timestamp: string;
  encryptedState: string;
}

/**
 * Checks localStorage for existing drafts for all three loan types (Personal, Home, Business).
 * Returns the most recent valid draft that is less than 72 hours old.
 */
export function findLatestDraft(): DraftInfo | null {
  const loanTypes = ["Personal", "Home", "Business"];
  let latestDraft: DraftInfo | null = null;
  let latestTime = 0;

  for (const type of loanTypes) {
    const key = `lendswift_draft_${type}`;
    const metaKey = `${key}_meta`;
    const encryptedState = localStorage.getItem(key);
    const metaStr = localStorage.getItem(metaKey);

    if (encryptedState && metaStr) {
      try {
        const meta = JSON.parse(metaStr);
        const timestamp = new Date(meta.timestamp).getTime();
        const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);

        // TTL of 72 hours
        if (ageHours < 72) {
          if (timestamp > latestTime) {
            latestTime = timestamp;
            latestDraft = {
              loanType: type,
              step: meta.step,
              timestamp: meta.timestamp,
              encryptedState
            };
          }
        } else {
          // Expired - comply with data minimisation principles
          localStorage.removeItem(key);
          localStorage.removeItem(metaKey);
        }
      } catch (e) {
        console.error("Failed to parse metadata for", type, e);
      }
    }
  }

  return latestDraft;
}

export function clearDraft(loanType: string) {
  const key = `lendswift_draft_${loanType}`;
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_meta`);
}

export function clearAllDrafts() {
  const loanTypes = ["Personal", "Home", "Business"];
  for (const type of loanTypes) {
    clearDraft(type);
  }
}
