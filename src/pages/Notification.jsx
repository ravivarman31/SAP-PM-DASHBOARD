
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
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

const priorityOptions = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const statusOptions = [
  "Open",
  "In Progress",
  "Completed",
  "Cancelled",
];

const emptyForm = {
  id: "",
  plant: "",
  equipment: "",
  functionalLocation: "",
  description: "",
  priority: "Medium",
  status: "Open",
};

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] =
    useState("All Plants");
  const [selectedStatus, setSelectedStatus] =
    useState("All Status");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [error, setError] = useState("");

  // =========================
  // LOAD NOTIFICATIONS
  // =========================
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/notifications`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load notifications"
        );
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : result.data || [];

      setNotifications(
        rows.map((item) => ({
          ...item,
          _mongoId: item._id,
          id: item.code || item.id || "",
          plant: item.plant || "",
          equipment: item.equipment || "",
          functionalLocation:
            item.functionalLocation || "",
          description:
            item.description || "",
          priority:
            item.priority || "Medium",
          status:
            item.status || "Open",
          createdDate:
            item.createdDate ||
            item.createdAt ||
            "",
        }))
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load notification data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredNotifications = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return notifications.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.id
          .toLowerCase()
          .includes(searchText) ||
        item.plant
          .toLowerCase()
          .includes(searchText) ||
        item.equipment
          .toLowerCase()
          .includes(searchText) ||
        item.functionalLocation
          .toLowerCase()
          .includes(searchText) ||
        item.description
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
  }, [
    notifications,
    search,
    selectedPlant,
    selectedStatus,
  ]);

  // =========================
  // PRIORITY STYLE
  // =========================
  const getPriorityStyle = (priority) => {
    if (priority === "Critical") {
      return "bg-red-100 text-red-700";
    }

    if (priority === "High") {
      return "bg-orange-100 text-orange-700";
    }

    if (priority === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    if (status === "Open") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setFormData({
      ...emptyForm,
      plant: plants[0] || "",
    });

    setEditingId(null);
  };

  // =========================
  // ADD
  // =========================
  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // =========================
  // SAVE / UPDATE
  // =========================
  const handleSave = async () => {
    if (
      !formData.id ||
      !formData.plant ||
      !formData.description
    ) {
      alert(
        "Please fill Notification ID, Plant and Problem Description."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: formData.id,
        name: formData.description,
        plant: formData.plant,
        equipment: formData.equipment,
        functionalLocation:
          formData.functionalLocation,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        createdDate:
          editingId
            ? formData.createdDate
            : new Date().toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ),
      };

      const response = await fetch(
        editingId
          ? `${API_URL}/notifications/${editingId}`
          : `${API_URL}/notifications`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save notification"
        );
      }

      await loadNotifications();

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to save notification."
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
      plant: item.plant,
      equipment: item.equipment,
      functionalLocation:
        item.functionalLocation,
      description: item.description,
      priority: item.priority,
      status: item.status,
      createdDate: item.createdDate,
    });

    setEditingId(
      item._mongoId || item._id
    );

    setShowModal(true);
  };

  // =========================
  // VIEW
  // =========================
  const handleView = (item) => {
    setSelectedNotification(item);
    setShowViewModal(true);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Delete notification ${item.id}?`
    );

    if (!confirmDelete) return;

    try {
      const mongoId =
        item._mongoId || item._id;

      const response = await fetch(
        `${API_URL}/notifications/${mongoId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete notification"
        );
      }

      await loadNotifications();
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to delete notification."
      );
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell size={21} />
            </div>

            <h1 className="text-3xl font-bold text-slate-800">
              Maintenance Notification
            </h1>
          </div>

          <p className="mt-2 text-slate-500">
            Record and manage maintenance problems
            reported from plant operations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Notification
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTERS */}
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
                placeholder="Search notification..."
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
                <option
                  key={plant}
                  value={plant}
                >
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
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Notification List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing{" "}
            {filteredNotifications.length} of{" "}
            {notifications.length} notifications
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Notification ID
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Plant
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Equipment
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Problem Description
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Priority
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
                      Loading notifications...
                    </div>
                  </td>
                </tr>
              ) : filteredNotifications.length >
                0 ? (
                filteredNotifications.map(
                  (item) => (
                    <tr
                      key={
                        item._mongoId ||
                        item.id
                      }
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-blue-600">
                        {item.id}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {item.plant}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.equipment || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <div className="truncate">
                          {item.description}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
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
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-yellow-50 hover:text-yellow-600"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item)
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingId
                    ? "Edit Notification"
                    : "Create Notification"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record a maintenance problem.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Notification ID *
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
                  placeholder="NT-1001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Plant *
                </label>

                <select
                  value={formData.plant}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plant: e.target.value,
                    })
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Equipment
                </label>

                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipment:
                        e.target.value,
                    })
                  }
                  placeholder="EQ-1001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Functional Location
                </label>

                <input
                  type="text"
                  value={
                    formData.functionalLocation
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      functionalLocation:
                        e.target.value,
                    })
                  }
                  placeholder="FL-M001-001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Problem Description *
                </label>

                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe the maintenance problem..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Priority
                </label>

                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    )
                  )}
                </select>
              </div>

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

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                  ? "Update Notification"
                  : "Save Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal &&
        selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Notification Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedNotification.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedNotification(
                      null
                    );
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 p-6">
                <div>
                  <p className="text-xs text-slate-400">
                    Notification ID
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {selectedNotification.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Plant
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {selectedNotification.plant}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Equipment
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {selectedNotification.equipment ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Functional Location
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {selectedNotification.functionalLocation ||
                      "-"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-slate-400">
                    Problem Description
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {
                      selectedNotification.description
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Priority
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                      selectedNotification.priority
                    )}`}
                  >
                    {
                      selectedNotification.priority
                    }
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                      selectedNotification.status
                    )}`}
                  >
                    {selectedNotification.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedNotification(
                      null
                    );
                  }}
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

export default Notification;

