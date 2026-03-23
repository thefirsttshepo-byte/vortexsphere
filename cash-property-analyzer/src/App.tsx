import { useState, useRef } from "react";
import { Layout } from "./ui/layout/Layout";
import { AddDealScreen } from "./ui/screens/AddDealScreen";
import { DealRankingScreen } from "./ui/screens/DealRankingScreen";
import { Card } from "./ui/components/Card";
import { persistenceService } from "./data/persistence/indexedDB";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt"; // Added import

function App() {
  const [currentView, setCurrentView] = useState<"add" | "ranking">("add");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation functions
  const handleNavigateToAddDeal = () => {
    setCurrentView("add");
  };

  const handleNavigateToRanking = () => {
    setCurrentView("ranking");
  };

  // Function to handle export
  const handleExport = async () => {
    try {
      // Export deals as JSON using existing service
      const jsonData = await persistenceService.exportDeals();

      // Create a blob and download link
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `property-deals-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(`Exported ${JSON.parse(jsonData).dealCount} deals successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please check console for details.");
    }
  };

  // Function to trigger file input for import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file selection and import
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;

          // Validate it's a valid JSON
          const data = JSON.parse(jsonString);

          if (!data.deals || !Array.isArray(data.deals)) {
            throw new Error(
              "Invalid import file format. Please use an exported JSON file."
            );
          }

          // Ask for confirmation before overwriting
          const confirmImport = window.confirm(
            `This will import ${data.deals.length} deals and replace ALL existing deals. Continue?`
          );

          if (!confirmImport) {
            setIsImporting(false);
            return;
          }

          // Import the deals
          const result = await persistenceService.importDeals(jsonString);

          if (result.success) {
            alert(`Successfully imported ${result.count} deals!`);

            // Refresh the deals list if we're on the ranking view
            if (currentView === "ranking") {
              window.dispatchEvent(new Event("deals-updated"));
            }
          } else {
            alert("Import failed. Please check the file format.");
          }
        } catch (error) {
          console.error("Import error:", error);
          alert(
            `Import failed: ${
              error instanceof Error ? error.message : "Invalid file format"
            }`
          );
        } finally {
          setIsImporting(false);
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("File reading error:", error);
      alert("Failed to read file. Please try again.");
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json,application/json"
        style={{ display: "none" }}
      />

      <Layout
        currentView={currentView}
        onNavigateToAddDeal={handleNavigateToAddDeal}
        onNavigateToRanking={handleNavigateToRanking}
        onExport={handleExport}
        onImport={handleImportClick}
        isImporting={isImporting}
      >
        <Card
          title={currentView === "add" ? "Add New Deal" : "Deal Ranking"}
          subtitle={
            currentView === "add"
              ? "Step-by-step analysis • No leverage • No IRR • No overrides"
              : "Sorted by risk-adjusted owner earnings quality • No overrides allowed"
          }
          className="mb-6"
        >
          {currentView === "add" ? <AddDealScreen /> : <DealRankingScreen />}
        </Card>
      </Layout>

      {/* Add PWA install prompt */}
      <PWAInstallPrompt />
    </>
  );
}

export default App;
