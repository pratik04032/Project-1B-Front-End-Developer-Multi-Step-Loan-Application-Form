import React, { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle, ShieldAlert, RotateCcw } from "lucide-react";

interface SessionTimerProps {
  onExpire: () => void;
  formState: any;
  currentStep: number;
}

// Default constants: 15 minutes total inactivity, 5 minutes warning
const DEFAULT_INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_LIMIT_MS = 5 * 60 * 1000;      // 5 minutes

export default function SessionTimer({ onExpire, formState, currentStep }: SessionTimerProps) {
  // We allow a "Test Mode" to let users/testers speed up the timer
  const [isTestMode, setIsTestMode] = useState(false);

  // Time limits based on mode
  const inactivityLimit = isTestMode ? 30 * 1000 : DEFAULT_INACTIVITY_LIMIT_MS; // 30 seconds vs 15 minutes
  const warningLimit = isTestMode ? 15 * 1000 : DEFAULT_WARNING_LIMIT_MS;       // 15 seconds vs 5 minutes

  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [remainingTime, setRemainingTime] = useState<number>(inactivityLimit);
  const [isExpired, setIsExpired] = useState(false);

  // Keep a ref to avoid stale closure issues in event listeners
  const lastActivityRef = useRef<number>(Date.now());
  lastActivityRef.current = lastActivity;

  // Reset function to set activity to now
  const resetTimer = () => {
    if (isExpired) return;
    const now = Date.now();
    setLastActivity(now);
    setRemainingTime(inactivityLimit);
  };

  // Listen to form changes or step changes as user activity
  useEffect(() => {
    resetTimer();
  }, [formState, currentStep]);

  // Hook up global user activity listeners
  useEffect(() => {
    if (isExpired) return;

    // Throttled handler to avoid constant state writes on fast movements
    let lastEventTime = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastEventTime > 1000) { // Throttle to once per second
        lastEventTime = now;
        resetTimer();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isExpired, inactivityLimit]);

  // Main countdown tick loop
  useEffect(() => {
    if (isExpired) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const calculatedRemaining = Math.max(0, inactivityLimit - elapsed);

      setRemainingTime(calculatedRemaining);

      if (calculatedRemaining <= 0) {
        clearInterval(intervalId);
        setIsExpired(true);
        onExpire();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [isExpired, inactivityLimit, onExpire]);

  // Format milliseconds to MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle manual extend session button
  const handleExtend = () => {
    resetTimer();
  };

  // Handle start fresh after expiration
  const handleStartFresh = () => {
    setIsExpired(false);
    resetTimer();
  };

  const showWarning = remainingTime <= warningLimit && !isExpired;

  // Render nothing if not warning and not expired
  if (!showWarning && !isExpired) {
    // We still render a tiny elegant status badge in the header or footer
    // Let's render a micro indicator in the page bottom-left so the user knows they have a live session tracker
    return (
      <div className="fixed bottom-4 left-4 z-30 hidden md:flex items-center gap-2 bg-white/95 border border-zinc-200 px-2.5 py-1.5 rounded text-[10px] font-mono text-zinc-500 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-pulse"></span>
        <span>Secure Session Active</span>
        <button
          onClick={() => setIsTestMode(true)}
          className="text-zinc-400 hover:text-zinc-900 underline transition-colors"
        >
          Test Mode
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 5-MINUTE WARNING MODAL / FLOATING BANNER */}
      {showWarning && (
        <div className="fixed inset-0 bg-zinc-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-8 space-y-6 border border-zinc-200 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="timer-warning-title">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="timer-warning-title" className="text-sm font-semibold text-zinc-950">
                  Inactivity Security Warning
                </h3>
                <p className="text-xs text-zinc-400">
                  To protect your sensitive financial data, sessions expire after {isTestMode ? "30 seconds" : "15 minutes"}.
                </p>
              </div>
            </div>

            {/* Visual Progress ring or bar */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-4 space-y-3">
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Session Expiring In</span>
                <span className="text-sm font-semibold text-zinc-950 animate-pulse">
                  {formatTime(remainingTime)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${(remainingTime / warningLimit) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              If you are still working, click below or interact with the page to secure your session and keep your draft. Otherwise, your draft will be securely deleted.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleExtend}
                className="w-full px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer text-center"
              >
                Extend Session
              </button>
            </div>

            {isTestMode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsTestMode(false)}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 underline"
                >
                  Switch back to 15m Normal Mode
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SESSION EXPIRED SCREEN OVERLAY */}
      {isExpired && (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center space-y-6 border border-zinc-200 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="expired-title">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 id="expired-title" className="text-base font-semibold text-zinc-950">
                Session Expired
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your session has timed out due to inactivity. To respect your privacy and comply with RBI data minimization requirements, all local draft states have been securely cleared.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartFresh}
                className="w-full px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start New Application
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
