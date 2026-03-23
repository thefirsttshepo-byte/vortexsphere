import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}

export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isInStandaloneMode());

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      if (!isInStandaloneMode()) {
        setIsVisible(true);
      }
    };

    // Check if already installed
    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Auto-show on iOS after 5 seconds
    if (isIOS && !isInStandaloneMode()) {
      setTimeout(() => setIsVisible(true), 5000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store dismissal in localStorage for 7 days
    localStorage.setItem("pwaPromptDismissed", Date.now().toString());
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-2xl p-4 border border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Download className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Install Property Analyzer</h3>
              <p className="text-blue-100 text-sm mt-1">
                {isIOS
                  ? "Tap Share → 'Add to Home Screen'"
                  : "Install app for offline access and faster analysis"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isIOS && installPrompt && (
          <button
            onClick={handleInstallClick}
            className="mt-4 w-full bg-white text-blue-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Install App</span>
          </button>
        )}

        {isIOS && (
          <div className="mt-4 bg-black/20 rounded-lg p-3">
            <p className="text-sm font-medium">iOS Installation:</p>
            <ol className="text-xs text-blue-100 mt-2 space-y-1">
              <li>
                1. Tap the Share button <span className="ml-1">⎋</span>
              </li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" in the top right</li>
            </ol>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-blue-500/30">
          <p className="text-xs text-blue-200">
            <strong>Why install?</strong> Works offline • No data leaves your
            device • App-like experience
          </p>
        </div>
      </div>
    </div>
  );
};
