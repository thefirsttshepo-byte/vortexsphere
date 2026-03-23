import React from "react";
import {
  Shield,
  Home,
  BarChart3,
  Download,
  Upload,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { INVESTMENT_DOCTRINE } from "../../core/types";

interface LayoutProps {
  children: React.ReactNode;
  currentView?: "add" | "ranking";
  onNavigateToAddDeal?: () => void;
  onNavigateToRanking?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  isImporting?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onNavigateToAddDeal,
  onNavigateToRanking,
  onExport,
  onImport,
  isImporting = false,
}) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Home className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Cash Property Analyzer
                </h1>
                <p className="text-sm text-gray-500">
                  South Africa • Multi-Let • Cash Only
                </p>
              </div>
            </div>

            {/* Center: Primary Navigation */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={onNavigateToAddDeal}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === "add"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="font-medium">Add New Deal</span>
              </button>

              <button
                onClick={onNavigateToRanking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === "ranking"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Deal Ranking</span>
              </button>
            </nav>

            {/* Right: Data Management */}
            <nav className="flex items-center space-x-3">
              <button
                onClick={onImport}
                disabled={isImporting}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isImporting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    <span className="font-medium text-sm">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="font-medium text-sm">Import</span>
                  </>
                )}
              </button>

              <button
                onClick={onExport}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                <span className="font-medium text-sm">Export</span>
              </button>

              <div className="flex items-center space-x-2 text-sm bg-warning-50 text-warning-700 px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4" />
                <span>No Overrides • No IRR • No Leverage</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer with Doctrine */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Investment Doctrine
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {INVESTMENT_DOCTRINE}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Config Version
                </h4>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Data Management
                </h4>
                <p className="text-sm text-gray-600">
                  {isImporting ? "Importing..." : "Ready"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              This app directly informs real capital allocation. Accuracy,
              determinism, and discipline matter more than speed, polish, or
              flexibility.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
