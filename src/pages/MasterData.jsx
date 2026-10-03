
import {
  Building2,
  MapPin,
  Settings,
  Gauge,
  Wrench,
  Package,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

function MasterData({ setCurrentPage }) {
  const masterDataItems = [
    {
      id: "plant",
      title: "Plant",
      description: "Manage plant and location information",
      icon: Building2,
    },
    {
      id: "functional-location",
      title: "Functional Location",
      description: "Manage plant functional locations",
      icon: MapPin,
    },
    {
      id: "equipment",
      title: "Equipment",
      description: "Manage maintenance equipment",
      icon: Settings,
    },
    {
      id: "measuring-point",
      title: "Measuring Point",
      description: "Manage equipment measurement points",
      icon: Gauge,
    },
    {
      id: "work-center",
      title: "Work Center",
      description: "Manage maintenance work centers",
      icon: Wrench,
    },
    {
      id: "bom",
      title: "Bill of Material",
      description: "Manage equipment spare parts and components",
      icon: Package,
    },
    {
      id: "task-list",
      title: "Task List",
      description: "Manage standard maintenance activities",
      icon: ClipboardList,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Master Data
        </h1>

        <p className="mt-2 text-slate-500">
          Manage SAP Plant Maintenance master data
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          SAP PM Master Data
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Master data contains the basic information used throughout
          the Plant Maintenance process.
        </p>
      </div>

      {/* Master Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {masterDataItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentPage(item.id)}
              className="bg-white border border-slate-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-blue-300 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon size={24} />
                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-300 group-hover:text-blue-600 transition"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-800">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MasterData;

