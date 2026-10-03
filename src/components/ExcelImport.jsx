
import { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const EXPECTED_SHEETS = [
  "Plants",
  "FunctionalLocations",
  "Equipment",
  "MeasuringPoints",
  "WorkCenters",
  "BOMs",
  "TaskLists",
  "Assets",
  "MeasuringDocuments",
  "MaintenanceStrategies",
  "Notifications",
  "Breakdowns",
  "MaintenanceOrders",
  "Permits",
  "Confirmations",
  "MaintenanceCompletions",
];

export default function ExcelImport({ onClose, onImported }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    setError("");
    setResult(null);

    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      setError("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/import/excel`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Excel import failed."
        );
      }

      setResult(data);

      if (onImported) {
        onImported(data);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to import Excel file."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;

    setFile(null);
    setResult(null);
    setError("");

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <FileSpreadsheet
                  size={22}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Import SAP PM Excel
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Import all 16 SAP PM modules from one Excel file
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">

          {/* Upload Area */}
          {!result && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Upload
                  size={25}
                  className="text-blue-600"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                Upload SAP PM Excel File
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Drag and drop your Excel file here or select a file
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Choose Excel File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
              />

              <p className="mt-3 text-xs text-slate-400">
                Supported: .xlsx, .xls • Maximum 10 MB
              </p>
            </div>
          )}

          {/* Selected File */}
          {file && !result && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FileSpreadsheet
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Expected Sheets */}
          {!result && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Expected Excel Sheets
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {EXPECTED_SHEETS.map((sheet, index) => (
                  <div
                    key={sheet}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600"
                  >
                    <span className="mr-1 font-semibold text-blue-600">
                      {index + 1}.
                    </span>
                    {sheet}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Import Error
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Import Result */}
          {result && (
            <div className="space-y-5">

              {/* Success */}
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="font-semibold text-emerald-700">
                    Excel import completed
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    {result.message ||
                      "SAP PM Excel data has been imported successfully."}
                  </p>
                </div>
              </div>

              {/* Totals */}
              {result.totals && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">
                      Inserted
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {result.totals.inserted ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-medium text-amber-600">
                      Updated
                    </p>

                    <p className="mt-1 text-2xl font-bold text-amber-700">
                      {result.totals.updated ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-600">
                      Skipped
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-700">
                      {result.totals.skipped ?? 0}
                    </p>
                  </div>

                </div>
              )}

              {/* Module Summary */}
              {Array.isArray(result.summary) &&
                result.summary.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                      Module Import Summary
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Sheet
                              </th>

                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Inserted
                              </th>

                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Updated
                              </th>

                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Skipped
                              </th>

                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Status
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {result.summary.map((item, index) => {
                              const status =
                                item.status ||
                                (item.error
                                  ? "Error"
                                  : "Imported");

                              return (
                                <tr
                                  key={`${item.sheet || item.module}-${index}`}
                                  className="border-t border-slate-100"
                                >
                                  <td className="px-4 py-3 font-medium text-slate-700">
                                    {item.sheet ||
                                      item.module ||
                                      "-"}
                                  </td>

                                  <td className="px-4 py-3 text-emerald-600">
                                    {item.inserted ?? 0}
                                  </td>

                                  <td className="px-4 py-3 text-blue-600">
                                    {item.updated ?? 0}
                                  </td>

                                  <td className="px-4 py-3 text-slate-500">
                                    {item.skipped ?? 0}
                                  </td>

                                  <td className="px-4 py-3">
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        status === "Error"
                                          ? "bg-red-100 text-red-700"
                                          : status === "Sheet not found"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700"
                                      }`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              {/* Errors */}
              {Array.isArray(result.errors) &&
                result.errors.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold text-amber-700">
                          Some rows need attention
                        </p>

                        <div className="mt-2 max-h-40 overflow-y-auto text-xs text-amber-700">
                          {result.errors.map(
                            (item, index) => (
                              <p
                                key={index}
                                className="mb-1"
                              >
                                {typeof item === "string"
                                  ? item
                                  : JSON.stringify(item)}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {result ? "Close" : "Cancel"}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={17} />
                  Import SAP PM Data
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

