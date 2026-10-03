import { Filter, RotateCcw } from "lucide-react";

function FilterBar() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={19} className="text-blue-600" />

          <h2 className="font-semibold text-slate-800">
            Dashboard Filters
          </h2>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plant */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Plant
          </label>

          <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Plants</option>
            <option>Chennai Plant</option>
            <option>Bangalore Plant</option>
            <option>Coimbatore Plant</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Date
          </label>

          <input
            type="date"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Status
          </label>

          <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Priority
          </label>

          <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;