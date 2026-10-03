import { Archive } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "AS-1001",
    name: "Production Pump Asset",
    equipment: "EQ-1001",
    plant: "M001",
    category: "Mechanical",
    status: "Active",
  },
  {
    id: "AS-1002",
    name: "Motor Asset",
    equipment: "EQ-1002",
    plant: "M002",
    category: "Electrical",
    status: "Active",
  },
  {
    id: "AS-1003",
    name: "Compressor Asset",
    equipment: "EQ-1003",
    plant: "M003",
    category: "Utility",
    status: "Inactive",
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

const equipmentOptions = [
  "EQ-1001",
  "EQ-1002",
  "EQ-1003",
  "EQ-1004",
  "EQ-1005",
];

const categoryOptions = [
  "Mechanical",
  "Electrical",
  "Utility",
  "Production",
  "Maintenance",
  "Other",
];

const config = {
  icon: Archive,

  title: "Asset",

  description:
    "Track asset identity, category, ownership and operational state.",

  prefix: "AS",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl: "http://localhost:5000/api/assets",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      name: row.name || "",

      equipment: row.equipment || "",

      plant: row.plant || "",

      category: row.category || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      equipment: form.equipment,
      plant: form.plant,
      category: form.category,
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
    category: "",
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
      value: "2",
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
      label: "Asset ID",
    },

    {
      key: "name",
      label: "Asset Name",
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
      key: "category",
      label: "Category",
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
      label: "Asset ID",
    },

    {
      key: "name",
      label: "Asset Name",
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
      key: "category",
      label: "Category",
      options: categoryOptions,
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function Asset() {
  return <CrudPage config={config} />;
}