import { ListChecks } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "TL-1001",
    name: "Pump Preventive Maintenance",
    equipment: "EQ-1001",
    plant: "M001",
    type: "Preventive",
    status: "Active",
  },
  {
    id: "TL-1002",
    name: "Motor Inspection",
    equipment: "EQ-1002",
    plant: "M002",
    type: "Inspection",
    status: "Active",
  },
  {
    id: "TL-1003",
    name: "Compressor Maintenance",
    equipment: "EQ-1003",
    plant: "M003",
    type: "Corrective",
    status: "Active",
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

const typeOptions = [
  "Preventive",
  "Inspection",
  "Corrective",
];

const equipmentOptions = [
  "EQ-1001",
  "EQ-1002",
  "EQ-1003",
  "EQ-1004",
  "EQ-1005",
];

const config = {
  icon: ListChecks,

  title: "Task List",

  description:
    "Standardize preventive, inspection and corrective maintenance activities.",

  prefix: "TL",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl: "http://localhost:5000/api/task-lists",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      name: row.name || "",

      equipment: row.equipment || "",

      plant: row.plant || "",

      type: row.type || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      equipment: form.equipment,
      plant: form.plant,
      type: form.type,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: ["id", "name", "equipment", "plant"],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    name: "",
    equipment: "",
    plant: plants[0],
    type: "",
    status: "Active",
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
      value: "3",
      note: "Operational workload",
    },
    {
      label: "Completed",
      value: "0",
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
      label: "Task List ID",
    },

    {
      key: "name",
      label: "Task List Name",
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
      key: "type",
      label: "Type",
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
      label: "Task List ID",
    },

    {
      key: "name",
      label: "Task List Name",
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
      key: "type",
      label: "Type",
      options: typeOptions,
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function TaskList() {
  return <CrudPage config={config} />;
}