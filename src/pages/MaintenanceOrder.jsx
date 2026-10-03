import { ClipboardList } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "MO-1042",
    description: "Pump Bearing Replacement",
    equipment: "EQ-1001",
    plant: "M001",
    priority: "High",
    status: "Open",
  },
  {
    id: "MO-1041",
    description: "Motor Preventive Service",
    equipment: "EQ-1002",
    plant: "M002",
    priority: "Medium",
    status: "Completed",
  },
  {
    id: "MO-1040",
    description: "Compressor Inspection",
    equipment: "EQ-1003",
    plant: "M003",
    priority: "Critical",
    status: "Pending",
  },
];

const statusOptions = [
  "Active",
  "Inactive",
  "Open",
  "Completed",
  "Pending",
  "Approved",
  "Maintenance",
  "Critical",
  "High",
  "Medium",
  "Low",
];

const priorityOptions = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const equipmentOptions = [
  "EQ-1001",
  "EQ-1002",
  "EQ-1003",
  "EQ-1004",
  "EQ-1005",
];

const config = {
  icon: ClipboardList,

  title: "Maintenance Order",

  description:
    "Plan, execute and control maintenance work orders.",

  prefix: "MO",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/maintenance-orders",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      description: row.description || "",

      equipment: row.equipment || "",

      plant: row.plant || "",

      priority: row.priority || "Medium",

      status: row.status || "Open",
    }),

    toPayload: (form) => ({
      code: form.id,
      description: form.description,
      equipment: form.equipment,
      plant: form.plant,
      priority: form.priority,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: [
    "id",
    "description",
    "equipment",
    "plant",
  ],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    description: "",
    equipment: "",
    plant: plants[0],
    priority: "Medium",
    status: "Open",
  },

  // =========================
  // DASHBOARD STATS
  // =========================
  stats: [
    {
      label: "Total Records",
      value: "42",
      note: "Live PM records",
    },
    {
      label: "Active / Open",
      value: "2",
      note: "Operational workload",
    },
    {
      label: "Completed",
      value: "1",
      note: "Closed records",
    },
    {
      label: "Plant Coverage",
      value: "6/6",
      note: "PM plant network",
    },
  ],

  // =========================
  // STATUS OPTIONS
  // =========================
  statuses: statusOptions,

  // =========================
  // TABLE COLUMNS
  // =========================
  columns: [
    {
      key: "id",
      label: "Order ID",
    },

    {
      key: "description",
      label: "Description",
    },

    {
      key: "equipment",
      label: "Equipment",
    },

    {
      key: "plant",
      label: "Plant",
    },

    {
      key: "priority",
      label: "Priority",
    },

    {
      key: "status",
      label: "Status",

      render: (row) => (
        <Badge value={row.status} />
      ),
    },
  ],

  // =========================
  // FORM FIELDS
  // =========================
  fields: [
    {
      key: "id",
      label: "Order ID",
    },

    {
      key: "description",
      label: "Description",
    },

    {
      key: "equipment",
      label: "Equipment",
      options: equipmentOptions,
    },

    {
      key: "plant",
      label: "Plant",
      options: plants,
    },

    {
      key: "priority",
      label: "Priority",
      options: priorityOptions,
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function MaintenanceOrder() {
  return <CrudPage config={config} />;
}