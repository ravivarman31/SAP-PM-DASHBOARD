import { Eye } from "lucide-react";

function RecentOrders() {
  const orders = [
    {
      id: "MO-1001",
      equipment: "PUMP-001",
      description: "Pump preventive maintenance",
      priority: "High",
      status: "Open",
      date: "17 Sep 2026",
    },
    {
      id: "MO-1002",
      equipment: "MOTOR-024",
      description: "Motor inspection",
      priority: "Medium",
      status: "In Progress",
      date: "16 Sep 2026",
    },
    {
      id: "MO-1003",
      equipment: "COMP-018",
      description: "Compressor maintenance",
      priority: "Low",
      status: "Completed",
      date: "15 Sep 2026",
    },
    {
      id: "MO-1004",
      equipment: "VALVE-007",
      description: "Valve replacement",
      priority: "High",
      status: "Open",
      date: "14 Sep 2026",
    },
    {
      id: "MO-1005",
      equipment: "PUMP-014",
      description: "Pump breakdown repair",
      priority: "High",
      status: "In Progress",
      date: "13 Sep 2026",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-100 text-red-700";
    }

    if (priority === "Medium") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Maintenance Orders
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest maintenance activities
          </p>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Order ID
              </th>

              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Equipment
              </th>

              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Description
              </th>

              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Priority
              </th>

              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Status
              </th>

              <th className="text-left px-6 py-4 font-semibold text-slate-600">
                Date
              </th>

              <th className="text-center px-6 py-4 font-semibold text-slate-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 font-medium text-blue-600">
                  {order.id}
                </td>

                <td className="px-6 py-4 font-medium text-slate-700">
                  {order.equipment}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {order.description}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyle(
                      order.priority
                    )}`}
                  >
                    {order.priority}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {order.date}
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrders;