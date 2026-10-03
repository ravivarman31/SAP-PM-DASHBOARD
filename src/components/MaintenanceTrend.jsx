import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MaintenanceTrend() {
  const data = [
    { month: "Jan", orders: 32 },
    { month: "Feb", orders: 45 },
    { month: "Mar", orders: 38 },
    { month: "Apr", orders: 52 },
    { month: "May", orders: 48 },
    { month: "Jun", orders: 64 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Maintenance Trend
        </h2>

        <p className="text-sm text-slate-500">
          Monthly maintenance orders
        </p>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="orders"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MaintenanceTrend;