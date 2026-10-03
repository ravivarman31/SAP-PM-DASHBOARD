import { TriangleAlert } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "BD-2001",
    equipment: "EQ-1001",
    plant: "M001",
    priority: "High",
    cause: "Bearing wear",
    status: "Open",
  },
  {
    id: "BD-2002",
    equipment: "EQ-1003",
    plant: "M003",
    priority: "Critical",
    cause: "Compressor trip",
    status: "Open",
  },
  {
    id: "BD-2003",
    equipment: "EQ-1005",
    plant: "T002",
    priority: "Medium",
    cause: "Seal leakage",
    status: "Completed",
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
  icon: TriangleAlert,

  title: "Breakdown",

  description:
    "Monitor equipment failures, severity and response status.",

  prefix: "BD",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/breakdowns",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      equipment: row.equipment || "",

      plant: row.plant || "",

      priority: row.priority || "Medium",

      cause: row.cause || "",

      status: row.status || "Open",
    }),

    toPayload: (form) => ({
      code: form.id,
      equipment: form.equipment,
      plant: form.plant,
      priority: form.priority,
      cause: form.cause,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: [
    "id",
    "equipment",
    "plant",
  ],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    equipment: "",
    plant: plants[0],
    priority: "Medium",
    cause: "",
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
      label: "Breakdown ID",
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
      key: "cause",
      label: "Cause",
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
      label: "Breakdown ID",
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
      key: "cause",
      label: "Cause",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function Breakdown() {
  return <CrudPage config={config} />;
}