
import { useEffect, useMemo, useState } from "react";
import {
  FileBarChart,
  TrendingUp,
  Factory,
  Wrench,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  PageHeader,
  StatCard,
  Badge,
  Card,
  SectionHeading,
  Button,
  useToast,
} from "../components/PMUI";

import { plants } from "../lib/plants";
import { exportRowsLazy } from "../lib/excel-lazy";

const API_URL = "http://localhost:5000/api";

const columns = [
  { key: "plant", label: "Plant" },
  { key: "orders", label: "Orders" },
  { key: "completed", label: "Completed" },
  { key: "breakdowns", label: "Breakdowns" },
  { key: "rate", label: "Completion Rate" },
  { key: "health", label: "Health" },
];

const axis = {
  stroke: "#6c7a92",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const emptyPlantData = plants.map((plant) => ({
  plant,
  orders: 0,
  completed: 0,
  breakdowns: 0,
}));

export default function Reports() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [ordersResponse, breakdownsResponse] =
        await Promise.all([
          fetch(`${API_URL}/maintenance-orders`),
          fetch(`${API_URL}/breakdowns`),
        ]);

      if (!ordersResponse.ok) {
        throw new Error("Failed to load maintenance orders.");
      }

      if (!breakdownsResponse.ok) {
        throw new Error("Failed to load breakdown data.");
      }

      const ordersData = await ordersResponse.json();
      const breakdownsData = await breakdownsResponse.json();

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : ordersData.data || []
      );

      setBreakdowns(
        Array.isArray(breakdownsData)
          ? breakdownsData
          : breakdownsData.data || []
      );
    } catch (err) {
      console.error("Reports loading error:", err);

      setError(
        err.message ||
          "Unable to load maintenance reports."
      );

      setOrders([]);
      setBreakdowns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const activity = useMemo(() => {
    return plants.map((plant) => {
      const plantOrders = orders.filter(
        (order) => order.plant === plant
      );

      const plantBreakdowns = breakdowns.filter(
        (breakdown) => breakdown.plant === plant
      );

      const completed = plantOrders.filter((order) =>
        ["Completed", "Closed", "Approved"].includes(
          order.status
        )
      ).length;

      return {
        plant,
        orders: plantOrders.length,
        completed,
        breakdowns: plantBreakdowns.length,
      };
    });
  }, [orders, breakdowns]);

  const summary = useMemo(() => {
    return activity.map((row) => {
      const rate =
        row.orders > 0
          ? Math.round(
              (row.completed / row.orders) * 100
            )
          : 0;

      return {
        ...row,
        rate: `${rate}%`,
        health:
          row.breakdowns > 6
            ? "Attention"
            : "Healthy",
      };
    });
  }, [activity]);

  const totalOrders = orders.length;

  const completedOrders = orders.filter((order) =>
    ["Completed", "Closed", "Approved"].includes(
      order.status
    )
  ).length;

  const completionRate =
    totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : "0.0";

  const totalBreakdowns = breakdowns.length;

  const criticalBreakdowns = breakdowns.filter(
    (item) => item.priority === "Critical"
  ).length;

  const reportingPlants = new Set(
    [
      ...orders.map((item) => item.plant),
      ...breakdowns.map((item) => item.plant),
    ].filter((plant) => plants.includes(plant))
  ).size;

  const download = async () => {
    try {
      await exportRowsLazy({
        title: "Maintenance report",
        columns,
        rows: summary,
      });

      toast("Plant summary exported to Excel.");
    } catch (err) {
      console.error("Report export error:", err);
      toast("Unable to export report.");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          icon={FileBarChart}
          title="Maintenance Reports"
          description="Maintenance performance from live PM transaction data."
        />

        <Card className="p-10">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading maintenance reports...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={FileBarChart}
        title="Maintenance Reports"
        description="Order volume, completion and breakdown exposure for each plant."
      >
        <div className="flex gap-2">
          <Button
            icon={RefreshCw}
            onClick={() => loadReports(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            icon={Download}
            onClick={download}
          >
            Export Report
          </Button>
        </div>
      </PageHeader>

      {error && (
        <Card className="mb-5 border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-red-600 mt-0.5"
              />

              <div>
                <p className="font-semibold text-red-700">
                  Unable to load report data
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadReports()}
                  className="mt-3 text-sm font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatCard
          icon={Wrench}
          label="Orders Raised"
          value={totalOrders}
          note="Live maintenance orders"
        />

        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${completionRate}%`}
          note={`${completedOrders} orders closed`}
          tone="ok"
        />

        <StatCard
          icon={AlertTriangle}
          label="Breakdowns"
          value={totalBreakdowns}
          note={`${criticalBreakdowns} rated critical`}
          tone="danger"
        />

        <StatCard
          icon={Factory}
          label="Plants Reporting"
          value={`${reportingPlants}/${plants.length}`}
          note="PM plant network"
          tone="info"
        />
      </div>

      <Card className="p-5 mb-4">
        <SectionHeading
          title="Orders Raised vs Orders Completed"
          sub="Live data from Maintenance Orders"
        />

        <div className="h-80 mt-5 -ml-2">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                activity.length > 0
                  ? activity
                  : emptyPlantData
              }
              margin={{
                top: 4,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                vertical={false}
                stroke="#dbe1ea"
              />

              <XAxis
                dataKey="plant"
                {...axis}
              />

              <YAxis
                {...axis}
                width={34}
              />

              <Tooltip
                cursor={{
                  fill: "#eef1f5",
                }}
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #dbe1ea",
                  fontSize: 13,
                }}
              />

              <Legend
                iconType="square"
                iconSize={10}
                wrapperStyle={{
                  fontSize: 13,
                  paddingTop: 12,
                }}
              />

              <Bar
                name="Raised"
                dataKey="orders"
                fill="#0b6577"
                radius={[3, 3, 0, 0]}
                barSize={22}
              />

              <Bar
                name="Completed"
                dataKey="completed"
                fill="#146c43"
                radius={[3, 3, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 pb-4">
          <SectionHeading
            title="Plant Summary"
            sub="Maintenance performance plant by plant"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-raised border-y border-line text-[13px] text-ink-soft">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-5 py-2.5 text-left font-medium whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {summary.map((row) => (
                <tr
                  key={row.plant}
                  className="border-b border-line last:border-0 hover:bg-accent-soft/40 transition"
                >
                  <td className="px-5 py-2.5 font-medium text-ink">
                    {row.plant}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.orders}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.completed}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.breakdowns}
                  </td>

                  <td className="px-5 py-2.5 text-ink-soft">
                    {row.rate}
                  </td>

                  <td className="px-5 py-2.5">
                    <Badge value={row.health} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 &&
          breakdowns.length === 0 && (
            <div className="p-8 text-center border-t border-line">
              <p className="font-medium text-ink">
                No maintenance transaction data yet
              </p>

              <p className="text-sm text-ink-soft mt-1">
                Create Maintenance Orders or Breakdowns to
                populate this report.
              </p>
            </div>
          )}
      </Card>
    </div>
  );
}
