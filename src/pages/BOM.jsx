import { Boxes } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "BOM-1001",
    equipment: "EQ-1001",
    plant: "M001",
    components: "Bearing, Seal, Coupling",
    status: "Active",
  },
  {
    id: "BOM-1002",
    equipment: "EQ-1002",
    plant: "M002",
    components: "Bearing, Fan, Terminal",
    status: "Active",
  },
  {
    id: "BOM-1003",
    equipment: "EQ-1003",
    plant: "M003",
    components: "Filter, Belt, Oil",
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

const config = {
  icon: Boxes,

  title: "Bill of Material",

  description:
    "Maintain equipment component structures and spare-part quantities.",

  prefix: "BOM",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl: "http://localhost:5000/api/boms",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      equipment: row.equipment || "",

      plant: row.plant || "",

      components: row.components || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      equipment: form.equipment,
      plant: form.plant,
      components: form.components,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: ["id", "equipment", "plant"],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    equipment: "",
    plant: plants[0],
    components: "",
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
      label: "BOM ID",
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
      key: "components",
      label: "Components",
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
      label: "BOM ID",
    },

    {
      key: "equipment",
      label: "Equipment",
      options: [
        "EQ-1001",
        "EQ-1002",
        "EQ-1003",
        "EQ-1004",
        "EQ-1005",
      ],
    },

    {
      key: "plant",
      label: "Plant",
      options: plants,
    },

    {
      key: "components",
      label: "Components",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function BOM() {
  return <CrudPage config={config} />;
}