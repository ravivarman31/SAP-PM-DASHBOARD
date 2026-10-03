
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/functional-locations";
const OPTIONS_URL = "http://localhost:5000/api/plants";
const EMPTY_FORM = {
  code: "",
  name: "",
  plant: "",
  parentLocation: "",
  category: "",
  status: "Active",
};

function FunctionalLocation() {
  const [locations, setLocations] = useState([]);
  const [plants, setPlants] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("All Plants");
  const [selectedStatus, setSelectedStatus] =
    useState("All Status");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // ======================================================
  // LOAD FUNCTIONAL LOCATIONS
  // ======================================================
  const loadLocations = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to load functional locations"
        );
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : result.data || [];

      setLocations(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load functional locations.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD PLANTS
  // ======================================================
  const loadPlants = async () => {
    try {
      const response = await fetch(OPTIONS_URL);

      if (!response.ok) {
        throw new Error("Failed to load plants");
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : result.data || [];

      setPlants(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load plant master data.");
    }
  };

  useEffect(() => {
    loadLocations();
    loadPlants();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================
  const filteredLocations = locations.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      String(item.code || item.id || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.parentLocation || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.category || "")
        .toLowerCase()
        .includes(searchText);

    const matchesPlant =
      selectedPlant === "All Plants" ||
      item.plant === selectedPlant;

    const matchesStatus =
      selectedStatus === "All Status" ||
      item.status === selectedStatus;

    return (
      matchesSearch &&
      matchesPlant &&
      matchesStatus
    );
  });

  // ======================================================
  // STATUS STYLE
  // ======================================================
  const getStatusStyle = (status) => {
    if (status === "Active") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Maintenance") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  // ======================================================
  // RESET FORM
  // ======================================================
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  // ======================================================
  // SAVE
  // ======================================================
  const handleSaveLocation = async () => {
    if (
      !formData.code ||
      !formData.name ||
      !formData.plant ||
      !formData.parentLocation ||
      !formData.category
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        plant: formData.plant,
        parentLocation: formData.parentLocation.trim(),
        category: formData.category,
        status: formData.status,
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save functional location"
        );
      }

      resetForm();
      setShowModal(false);

      await loadLocations();

      alert(
        editingId
          ? "Functional Location updated successfully."
          : "Functional Location created successfully."
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (item) => {
    setFormData({
      code: item.code || item.id || "",
      name: item.name || "",
      plant: item.plant || "",
      parentLocation: item.parentLocation || "",
      category: item.category || "",
      status: item.status || "Active",
    });

    setEditingId(item._id || item.id || item.code);
    setShowModal(true);
  };

  // ======================================================
  // VIEW
  // ======================================================
  const handleView = (item) => {
    setSelectedLocation(item);
    setShowViewModal(true);
  };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async (item) => {
    const id =
      item._id ||
      item.id ||
      item.code;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this functional location?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete functional location"
        );
      }

      await loadLocations();

      alert(
        "Functional Location deleted successfully."
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ======================================================
  // CLOSE FORM
  // ======================================================
  const handleCloseForm = () => {
    resetForm();
    setShowModal(false);
  };

  // ======================================================
  // CLOSE VIEW
  // ======================================================
  const handleCloseView = () => {
    setSelectedLocation(null);
    setShowViewModal(false);
  };

  return (
    <div>
      {/* ==================================================
          PAGE HEADER
      ================================================== */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Functional Location
          </h1>

          <p className="mt-1 text-slate-500">
            Manage plant functional location master data
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} />
          Add Functional Location
        </button>
      </div>

      {/* ==================================================
          SEARCH & FILTERS
      ================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Search
            </label>

            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                type="text"
                placeholder="Search ID, name, category..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          {/* Plant */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Plant
            </label>

            <select
              value={selectedPlant}
              onChange={(e) =>
                setSelectedPlant(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Plants">
                All Plants
              </option>

              {plants.map((plant) => (
                <option
                  key={plant.code || plant.id}
                  value={plant.code || plant.id}
                >
                  {plant.code || plant.id}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Status
            </label>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">
                All Status
              </option>
              <option value="Active">
                Active
              </option>
              <option value="Inactive">
                Inactive
              </option>
              <option value="Maintenance">
                Maintenance
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Functional Location List
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredLocations.length} of{" "}
            {locations.length} locations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Location ID
                </th>

                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Location Name
                </th>

                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Plant
                </th>

                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Parent Location
                </th>

                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Category
                </th>

                <th className="text-left px-5 py-4 font-semibold text-slate-600">
                  Status
                </th>

                <th className="text-center px-5 py-4 font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading functional locations...
                  </td>
                </tr>
              ) : filteredLocations.length > 0 ? (
                filteredLocations.map((item) => (
                  <tr
                    key={
                      item._id ||
                      item.id ||
                      item.code
                    }
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 font-medium text-blue-600">
                      {item.code || item.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.plant}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.parentLocation}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.category}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-xs font-medium " +
                          getStatusStyle(item.status)
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(item)
                          }
                          className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="p-2 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No functional locations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {filteredLocations.length} of{" "}
            {locations.length} locations
          </p>
        </div>
      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingId
                    ? "Edit Functional Location"
                    : "Add Functional Location"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingId
                    ? "Update functional location details"
                    : "Create a new functional location"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Location ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Location ID
                  </label>

                  <input
                    type="text"
                    placeholder="FL-M001-001"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value,
                      })
                    }
                    disabled={Boolean(editingId)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Location Name
                  </label>

                  <input
                    type="text"
                    placeholder="Production Area"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Plant Relationship */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Plant
                  </label>

                  <select
                    value={formData.plant}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plant: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Plant
                    </option>

                    {plants.map((plant) => (
                      <option
                        key={
                          plant.code || plant.id
                        }
                        value={
                          plant.code || plant.id
                        }
                      >
                        {plant.code || plant.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Parent Location
                  </label>

                  <input
                    type="text"
                    placeholder="M001-PROD"
                    value={
                      formData.parentLocation
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentLocation:
                          e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category:
                          e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Category
                    </option>

                    <option value="Production">
                      Production
                    </option>

                    <option value="Mechanical">
                      Mechanical
                    </option>

                    <option value="Electrical">
                      Electrical
                    </option>

                    <option value="Utility">
                      Utility
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={saving}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={saving}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Location"
                  : "Save Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MODAL
      ================================================== */}
      {showViewModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Functional Location Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedLocation.code ||
                    selectedLocation.id}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseView}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Location ID
                  </p>

                  <p className="font-medium text-slate-700 mt-1">
                    {selectedLocation.code ||
                      selectedLocation.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Location Name
                  </p>

                  <p className="font-medium text-slate-700 mt-1">
                    {selectedLocation.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Plant
                  </p>

                  <p className="font-medium text-blue-600 mt-1">
                    {selectedLocation.plant}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Parent Location
                  </p>

                  <p className="font-medium text-slate-700 mt-1">
                    {selectedLocation.parentLocation}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Category
                  </p>

                  <p className="font-medium text-slate-700 mt-1">
                    {selectedLocation.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span
                    className={
                      "inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium " +
                      getStatusStyle(
                        selectedLocation.status
                      )
                    }
                  >
                    {selectedLocation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseView}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FunctionalLocation;
