
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  ClipboardList,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge, Card, SectionHeading } from "./PMUI";
import { plants } from "../lib/plants";

const API_BASE = "http://localhost:5000/api";

const INK = "#0d1726";
const MUTE = "#6c7a92";
const ACCENT = "#0b6577";
const OK = "#146c43";
const DANGER = "#b02a1f";
const WARNING = "#96590a";

const WORKLOAD_COLORS = [
  "#146c43",
  "#0b6577",
  "#96590a",
  "#b02a1f",
];

const EMPTY_DATA = {
  equipment: [],
  notifications: [],
  breakdowns: [],
  orders: [],
  completions: [],
};

function getValue(item, keys, fallback = "") {
  for (const key of keys) {
    if (
      item &&
      item[key] !== undefined &&
      item[key] !== null &&
      item[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
}

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

function isCompletedStatus(status) {
  return [
    "completed",
    "complete",
    "closed",
    "close",
    "teco",
    "technically completed",
    "cancelled",
    "canceled",
  ].includes(normalizeStatus(status));
}

function isOpenStatus(status) {
  return !isCompletedStatus(status);
}

function getPriority(item) {
  return getValue(
    item,
    ["priority", "Priority", "priorityType", "PRIORITY"],
    "Medium"
  );
}

function getPlant(item) {
  return getValue(
    item,
    ["plant", "Plant", "plantCode", "plantId", "PLANT"],
    "Unknown"
  );
}

function getDate(item) {
  return getValue(
    item,
    [
      "createdAt",
      "createdDate",
      "date",
      "notificationDate",
      "orderDate",
      "breakdownDate",
      "completionDate",
      "updatedAt",
    ],
    ""
  );
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const match = String(value).match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
  );

  if (match) {
    const converted = new Date(
      `${match[1]} ${match[2]} ${match[3]}`
    );

    if (!Number.isNaN(converted.getTime())) {
      return converted;
    }
  }

  return null;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return value || "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
  });
}

function getLastSixMonths() {
  const result = [];
  const today = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      1
    );

    result.push({
      key: getMonthKey(date),
      month: getMonthLabel(date),
    });
  }

  return result;
}

