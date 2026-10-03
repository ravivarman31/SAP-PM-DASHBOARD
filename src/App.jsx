
import { useEffect, useState } from "react";
import { Upload, Download, LogOut } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ExcelImport from "./components/ExcelImport";
import Login from "./pages/Login";
import { ToastProvider } from "./components/primitives";

import Plant from "./pages/Plant";
import FunctionalLocation from "./pages/FunctionalLocation";
import Equipment from "./pages/Equipment";
import MeasuringPoint from "./pages/MeasuringPoint";
import WorkCenter from "./pages/WorkCenter";
import BOM from "./pages/BOM";
import TaskList from "./pages/TaskList";
import Asset from "./pages/Asset";
import MeasuringDocument from "./pages/MeasuringDocument";
import MaintenanceStrategy from "./pages/MaintenanceStrategy";

import Notification from "./pages/Notification";
import Breakdown from "./pages/Breakdown";
import MaintenanceOrder from "./pages/MaintenanceOrder";
import Permit from "./pages/Permit";
import Confirmation from "./pages/Confirmation";
import MaintenanceCompletion from "./pages/MaintenanceCompletion";

import Reports from "./pages/Reports";
import BreakdownReports from "./pages/BreakdownReports";
import EquipmentHistory from "./pages/EquipmentHistory";
import MaintenanceAnalytics from "./pages/MaintenanceAnalytics";

const PAGES = {
  dashboard: Dashboard,

  // Master Data
  plant: Plant,
  "functional-location": FunctionalLocation,
  equipment: Equipment,
  "measuring-point": MeasuringPoint,
  "work-center": WorkCenter,
  bom: BOM,
  "task-list": TaskList,
  asset: Asset,
  "measuring-document": MeasuringDocument,
  "maintenance-strategy": MaintenanceStrategy,

  // Transaction Data
  notifications: Notification,
  breakdowns: Breakdown,
  orders: MaintenanceOrder,
  permit: Permit,
  confirmation: Confirmation,
  "maintenance-completion": MaintenanceCompletion,

  // Reports
  reports: Reports,
  "breakdown-reports": BreakdownReports,
  "equipment-history": EquipmentHistory,
  "maintenance-analytics": MaintenanceAnalytics,
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const [checkingLogin, setCheckingLogin] = useState(true);

  const [currentPage, setCurrentPage] = useState("dashboard");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [showExcelImport, setShowExcelImport] = useState(false);

  const [exporting, setExporting] = useState(false);

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {
    const savedLogin = localStorage.getItem(
      "sap_pm_authenticated"
    );

    setAuthenticated(savedLogin === "true");

    setCheckingLogin(false);
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = () => {
    localStorage.setItem(
      "sap_pm_authenticated",
      "true"
    );

    setAuthenticated(true);

    setCurrentPage("dashboard");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "sap_pm_authenticated"
    );

    localStorage.removeItem(
      "sap_pm_remember_login"
    );

    setAuthenticated(false);

    setCurrentPage("dashboard");
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigate = (page) => {
    if (!PAGES[page]) {
      return;
    }

    setCurrentPage(page);

    setMobileOpen(false);
  };

  // =====================================================
  // EXCEL IMPORT
  // =====================================================

  const handleExcelImported = () => {
    setShowExcelImport(false);
  };

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const handleExcelExport = async () => {
    if (exporting) {
      return;
    }

    try {
      setExporting(true);

      const response = await fetch(
        "http://localhost:5000/api/export/excel"
      );

      if (!response.ok) {
        let message = "Excel export failed.";

        try {
          const errorData = await response.json();

          if (errorData?.message) {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = "SAP_PM_Data.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Excel export error:",
        error
      );

      alert(
        error.message ||
          "Unable to export SAP PM data."
      );
    } finally {
      setExporting(false);
    }
  };

  // =====================================================
  // LOGIN CHECK LOADING
  // =====================================================

  if (checkingLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-300">
            Loading SAP PM...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // SHOW LOGIN PAGE
  // =====================================================

  if (!authenticated) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // =====================================================
  // CURRENT PAGE
  // =====================================================

  const Page =
    PAGES[currentPage] || Dashboard;

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">

        {/* SIDEBAR */}

        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleNavigate}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* MAIN AREA */}

        <div className="lg:ml-[264px] min-h-screen flex flex-col">

          {/* HEADER */}

          <Header
            onMenu={() => setMobileOpen(true)}
            currentPage={currentPage}
            setCurrentPage={handleNavigate}
          />

          {/* CONTENT */}

          <main className="flex-1 p-4 md:p-6 xl:p-8 w-full max-w-[1600px] mx-auto">

            {/* TOP ACTION BAR */}

            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  SAP PM Data Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Import or export all SAP PM master and
                  transaction data.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                {/* IMPORT */}

                <button
                  type="button"
                  onClick={() =>
                    setShowExcelImport(true)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Upload size={17} />

                  Import SAP PM Excel
                </button>

                {/* EXPORT */}

                <button
                  type="button"
                  onClick={handleExcelExport}
                  disabled={exporting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={17} />

                  {exporting
                    ? "Exporting..."
                    : "Export SAP PM Excel"}
                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={17} />

                  Logout
                </button>

              </div>
            </div>

            {/* CURRENT PAGE */}

            <Page
              key={currentPage}
              onNavigate={handleNavigate}
            />

          </main>
        </div>

        {/* EXCEL IMPORT MODAL */}

        {showExcelImport && (
          <ExcelImport
            onClose={() =>
              setShowExcelImport(false)
            }
            onImported={handleExcelImported}
          />
        )}

      </div>
    </ToastProvider>
  );
}
