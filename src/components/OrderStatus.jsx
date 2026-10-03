import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function OrderStatus() {
  const data = [
    { name: "Open", value: 42 },
    { name: "In Progress", value: 28 },
    { name: "Completed", value: 64 },
    { name: "Cancelled", value: 8 },
  ];

  const COLORS = ["#2563eb", "#f59e0b", "#16a34a", "#ef4444"];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Order Status
        </h2>

        <p className="text-sm text-slate-500">
          Current maintenance order status
        </p>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OrderStatus;