import { useEffect, useRef, useState } from "react";
import { FormState } from "../types";
import { encryptData } from "../utils/encryption";

export interface SaveMetadata {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
}

export function useAutoSave(
  formState: FormState,
  currentStep: number,
  interval = 30000,
  onSave?: (timestamp: string) => void
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const serialized = JSON.stringify(formState);
      const encrypted = await encryptData(serialized);
      const loanType = formState.loanType;
      
      const key = `lendswift_draft_${loanType}`;
      const metaKey = `${key}_meta`;
      
      const timestamp = new Date().toISOString();
      const metadata: SaveMetadata = {
        version: "1.0",
        timestamp,
        step: currentStep,
        loanType
      };

      localStorage.setItem(key, encrypted);
      localStorage.setItem(metaKey, JSON.stringify(metadata));
      
      const timeStr = new Date().toLocaleTimeString();
      setLastSaved(timeStr);
      if (onSave) {
        onSave(timeStr);
      }
    } catch (err) {
      console.error("Auto-save draft failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Setup/Reset debounced timer on every form state change
  useEffect(() => {
    // Clear existing timer on any change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      saveDraft();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [formState, currentStep, interval]);

  return {
    saveDraft,
    lastSaved,
    isSaving
  };
}