function calculateResponseHours(notifications) {
  const values = [];

  notifications.forEach((item) => {
    const created = parseDate(
      getValue(item, [
        "createdAt",
        "createdDate",
        "notificationDate",
        "date",
      ])
    );

    const responded = parseDate(
      getValue(item, [
        "responseDate",
        "respondedAt",
        "actualStartDate",
        "startDate",
        "updatedAt",
      ])
    );

    if (created && responded && responded >= created) {
      const hours =
        (responded.getTime() - created.getTime()) /
        (1000 * 60 * 60);

      if (hours >= 0 && hours <= 720) {
        values.push(hours);
      }
    }
  });

  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

function Metric({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  tone = "accent",
  good,
  onClick,
  clickable = false,
  noTrend = false,
}) {
  const toneMap = {
    accent: {
      icon: "bg-teal-50 text-teal-700",
      border: "border-teal-100",
    },
    ok: {
      icon: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-100",
    },
    danger: {
      icon: "bg-red-50 text-red-700",
      border: "border-red-100",
    },
  };

  const selectedTone = toneMap[tone] || toneMap.accent;

  const deltaNumber =
    typeof delta === "number" ? delta : Number(delta);

  const isPositive = deltaNumber > 0;
  const isNegative = deltaNumber < 0;

  const trendIsGood =
    good === "down" ? isNegative : isPositive;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`text-left w-full ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <Card
        className={`h-full border ${selectedTone.border} ${
          clickable
            ? "transition hover:-translate-y-0.5 hover:shadow-md"
            : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: MUTE }}
            >
              {label}
            </p>

            <p
              className="text-3xl font-bold mt-2"
              style={{ color: INK }}
            >
              {value}
            </p>
          </div>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${selectedTone.icon}`}
          >
            <Icon size={21} />
          </div>
        </div>

        {!noTrend && (
          <div className="flex items-center gap-2 mt-4">
            {typeof delta === "number" ? (
              <>
                {isPositive ? (
                  <TrendingUp
                    size={15}
                    className={
                      trendIsGood
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  />
                ) : isNegative ? (
                  <TrendingDown
                    size={15}
                    className={
                      trendIsGood
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  />
                ) : null}

                <span
                  className={`text-xs font-semibold ${
                    trendIsGood
                      ? "text-emerald-600"
                      : isPositive || isNegative
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {delta}%
                </span>
              </>
            ) : null}

            <span className="text-xs text-slate-500">
              {deltaLabel}
            </span>
          </div>
        )}
      </Card>
    </button>
  );
}

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const endpoints = [
        ["equipment", `${API_BASE}/equipment`],
        ["notifications", `${API_BASE}/notifications`],
        ["breakdowns", `${API_BASE}/breakdowns`],
        ["orders", `${API_BASE}/maintenance-orders`],
        [
          "completions",
          `${API_BASE}/maintenance-completions`,
        ],
      ];

      const responses = await Promise.all(
        endpoints.map(async ([key, url]) => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `${key} API returned ${response.status}`
            );
          }

          const result = await response.json();

          return [
            key,
            Array.isArray(result)
              ? result
              : Array.isArray(result?.data)
              ? result.data
              : Array.isArray(result?.items)
              ? result.items
              : [],
          ];
        })
      );

      const nextData = Object.fromEntries(responses);

      setData({
        ...EMPTY_DATA,
        ...nextData,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);

      setError(
        "Unable to load dashboard data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const {
    equipment,
    notifications,
    breakdowns,
    orders,
    completions,
  } = data;

  const totalEquipment = equipment.length;

  const openNotifications = notifications.filter((item) =>
    isOpenStatus(
      getValue(item, [
        "status",
        "notificationStatus",
        "Status",
      ])
    )
  ).length;

  const totalOrders = orders.length;

  const completedOrders = orders.filter((item) =>
    [
      "completed",
      "complete",
      "closed",
      "close",
      "teco",
      "technically completed",
    ].includes(
      normalizeStatus(
        getValue(item, [
          "status",
          "orderStatus",
          "Status",
        ])
      )
    )
  ).length;

  const openBreakdowns = breakdowns.filter((item) =>
    isOpenStatus(
      getValue(item, [
        "status",
        "breakdownStatus",
        "Status",
      ])
    )
  ).length;

  const criticalBreakdowns = breakdowns.filter(
    (item) =>
      normalizeStatus(getPriority(item)) === "critical"
  ).length;

  const completionRate =
    totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : "0.0";

  const responseHours = calculateResponseHours(
    notifications
  );

  const responseValue =
    responseHours === null
      ? "—"
      : `${responseHours.toFixed(1)} h`;

  const responseMinutes =
    responseHours === null
      ? null
      : Math.round(responseHours * 60);

  const trendData = useMemo(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const ordersCount = orders.filter((item) => {
        const date = parseDate(getDate(item));

        return date && getMonthKey(date) === month.key;
      }).length;

      const completedCount = orders.filter((item) => {
        const date = parseDate(getDate(item));

        const status = normalizeStatus(
          getValue(item, [
            "status",
            "orderStatus",
            "Status",
          ])
        );

        return (
          date &&
          getMonthKey(date) === month.key &&
          [
            "completed",
            "complete",
            "closed",
            "close",
            "teco",
            "technically completed",
          ].includes(status)
        );
      }).length;

      const breakdownCount = breakdowns.filter((item) => {
        const date = parseDate(getDate(item));

        return (
          date && getMonthKey(date) === month.key
        );
      }).length;

      return {
        month: month.month,
        orders: ordersCount,
        completed: completedCount,
        breakdowns: breakdownCount,
      };
    });
  }, [orders, breakdowns]);

  const workload = useMemo(() => {
    const completed = orders.filter((item) =>
      [
        "completed",
        "complete",
        "closed",
        "close",
        "teco",
        "technically completed",
      ].includes(
        normalizeStatus(
          getValue(item, [
            "status",
            "orderStatus",
            "Status",
          ])
        )
      )
    ).length;

    const cancelled = orders.filter((item) =>
      ["cancelled", "canceled"].includes(
        normalizeStatus(
          getValue(item, [
            "status",
            "orderStatus",
            "Status",
          ])
        )
      )
    ).length;

    const open = orders.filter((item) => {
      const status = normalizeStatus(
        getValue(item, [
          "status",
          "orderStatus",
          "Status",
        ])
      );

      return [
        "open",
        "new",
        "created",
        "released",
      ].includes(status);
    }).length;

    const pending = orders.filter((item) => {
      const status = normalizeStatus(
        getValue(item, [
          "status",
          "orderStatus",
          "Status",
        ])
      );

      return [
        "pending",
        "in progress",
        "progress",
        "planned",
      ].includes(status);
    }).length;

    return [
      {
        name: "Completed",
        value: completed,
      },
      {
        name: "Open",
        value: open,
      },
      {
        name: "Pending",
        value: pending,
      },
      {
        name: "Cancelled",
        value: cancelled,
      },
    ];
  }, [orders]);

  const plantData = useMemo(() => {
    return plants.map((plant) => {
      const plantEquipment = equipment.filter(
        (item) => getPlant(item) === plant
      );

      const plantOrders = orders.filter(
        (item) => getPlant(item) === plant
      );

      const plantBreakdowns = breakdowns.filter(
        (item) => getPlant(item) === plant
      );

      return {
        plant,
        equipment: plantEquipment.length,
        orders: plantOrders.length,
        breakdowns: plantBreakdowns.length,
      };
    });
  }, [equipment, orders, breakdowns]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = parseDate(getDate(a));
        const dateB = parseDate(getDate(b));

        return (
          (dateB?.getTime() || 0) -
          (dateA?.getTime() || 0)
        );
      })
      .slice(0, 5);
  }, [orders]);

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const lastRefreshed = new Date().toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto text-teal-600 animate-spin"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading maintenance dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Wrench size={14} />
            SAP PM Control Centre
          </div>

          <h1
            className="text-3xl font-bold mt-2"
            style={{ color: INK }}
          >
            Maintenance control centre
          </h1>

          <p className="mt-1 text-slate-500">
            Live maintenance overview across M001, M002,
            M003, T001, T002 and T003.
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Last refreshed {lastRefreshed} IST
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold text-sm">
              Dashboard connection error
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Metric
          icon={ClipboardList}
          label="Maintenance orders"
          value={totalOrders}
          deltaLabel="Click to view breakdowns"
          tone="accent"
          onClick={() =>
            handleNavigate("breakdowns")
          }
          clickable
          noTrend
        />

        <Metric
          icon={Bell}
          label="Maintenance notifications"
          value={openNotifications}
          deltaLabel="Open notifications"
          tone="accent"
          onClick={() =>
            handleNavigate("notifications")
          }
          clickable
          noTrend
        />

        <Metric
          icon={CheckCircle2}
          label="Completion rate"
          value={`${completionRate}%`}
          deltaLabel={`${completedOrders} orders closed`}
          tone="ok"
          onClick={() =>
            handleNavigate(
              "maintenance-completion"
            )
          }
          clickable
          noTrend
        />

        <Metric
          icon={Clock3}
          label="Mean response time"
          value={responseValue}
          deltaLabel={
            responseMinutes === null
              ? "Response time data unavailable"
              : `${responseMinutes} minutes average`
          }
          tone="accent"
          onClick={() =>
            handleNavigate(
              "maintenance-analytics"
            )
          }
          clickable
          noTrend
        />
      </div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Total equipment
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {totalEquipment}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Wrench size={19} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Open breakdowns
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {openBreakdowns}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle size={19} />
            </div>
          </div>

          <p className="text-xs text-red-600 mt-3">
            {criticalBreakdowns} critical
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Completion records
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {completions.length}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={19} />
            </div>
          </div>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <SectionHeading
            title="Maintenance order flow"
            subtitle="Orders, completed work and breakdown activity over the last six months"
          />

          <div className="h-[330px] mt-5">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="ordersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#0b6577"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#0b6577"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e8edf3"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: MUTE, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: MUTE, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#0b6577"
                  fill="url(#ordersGradient)"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#146c43"
                  fill="transparent"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="breakdowns"
                  name="Breakdowns"
                  stroke="#b02a1f"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Current workload"
            subtitle="Maintenance order status"
          />

          <div className="h-[250px] mt-3">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={workload}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {workload.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={
                        WORKLOAD_COLORS[index]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {workload.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        WORKLOAD_COLORS[index],
                    }}
                  />

                  <span className="text-sm text-slate-600">
                    {item.name}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RECENT ORDERS + PLANT CONDITION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionHeading
            title="Latest maintenance orders"
            subtitle="Most recently created maintenance orders"
          />

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500">
                    Order
                  </th>

                  <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500">
                    Description
                  </th>

                  <th className="text-left py-3 pr-4 text-xs font-semibold text-slate-500">
                    Plant
                  </th>

                  <th className="text-left py-3 text-xs font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((item, index) => {
                    const orderId = getValue(
                      item,
                      [
                        "orderId",
                        "id",
                        "maintenanceOrder",
                        "orderNumber",
                        "orderNo",
                      ],
                      `MO-${1000 + index}`
                    );

                    const description = getValue(
                      item,
                      [
                        "description",
                        "shortText",
                        "name",
                        "text",
                      ],
                      "Maintenance order"
                    );

                    const status = getValue(
                      item,
                      [
                        "status",
                        "orderStatus",
                        "Status",
                      ],
                      "Open"
                    );

                    const plant = getPlant(item);

                    return (
                      <tr
                        key={`${orderId}-${index}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-teal-700">
                          {orderId}
                        </td>

                        <td className="py-3 pr-4 text-slate-600 max-w-[230px] truncate">
                          {description}
                        </td>

                        <td className="py-3 pr-4 text-slate-600">
                          {plant}
                        </td>

                        <td className="py-3">
                          <Badge>
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-400"
                    >
                      No maintenance orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Plant condition"
            subtitle="Equipment, order and breakdown count by plant"
          />

          <div className="h-[330px] mt-5">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={plantData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e8edf3"
                />

                <XAxis
                  dataKey="plant"
                  tick={{
                    fill: MUTE,
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: MUTE,
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="equipment"
                  name="Equipment"
                  fill="#0b6577"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#146c43"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="breakdowns"
                  name="Breakdowns"
                  fill="#b02a1f"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* PLANT SUMMARY TABLE */}
      <Card>
        <SectionHeading
          title="Plant summary"
          subtitle="Live maintenance workload across all six plants"
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Plant
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Equipment
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Orders
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Breakdowns
                </th>

                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Condition
                </th>
              </tr>
            </thead>

            <tbody>
              {plantData.map((item) => {
                let condition = "Normal";

                if (item.breakdowns >= 6) {
                  condition = "Attention";
                }

                if (item.breakdowns >= 10) {
                  condition = "Critical";
                }

                return (
                  <tr
                    key={item.plant}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-semibold text-teal-700">
                      {item.plant}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {item.equipment}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {item.orders}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {item.breakdowns}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          condition === "Critical"
                            ? "bg-red-100 text-red-700"
                            : condition === "Attention"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {condition}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

