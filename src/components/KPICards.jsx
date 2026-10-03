import {
  Settings,
  Bell,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function KPICards() {
  const cards = [
    {
      title: "Total Equipment",
      value: "1,248",
      icon: Settings,
      description: "Registered equipment",
    },
    {
      title: "Open Notifications",
      value: "86",
      icon: Bell,
      description: "Pending notifications",
    },
    {
      title: "Open Orders",
      value: "42",
      icon: ClipboardList,
      description: "Active maintenance orders",
    },
    {
      title: "Breakdowns",
      value: "18",
      icon: AlertTriangle,
      description: "Current breakdowns",
    },
    {
      title: "Completed Orders",
      value: "324",
      icon: CheckCircle,
      description: "Completed this month",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Icon size={22} />
              </div>

              <span className="text-xs text-green-600 font-medium">
                Active
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              {card.title}
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-800">
              {card.value}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default KPICards;