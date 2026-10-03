import { Ruler } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "MD-1001",
    point: "MP-1001",
    equipment: "EQ-1001",
    plant: "M001",
    value: "6.8 bar",
    status: "Completed",
  },
  {
    id: "MD-1002",
    point: "MP-1002",
    equipment: "EQ-1002",
    plant: "M002",
    value: "72 °C",
    status: "Completed",
  },
  {
    id: "MD-1003",
    point: "MP-1003",
    equipment: "EQ-1003",
    plant: "M003",
    value: "4.2 mm/s",
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

const measuringPointOptions = [
  "MP-1001",
  "MP-1002",
  "MP-1003",
];

const equipmentOptions = [
  "EQ-1001",
  "EQ-1002",
  "EQ-1003",
  "EQ-1004",
  "EQ-1005",
];

const config = {
  icon: Ruler,

  title: "Measuring Document",

  description:
    "Capture historical readings from PM measuring points.",

  prefix: "MD",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/measuring-documents",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      point: row.point || "",

      equipment: row.equipment || "",

      plant: row.plant || "",

      value: row.value || "",

      status: row.status || "Pending",
    }),

    toPayload: (form) => ({
      code: form.id,
      point: form.point,
      equipment: form.equipment,
      plant: form.plant,
      value: form.value,
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
    point: "",
    equipment: "",
    plant: plants[0],
    value: "",
    status: "Pending",
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
      value: "1",
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
      label: "Document ID",
    },

    {
      key: "point",
      label: "Measuring Point",
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
      key: "value",
      label: "Reading",
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
      label: "Document ID",
    },

    {
      key: "point",
      label: "Measuring Point",
      options: measuringPointOptions,
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
      key: "value",
      label: "Reading",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function MeasuringDocument() {
  return <CrudPage config={config} />;
}