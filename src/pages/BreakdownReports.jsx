
import { useEffect, useMemo, useState } from "react";

import {
  TriangleAlert,
  ShieldAlert,
  Timer,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import {
  PageHeader,
  StatCard,
  Badge,
  Card,
  SectionHeading,
} from "../components/PMUI";

import { plants } from "../lib/plants";

const API_URL = "http://localhost:5000/api";

export default function BreakdownReports({ onNavigate }) {
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBreakdowns = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/breakdowns`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load breakdown data."
        );
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : result.data || [];

      setBreakdowns(data);
    } catch (err) {
      console.error(
        "Breakdown report error:",
        err
      );

      setError(
        err.message ||
          "Unable to load breakdown reports."
      );

      setBreakdowns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBreakdowns();
  }, []);

  const rows = useMemo(() => {
    return plants.map((plant) => {
      const plantBreakdowns = breakdowns.filter(
        (item) => item.plant === plant
      );

      const critical = plantBreakdowns.filter(
        (item) => item.priority === "Critical"
      ).length;

      const high = plantBreakdowns.filter(
        (item) => item.priority === "High"
      ).length;

      const medium = plantBreakdowns.filter(
        (item) =>
          item.priority === "Medium" ||
          item.priority === "Low"
      ).length;

      return {
        plant,
        total: plantBreakdowns.length,
        critical,
        high,
        medium,
        downtime: 0,
      };
    });
  }, [breakdowns]);

  const getRisk = (row) => {
    if (row.critical > 1) {
      return "Critical";
    }

    if (row.total > 6) {
      return "High";
    }

    if (row.total > 0) {
      return "Medium";
    }

    return "Healthy";
  };

  const totalBreakdowns = breakdowns.length;

  const criticalCount = breakdowns.filter(
    (item) => item.priority === "Critical"
  ).length;

  const resolvedCount = breakdowns.filter(
    (item) =>
      ["Completed", "Closed", "Resolved"].includes(
        item.status
      )
  ).length;

  /*
   * Current Breakdown model does not contain a
   * downtime field, so this remains 0 until
   * downtime is added to the breakdown transaction.
   */
  const totalDowntime = breakdowns.reduce(
    (total, item) => {
      const value = Number(
        item.downtime || item.downtimeHours || 0
      );

      return total + (Number.isNaN(value) ? 0 : value);
    },
    0
  );

  if (loading) {
    return (
      <div>
        <PageHeader
          icon={TriangleAlert}
          title="Breakdown Reports"
          description="Monitor equipment breakdowns, severity levels, and production downtime across all plants."
        />

        <Card className="p-10">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <RefreshCw
              size={20}
              className="animate-spin"
            />

            Loading breakdown reports...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* =========================
          BACK NAVIGATION
      ========================= */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() =>
            onNavigate?.("dashboard")
          }
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-lg
            border
            border-line
            bg-white
            text-sm
            font-medium
            text-ink-soft
            hover:bg-raised
            hover:text-accent
            transition
          "
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>

      {/* =========================
          PAGE HEADER
      ========================= */}
      <PageHeader
        icon={TriangleAlert}
        title="Breakdown Reports"
        description="Monitor equipment breakdowns, severity levels, and production downtime across all plants."
      >
        <button
          type="button"
          onClick={() => loadBreakdowns(true)}
          disabled={refreshing}
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-lg
            border
            border-line
            bg-white
            text-sm
            font-medium
            text-ink-soft
            hover:bg-raised
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition
          "
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </PageHeader>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <Card className="mb-5 border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert
                size={20}
                className="text-red-600 mt-0.5"
              />

              <div>
                <p className="font-semibold text-red-700">
                  Unable to load breakdown data
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadBreakdowns()
                  }
                  className="mt-3 text-sm font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =========================
          SUMMARY CARDS
      ========================= */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatCard
          icon={TriangleAlert}
          label="Breakdowns Logged"
          value={totalBreakdowns}
          note="Live breakdown records"
          tone="danger"
        />

        <StatCard
          icon={ShieldAlert}
          label="Critical"
          value={criticalCount}
          note="Critical priority records"
          tone="danger"
        />

        <StatCard
          icon={Timer}
          label="Downtime"
          value={`${totalDowntime.toFixed(1)} h`}
          note="Recorded downtime"
          tone="warn"
        />

        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedCount}
          note="Completed breakdowns"
          tone="ok"
        />
      </div>

      {/* =========================
          SEVERITY TABLE
      ========================= */}
      <Card className="overflow-hidden">
        <div className="p-5 pb-4 flex items-center justify-between">
          <SectionHeading
            title="Severity by Plant"
            sub="Breakdown exposure by plant"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-raised border-y border-line text-[13px] text-ink-soft">
                {[
                  "Plant",
                  "Total",
                  "Critical",
                  "High",
                  "Medium and Low",
                  "Downtime",
                  "Risk",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-2.5 text-left font-medium whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.plant}
                  className="
                    border-b
                    border-line
                    last:border-0
                    hover:bg-accent-soft/40
                    transition
                  "
                >
                  <td className="px-5 py-2.5 font-medium text-ink">
                    {row.plant}
                  </td>

                  <td className="px-5 py-2.5 font-medium text-ink">
                    {row.total}
                  </td>

                  <td
                    className={`px-5 py-2.5 ${
                      row.critical
                        ? "text-danger font-medium"
                        : "text-ink-mute"
                    }`}
                  >
                    {row.critical}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.high}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.medium}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.downtime} h
                  </td>

                  <td className="px-5 py-2.5">
                    <Badge
                      value={getRisk(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {breakdowns.length === 0 && (
          <div className="p-8 text-center border-t border-line">
            <p className="font-medium text-ink">
              No breakdown records found
            </p>

            <p className="text-sm text-ink-soft mt-1">
              Create breakdown transactions to
              populate this report.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
