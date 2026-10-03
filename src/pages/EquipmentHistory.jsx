
import { useEffect, useMemo, useState } from "react";

import {
  History,
  Wrench,
  TriangleAlert,
  CheckCircle2,
  Factory,
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

export default function EquipmentHistory() {
  const [equipment, setEquipment] = useState([]);
  const [breakdowns, setBreakdowns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [completions, setCompletions] = useState([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        equipmentResponse,
        breakdownResponse,
        orderResponse,
        completionResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/equipment`),
        fetch(`${API_URL}/breakdowns`),
        fetch(`${API_URL}/maintenance-orders`),
        fetch(`${API_URL}/maintenance-completions`),
      ]);

      if (!equipmentResponse.ok) {
        throw new Error(
          "Failed to load equipment data."
        );
      }

      if (!breakdownResponse.ok) {
        throw new Error(
          "Failed to load breakdown data."
        );
      }

      if (!orderResponse.ok) {
        throw new Error(
          "Failed to load maintenance orders."
        );
      }

      if (!completionResponse.ok) {
        throw new Error(
          "Failed to load completion data."
        );
      }

      const equipmentData =
        await equipmentResponse.json();

      const breakdownData =
        await breakdownResponse.json();

      const orderData =
        await orderResponse.json();

      const completionData =
        await completionResponse.json();

      const normalize = (result) =>
        Array.isArray(result)
          ? result
          : result?.data || [];

      const equipmentRows =
        normalize(equipmentData);

      setEquipment(equipmentRows);
      setBreakdowns(normalize(breakdownData));
      setOrders(normalize(orderData));
      setCompletions(
        normalize(completionData)
      );

      if (
        !selectedEquipment &&
        equipmentRows.length > 0
      ) {
        setSelectedEquipment(
          equipmentRows[0].code ||
            equipmentRows[0].id ||
            ""
        );
      }
    } catch (err) {
      console.error(
        "Equipment history error:",
        err
      );

      setError(
        err.message ||
          "Unable to load equipment history."
      );

      setEquipment([]);
      setBreakdowns([]);
      setOrders([]);
      setCompletions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const selected = useMemo(() => {
    return equipment.find(
      (item) =>
        (item.code || item.id) ===
        selectedEquipment
    );
  }, [equipment, selectedEquipment]);

  const equipmentBreakdowns = useMemo(() => {
    if (!selectedEquipment) return [];

    return breakdowns.filter(
      (item) =>
        item.equipment === selectedEquipment
    );
  }, [breakdowns, selectedEquipment]);

  const equipmentOrders = useMemo(() => {
    if (!selectedEquipment) return [];

    return orders.filter(
      (item) =>
        item.equipment === selectedEquipment
    );
  }, [orders, selectedEquipment]);

  const equipmentCompletions = useMemo(() => {
    if (!selectedEquipment) return [];

    const orderIds = new Set(
      equipmentOrders.map(
        (item) => item.code || item.id
      )
    );

    return completions.filter(
      (item) =>
        item.equipment === selectedEquipment ||
        orderIds.has(item.order)
    );
  }, [
    completions,
    equipmentOrders,
    selectedEquipment,
  ]);

  const completedOrders =
    equipmentOrders.filter((item) =>
      ["Completed", "Closed", "Approved"].includes(
        item.status
      )
    ).length;

  const openOrders =
    equipmentOrders.filter((item) =>
      ["Open", "Pending", "In Progress"].includes(
        item.status
      )
    ).length;

  const criticalBreakdowns =
    equipmentBreakdowns.filter(
      (item) => item.priority === "Critical"
    ).length;

  const plantCoverage = new Set(
    equipment.map((item) => item.plant)
  ).size;

  const historyRows = useMemo(() => {
    const rows = [];

    equipmentBreakdowns.forEach((item) => {
      rows.push({
        date:
          item.date ||
          item.createdAt ||
          "-",
        type: "Breakdown",
        reference:
          item.code || item.id || "-",
        description:
          item.cause ||
          item.description ||
          "Equipment breakdown",
        priority:
          item.priority || "Medium",
        status:
          item.status || "Open",
      });
    });

    equipmentOrders.forEach((item) => {
      rows.push({
        date:
          item.date ||
          item.createdAt ||
          "-",
        type: "Maintenance Order",
        reference:
          item.code || item.id || "-",
        description:
          item.description ||
          item.name ||
          "Maintenance work order",
        priority:
          item.priority || "Medium",
        status:
          item.status || "Open",
      });
    });

    equipmentCompletions.forEach((item) => {
      rows.push({
        date:
          item.date ||
          item.createdAt ||
          "-",
        type: "Completion",
        reference:
          item.code || item.id || "-",
        description:
          "Maintenance work completed",
        priority: "Completed",
        status:
          item.status || "Completed",
      });
    });

    return rows;
  }, [
    equipmentBreakdowns,
    equipmentOrders,
    equipmentCompletions,
  ]);

  if (loading) {
    return (
      <div>
        <PageHeader
          icon={History}
          title="Equipment History"
          description="View maintenance history, breakdowns, orders and completions for equipment."
        />

        <Card className="p-10">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading equipment history...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={History}
        title="Equipment History"
        description="View maintenance history, breakdowns, orders and completions for equipment."
      >
        <button
          type="button"
          onClick={() => loadHistory(true)}
          disabled={refreshing}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-line
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-ink-soft
            hover:bg-raised
            disabled:opacity-60
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

      {error && (
        <Card className="mb-5 border-red-200 bg-red-50">
          <div className="p-4">
            <p className="font-semibold text-red-700">
              Unable to load equipment history
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadHistory()}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {/* Equipment selector */}
      <Card className="p-5 mb-5">
        <SectionHeading
          title="Select Equipment"
          sub="View the complete maintenance history of an equipment."
        />

        <div className="mt-4 max-w-xl">
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Equipment
          </label>

          <select
            value={selectedEquipment}
            onChange={(e) =>
              setSelectedEquipment(
                e.target.value
              )
            }
            className="
              w-full
              rounded-lg
              border
              border-line
              bg-white
              px-3
              py-2.5
              text-sm
              text-ink
              outline-none
              focus:ring-2
              focus:ring-accent
            "
          >
            <option value="">
              Select Equipment
            </option>

            {equipment.map((item) => {
              const id =
                item.code || item.id;

              return (
                <option
                  key={item._id || id}
                  value={id}
                >
                  {id}{" "}
                  {item.name
                    ? `- ${item.name}`
                    : ""}
                </option>
              );
            })}
          </select>
        </div>
      </Card>

      {selected && (
        <>
          {/* Equipment information */}
          <Card className="p-5 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-mute">
                  Equipment
                </p>

                <h2 className="mt-1 text-2xl font-bold text-ink">
                  {selected.code ||
                    selected.id}
                </h2>

                <p className="mt-1 text-sm text-ink-soft">
                  {selected.name ||
                    "Equipment"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  value={
                    selected.status ||
                    "Active"
                  }
                />

                <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                  <Factory size={14} />
                  {selected.plant ||
                    "No Plant"}
                </span>
              </div>
            </div>
          </Card>

          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            <StatCard
              icon={Wrench}
              label="Maintenance Orders"
              value={
                equipmentOrders.length
              }
              note="Orders for this equipment"
            />

            <StatCard
              icon={TriangleAlert}
              label="Breakdowns"
              value={
                equipmentBreakdowns.length
              }
              note={`${criticalBreakdowns} critical`}
              tone="danger"
            />

            <StatCard
              icon={CheckCircle2}
              label="Completed Orders"
              value={completedOrders}
              note={`${openOrders} still open`}
              tone="ok"
            />

            <StatCard
              icon={Factory}
              label="Plant"
              value={
                selected.plant || "-"
              }
              note="Equipment location"
              tone="info"
            />
          </div>

          {/* History */}
          <Card className="overflow-hidden">
            <div className="p-5 pb-4">
              <SectionHeading
                title="Maintenance History"
                sub="Breakdown, maintenance order and completion activity"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-raised border-y border-line text-[13px] text-ink-soft">
                    {[
                      "Date",
                      "Activity",
                      "Reference",
                      "Description",
                      "Priority",
                      "Status",
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
                  {historyRows.length > 0 ? (
                    historyRows.map(
                      (row, index) => (
                        <tr
                          key={`${row.reference}-${index}`}
                          className="
                            border-b
                            border-line
                            last:border-0
                            hover:bg-accent-soft/40
                            transition
                          "
                        >
                          <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                            {row.date}
                          </td>

                          <td className="px-5 py-3">
                            <span className="font-medium text-ink">
                              {row.type}
                            </span>
                          </td>

                          <td className="px-5 py-3 font-medium text-accent">
                            {row.reference}
                          </td>

                          <td className="px-5 py-3 text-ink-soft">
                            {row.description}
                          </td>

                          <td className="px-5 py-3">
                            <Badge
                              value={
                                row.priority
                              }
                            />
                          </td>

                          <td className="px-5 py-3">
                            <Badge
                              value={
                                row.status
                              }
                            />
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-ink-soft"
                      >
                        No maintenance history
                        found for this equipment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!selected &&
        equipment.length === 0 && (
          <Card className="p-10 text-center">
            <Wrench
              size={32}
              className="mx-auto text-ink-mute"
            />

            <p className="mt-3 font-medium text-ink">
              No equipment records found
            </p>

            <p className="mt-1 text-sm text-ink-soft">
              Create equipment records first to
              view their maintenance history.
            </p>
          </Card>
        )}

      {!selected &&
        equipment.length > 0 && (
          <Card className="p-10 text-center">
            <History
              size={32}
              className="mx-auto text-ink-mute"
            />

            <p className="mt-3 font-medium text-ink">
              Select an equipment
            </p>

            <p className="mt-1 text-sm text-ink-soft">
              Choose an equipment above to view
              its complete maintenance history.
            </p>
          </Card>
        )}
    </div>
  );
}
