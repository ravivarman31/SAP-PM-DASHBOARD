import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  Wrench,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

const COLORS = [
  "#2563eb",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const STATUS_COLORS = {
  Open: "#f59e0b",
  "In Progress": "#2563eb",
  Completed: "#22c55e",
  Pending: "#8b5cf6",
  Cancelled: "#94a3b8",
};

function getCode(row) {
  return row?.code || row?.id || "-";
}

function getPlant(row) {
  return row?.plant || "Unknown";
}

function getStatus(row) {
  return row?.status || "Unknown";
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export default function MaintenanceAnalytics() {
  const [equipment, setEquipment] = useState([]);
  const [breakdowns, setBreakdowns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [completions, setCompletions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        equipmentResponse,
        breakdownResponse,
        orderResponse,
        completionResponse,
      ] = await Promise.all([
        fetch(`${API_BASE}/equipment`),
        fetch(`${API_BASE}/breakdowns`),
        fetch(`${API_BASE}/maintenance-orders`),
        fetch(`${API_BASE}/maintenance-completions`),
      ]);

      if (
        !equipmentResponse.ok ||
        !breakdownResponse.ok ||
        !orderResponse.ok ||
        !completionResponse.ok
      ) {
        throw new Error(
          "Unable to load maintenance analytics data."
        );
      }

      const [
        equipmentData,
        breakdownData,
        orderData,
        completionData,
      ] = await Promise.all([
        equipmentResponse.json(),
        breakdownResponse.json(),
        orderResponse.json(),
        completionResponse.json(),
      ]);

      setEquipment(
        Array.isArray(equipmentData)
          ? equipmentData
          : []
      );

      setBreakdowns(
        Array.isArray(breakdownData)
          ? breakdownData
          : []
      );

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : []
      );

      setCompletions(
        Array.isArray(completionData)
          ? completionData
          : []
      );
    } catch (err) {
      console.error(
        "Maintenance analytics error:",
        err
      );

      setError(
        err.message ||
          "Unable to load maintenance analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalEquipment = equipment.length;

    const activeEquipment = equipment.filter(
      (item) =>
        String(item.status || "").toLowerCase() ===
        "active"
    ).length;

    const openBreakdowns = breakdowns.filter(
      (item) => {
        const status = String(
          item.status || ""
        ).toLowerCase();

        return (
          status === "open" ||
          status === "pending" ||
          status === "in progress"
        );
      }
    ).length;

    const criticalBreakdowns = breakdowns.filter(
      (item) =>
        String(
          item.priority || ""
        ).toLowerCase() === "critical"
    ).length;

    const completedOrders = orders.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() === "completed"
    ).length;

    const openOrders = orders.filter(
      (item) => {
        const status = String(
          item.status || ""
        ).toLowerCase();

        return (
          status === "open" ||
          status === "pending" ||
          status === "in progress"
        );
      }
    ).length;

    const completionRate =
      orders.length > 0
        ? (
            (completedOrders / orders.length) *
            100
          ).toFixed(1)
        : "0.0";

    const plantMap = {};

    [
      ...equipment,
      ...breakdowns,
      ...orders,
      ...completions,
    ].forEach((item) => {
      const plant = getPlant(item);

      if (!plantMap[plant]) {
        plantMap[plant] = {
          plant,
          equipment: 0,
          breakdowns: 0,
          orders: 0,
          completions: 0,
        };
      }
    });

    equipment.forEach((item) => {
      const plant = getPlant(item);

      if (!plantMap[plant]) {
        plantMap[plant] = {
          plant,
          equipment: 0,
          breakdowns: 0,
          orders: 0,
          completions: 0,
        };
      }

      plantMap[plant].equipment += 1;
    });

    breakdowns.forEach((item) => {
      const plant = getPlant(item);

      if (!plantMap[plant]) {
        plantMap[plant] = {
          plant,
          equipment: 0,
          breakdowns: 0,
          orders: 0,
          completions: 0,
        };
      }

      plantMap[plant].breakdowns += 1;
    });

    orders.forEach((item) => {
      const plant = getPlant(item);

      if (!plantMap[plant]) {
        plantMap[plant] = {
          plant,
          equipment: 0,
          breakdowns: 0,
          orders: 0,
          completions: 0,
        };
      }

      plantMap[plant].orders += 1;
    });

    completions.forEach((item) => {
      const plant = getPlant(item);

      if (!plantMap[plant]) {
        plantMap[plant] = {
          plant,
          equipment: 0,
          breakdowns: 0,
          orders: 0,
          completions: 0,
        };
      }

      plantMap[plant].completions += 1;
    });

    const plantData = Object.values(
      plantMap
    ).filter(
      (item) => item.plant !== "Unknown"
    );

    const orderStatusMap = {};

    orders.forEach((item) => {
      const status = getStatus(item);

      orderStatusMap[status] =
        (orderStatusMap[status] || 0) + 1;
    });

    const orderStatusData = Object.entries(
      orderStatusMap
    ).map(([name, value]) => ({
      name,
      value,
    }));

    const priorityMap = {};

    breakdowns.forEach((item) => {
      const priority =
        item.priority || "Unknown";

      priorityMap[priority] =
        (priorityMap[priority] || 0) + 1;
    });

    const priorityData = Object.entries(
      priorityMap
    ).map(([name, value]) => ({
      name,
      value,
    }));

    const recentBreakdowns = [
      ...breakdowns,
    ]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.date || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);

    return {
      totalEquipment,
      activeEquipment,
      openBreakdowns,
      criticalBreakdowns,
      completedOrders,
      openOrders,
      completionRate,
      plantData,
      orderStatusData,
      priorityData,
      recentBreakdowns,
    };
  }, [
    equipment,
    breakdowns,
    orders,
    completions,
  ]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw
              size={20}
              className="animate-spin text-blue-600"
            />

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Maintenance Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Loading live SAP PM maintenance
                data...
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Maintenance Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Analyze equipment health,
                breakdowns, maintenance orders
                and completion activity.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh Data
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Analytics data unavailable
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <p className="mt-2 text-xs text-red-500">
              Make sure your backend is running on
              http://localhost:5000
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Equipment"
          value={analytics.totalEquipment}
          subtitle={`${analytics.activeEquipment} currently active`}
          icon={Wrench}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Open Breakdowns"
          value={analytics.openBreakdowns}
          subtitle={`${analytics.criticalBreakdowns} critical priority`}
          icon={AlertTriangle}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Maintenance Orders"
          value={orders.length}
          subtitle={`${analytics.openOrders} currently open`}
          icon={ClipboardList}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          subtitle={`${analytics.completedOrders} orders completed`}
          icon={CheckCircle2}
          iconClass="bg-green-50 text-green-600"
        />
      </div>

      {/* PLANT ANALYTICS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Plant-wise Maintenance Overview
            </h2>

            <p className="text-sm text-slate-500">
              Equipment, breakdowns, orders and
              completion activity by plant.
            </p>
          </div>
        </div>

        {analytics.plantData.length === 0 ? (
          <EmptyChart message="No plant data available." />
        ) : (
          <div className="h-[340px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={analytics.plantData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="plant"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="equipment"
                  name="Equipment"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="breakdowns"
                  name="Breakdowns"
                  fill="#ef4444"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="completions"
                  name="Completions"
                  fill="#22c55e"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ORDER STATUS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Maintenance Order Status
            </h2>

            <p className="text-sm text-slate-500">
              Current distribution of maintenance
              orders.
            </p>
          </div>

          {analytics.orderStatusData.length ===
          0 ? (
            <EmptyChart message="No maintenance order data available." />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      analytics.orderStatusData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={48}
                    paddingAngle={3}
                    label
                  >
                    {analytics.orderStatusData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-${entry.name}-${index}`}
                          fill={
                            STATUS_COLORS[
                              entry.name
                            ] ||
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* BREAKDOWN PRIORITY */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Breakdown Priority
            </h2>

            <p className="text-sm text-slate-500">
              Breakdown distribution by priority.
            </p>
          </div>

          {analytics.priorityData.length ===
          0 ? (
            <EmptyChart message="No breakdown priority data available." />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      analytics.priorityData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={48}
                    paddingAngle={3}
                    label
                  >
                    {analytics.priorityData.map(
                      (entry, index) => (
                        <Cell
                          key={`priority-${entry.name}-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* RECENT BREAKDOWNS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            Recent Breakdowns
          </h2>

          <p className="text-sm text-slate-500">
            Latest breakdown records from SAP PM.
          </p>
        </div>

        {analytics.recentBreakdowns.length ===
        0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            No breakdown records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">
                    Breakdown
                  </th>

                  <th className="px-4 py-3">
                    Plant
                  </th>

                  <th className="px-4 py-3">
                    Priority
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {analytics.recentBreakdowns.map(
                  (item, index) => {
                    const status =
                      getStatus(item);

                    const priority =
                      item.priority ||
                      "Unknown";

                    const date =
                      item.createdAt ||
                      item.date;

                    return (
                      <tr
                        key={
                          item._id ||
                          item.id ||
                          item.code ||
                          index
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-700">
                            {getCode(item)}
                          </div>

                          {item.description && (
                            <div className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
                              {item.description}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {getPlant(item)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              String(
                                priority
                              ).toLowerCase() ===
                              "critical"
                                ? "bg-red-100 text-red-700"
                                : String(
                                    priority
                                  ).toLowerCase() ===
                                  "high"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {priority}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              String(
                                status
                              ).toLowerCase() ===
                              "completed"
                                ? "bg-green-100 text-green-700"
                                : String(
                                    status
                                  ).toLowerCase() ===
                                  "in progress"
                                ? "bg-blue-100 text-blue-700"
                                : String(
                                    status
                                  ).toLowerCase() ===
                                  "pending"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          {date
                            ? new Date(
                                date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Wrench size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-700">
                Equipment
              </p>

              <p className="text-2xl font-bold text-blue-900">
                {analytics.totalEquipment}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-red-700">
                Open Breakdowns
              </p>

              <p className="text-2xl font-bold text-red-900">
                {analytics.openBreakdowns}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-green-700">
                Completed Orders
              </p>

              <p className="text-2xl font-bold text-green-900">
                {analytics.completedOrders}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}