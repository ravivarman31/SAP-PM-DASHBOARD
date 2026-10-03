
import { useEffect, useMemo, useState } from "react";
import {
  Cog,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { plants } from "../lib/plants";

const API_URL = "http://localhost:5000/api";

const statusOptions = [
  "Active",
  "Inactive",
  "Maintenance",
];

const categoryOptions = [
  "Pump",
  "Motor",
  "Compressor",
  "Valve",
  "Conveyor",
  "Generator",
  "Transformer",
  "Boiler",
  "Fan",
  "Other",
];

const emptyForm = {
  id: "",
  name: "",
  plant: "",
  functionalLocation: "",
  category: "",
  status: "Active",
};

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [functionalLocations, setFunctionalLocations] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("All Plants");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // LOAD EQUIPMENT
  // =========================
  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/equipment`);

      if (!response.ok) {
        throw new Error("Failed to load equipment");
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : result.data || [];

      setEquipment(
        rows.map((item) => ({
          ...item,
          _mongoId: item._id,
          id: item.code || item.id || "",
          name: item.name || "",
          plant: item.plant || "",
          functionalLocation:
            item.functionalLocation || "",
          category: item.category || "",
          status: item.status || "Active",
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load equipment data.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD FUNCTIONAL LOCATIONS
  // =========================
  const loadFunctionalLocations = async () => {
    try {
      const response = await fetch(
        `${API_URL}/functional-locations`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load functional locations"
        );
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : result.data || [];

      setFunctionalLocations(
        rows.map((item) => ({
          ...item,
          id: item.code || item.id || "",
          name: item.name || "",
          plant: item.plant || "",
        }))
      );
    } catch (err) {
      console.error(err);
      setFunctionalLocations([]);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadEquipment();
    loadFunctionalLocations();
  }, []);

  // =========================
  // FILTER FUNCTIONAL LOCATIONS
  // BY SELECTED PLANT
  // =========================
  const filteredFunctionalLocations = useMemo(() => {
    if (!formData.plant) {
      return [];
    }

    return functionalLocations.filter(
      (item) => item.plant === formData.plant
    );
  }, [functionalLocations, formData.plant]);

  // =========================
  // FILTER EQUIPMENT TABLE
  // =========================
  const filteredEquipment = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return equipment.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText) ||
        item.name.toLowerCase().includes(searchText) ||
        item.plant.toLowerCase().includes(searchText) ||
        item.functionalLocation
          .toLowerCase()
          .includes(searchText) ||
        item.category.toLowerCase().includes(searchText);

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
  }, [
    equipment,
    search,
    selectedPlant,
    selectedStatus,
  ]);

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    if (status === "Active") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Maintenance") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      ...emptyForm,
      plant: plants[0] || "",
    });

    setEditingId(null);
  };

  // =========================
  // OPEN ADD
  // =========================
  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // =========================
  // PLANT CHANGE
  // =========================
  const handlePlantChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      plant: value,
      functionalLocation: "",
    }));
  };

  // =========================
  // SAVE / UPDATE
  // =========================
  const handleSave = async () => {
    if (
      !formData.id ||
      !formData.name ||
      !formData.plant ||
      !formData.functionalLocation
    ) {
      alert(
        "Please fill all required fields including Functional Location."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: formData.id,
        name: formData.name,
        plant: formData.plant,
        functionalLocation:
          formData.functionalLocation,
        category: formData.category,
        status: formData.status,
      };

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/equipment/${editingId}`
        : `${API_URL}/equipment`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save equipment"
        );
      }

      await loadEquipment();

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(
        err.message || "Unable to save equipment."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      plant: item.plant,
      functionalLocation:
        item.functionalLocation || "",
      category: item.category,
      status: item.status,
    });

    setEditingId(item._mongoId || item._id);

    setShowModal(true);
  };

  // =========================
  // VIEW
  // =========================
  const handleView = (item) => {
    setSelectedEquipment(item);
    setShowViewModal(true);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${item.id}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const mongoId =
        item._mongoId || item._id;

      const response = await fetch(
        `${API_URL}/equipment/${mongoId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete equipment"
        );
      }

      await loadEquipment();
    } catch (err) {
      console.error(err);
      alert(
        err.message || "Unable to delete equipment."
      );
    }
  };

  // =========================
  // CLOSE FORM
  // =========================
  const handleCloseForm = () => {
    setShowModal(false);
    resetForm();
  };

  // =========================
  // CLOSE VIEW
  // =========================
  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedEquipment(null);
  };

  return (
    <div>
      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Cog size={21} />
            </div>

            <h1 className="text-3xl font-bold text-slate-800">
              Equipment
            </h1>
          </div>

          <p className="mt-2 text-slate-500">
            Manage technical equipment and plant
            functional location assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Equipment
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          SEARCH / FILTER
      ========================= */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Search
            </label>

            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search equipment..."
                className="w-full text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Plant
            </label>

            <select
              value={selectedPlant}
              onChange={(e) =>
                setSelectedPlant(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Plants</option>

              {plants.map((plant) => (
                <option key={plant} value={plant}>
                  {plant}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Status
            </label>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Equipment List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredEquipment.length} of{" "}
            {equipment.length} equipment records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Equipment ID
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Equipment Name
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Plant
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Functional Location
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Category
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-5 py-4 text-center font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                      Loading equipment...
                    </div>
                  </td>
                </tr>
              ) : filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <tr
                    key={item._mongoId || item.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {item.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.plant}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.functionalLocation || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.category || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(item)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-yellow-50 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No equipment found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredEquipment.length} of{" "}
            {equipment.length} equipment records
          </p>
        </div>
      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingId
                    ? "Edit Equipment"
                    : "Add Equipment"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update equipment details"
                    : "Create a new equipment record"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Equipment ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Equipment ID *
                  </label>

                  <input
                    type="text"
                    value={formData.id}
                    disabled={Boolean(editingId)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        id: e.target.value,
                      })
                    }
                    placeholder="EQ-1001"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                </div>

                {/* Equipment Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Equipment Name *
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Centrifugal Pump"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Plant */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Plant *
                  </label>

                  <select
                    value={formData.plant}
                    onChange={(e) =>
                      handlePlantChange(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Plant
                    </option>

                    {plants.map((plant) => (
                      <option
                        key={plant}
                        value={plant}
                      >
                        {plant}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Functional Location */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Functional Location *
                  </label>

                  <select
                    value={formData.functionalLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        functionalLocation:
                          e.target.value,
                      })
                    }
                    disabled={!formData.plant}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      {!formData.plant
                        ? "Select Plant First"
                        : filteredFunctionalLocations.length ===
                          0
                        ? "No Functional Locations"
                        : "Select Functional Location"}
                    </option>

                    {filteredFunctionalLocations.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.id} - {item.name}
                        </option>
                      )
                    )}
                  </select>

                  {formData.plant &&
                    filteredFunctionalLocations.length ===
                      0 && (
                      <p className="mt-1 text-xs text-orange-600">
                        No Functional Location is
                        available for this plant.
                      </p>
                    )}
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categoryOptions.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Equipment"
                  : "Save Equipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          VIEW MODAL
      ========================= */}
      {showViewModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Equipment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedEquipment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseView}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 p-6">
              <div>
                <p className="text-xs text-slate-400">
                  Equipment ID
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedEquipment.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Equipment Name
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedEquipment.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Plant
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedEquipment.plant}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Functional Location
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedEquipment.functionalLocation ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Category
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedEquipment.category || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                    selectedEquipment.status
                  )}`}
                >
                  {selectedEquipment.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseView}
                className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
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

export default Equipment;
