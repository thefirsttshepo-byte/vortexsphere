import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Smartphone,
  WifiOff,
  Download,
  HardDrive,
  Shield,
} from "lucide-react";
import { persistenceService } from "../../data/persistence/indexedDB";

export const PWAStatusScreen: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [dealStats, setDealStats] = useState({ total: 0, used: 0 });

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    };

    setIsStandalone(checkStandalone());

    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        setStorageInfo(estimate);
      });
    }

    persistenceService.getAllDeals().then((deals) => {
      const totalSize = JSON.stringify(deals).length;
      setDealStats({
        total: deals.length,
        used: Math.round(totalSize / 1024),
      });
    });
  }, []);

  const features = [
    {
      icon: <WifiOff className="h-6 w-6" />,
      title: "Offline Access",
      status: "working",
      description: "Analyze deals without internet",
    },
    {
      icon: <HardDrive className="h-6 w-6" />,
      title: "Local Storage",
      status: "working",
      description: `${dealStats.total} deals stored (${dealStats.used}KB)`,
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Privacy",
      status: "working",
      description: "No data leaves your device",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "PWA Installed",
      status: isStandalone ? "working" : "missing",
      description: isStandalone
        ? "App is installed"
        : "Install for best experience",
    },
  ];

  const handleBackup = async () => {
    try {
      const data = await persistenceService.exportDeals();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `property-analyzer-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Failed to backup data. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PWA Status</h1>
        <p className="text-gray-600 mt-2">
          Progressive Web App capabilities & data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  feature.status === "working"
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                {feature.icon}
              </div>
              {feature.status === "working" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
            <p className="text-gray-600 mt-2">{feature.description}</p>
          </div>
        ))}
      </div>

      {storageInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 text-lg mb-4">
            Storage Usage
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>IndexedDB (Your Deals)</span>
                <span>{dealStats.used} KB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${Math.min((dealStats.used / 1024) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>App Cache</span>
                <span>
                  {Math.round(storageInfo.usageDetails?.caches / 1024 || 0)} KB
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      ((storageInfo.usageDetails?.caches || 0) /
                        storageInfo.quota) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Total Available:</strong>{" "}
                {Math.round(storageInfo.quota / 1024 / 1024)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {!isStandalone && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Install as App
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                On Desktop (Chrome/Edge):
              </h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click the install icon in the address bar</li>
                <li>2. Or go to Menu → "Install Cash Property Analyzer"</li>
                <li>3. App will appear in your start menu/dock</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-blue-800 mb-2">On Mobile:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>
                  <strong>iOS:</strong> Share → "Add to Home Screen"
                </li>
                <li>
                  <strong>Android:</strong> Menu → "Install App"
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800">
              <strong>Benefits:</strong> Works offline • App icon on home screen
              • No browser UI clutter • Separate window • Faster loading
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          Data Management
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Backup All Data
          </button>

          <button
            onClick={() => {
              if (confirm("Clear all app data? This cannot be undone.")) {
                localStorage.clear();
                indexedDB.deleteDatabase("CashPropertyAnalyzer");
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Clear All Data
          </button>

          <button
            onClick={() => {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  regs.forEach((reg) => reg.unregister());
                });
                caches.keys().then((keys) => {
                  keys.forEach((key) => caches.delete(key));
                });
                alert("Cache cleared. Reload the app.");
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};
