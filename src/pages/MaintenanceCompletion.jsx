import { CircleCheckBig } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "MC-1001",
    order: "MO-1041",
    plant: "M002",
    equipment: "EQ-1002",
    date: "17 Sep 2026",
    status: "Completed",
  },
  {
    id: "MC-1002",
    order: "MO-1039",
    plant: "T001",
    equipment: "EQ-1004",
    date: "16 Sep 2026",
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

const orderOptions = [
  "MO-1042",
  "MO-1041",
  "MO-1040",
  "MO-1039",
];

const equipmentOptions = [
  "EQ-1001",
  "EQ-1002",
  "EQ-1003",
  "EQ-1004",
  "EQ-1005",
];

const config = {
  icon: CircleCheckBig,

  title: "Maintenance Completion",

  description:
    "Close maintenance orders with completion details and remarks.",

  prefix: "MC",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/maintenance-completions",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      order: row.order || "",

      plant: row.plant || "",

      equipment: row.equipment || "",

      date: row.date || "",

      status: row.status || "Completed",
    }),

    toPayload: (form) => ({
      code: form.id,
      order: form.order,
      plant: form.plant,
      equipment: form.equipment,
      date: form.date,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: [
    "id",
    "plant",
    "equipment",
  ],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    order: "",
    plant: plants[0],
    equipment: "",
    date: "",
    status: "Completed",
  },

  // =========================
  // DASHBOARD STATS
  // =========================
  stats: [
    {
      label: "Total Records",
      value: "41",
      note: "Live PM records",
    },
    {
      label: "Active / Open",
      value: "0",
      note: "Operational workload",
    },
    {
      label: "Completed",
      value: "2",
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
      label: "Completion ID",
    },

    {
      key: "order",
      label: "Maintenance Order",
    },

    {
      key: "plant",
      label: "Plant",
    },

    {
      key: "equipment",
      label: "Equipment",
    },

    {
      key: "date",
      label: "Completion Date",
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
      label: "Completion ID",
    },

    {
      key: "order",
      label: "Maintenance Order",
      options: orderOptions,
    },

    {
      key: "plant",
      label: "Plant",
      options: plants,
    },

    {
      key: "equipment",
      label: "Equipment",
      options: equipmentOptions,
    },

    {
      key: "date",
      label: "Completion Date",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function MaintenanceCompletion() {
  return <CrudPage config={config} />;
}