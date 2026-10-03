import { Gauge } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "MP-1001",
    name: "Pump Pressure",
    equipment: "EQ-1001",
    plant: "M001",
    value: "6.8 bar",
    status: "Active",
  },
  {
    id: "MP-1002",
    name: "Motor Temperature",
    equipment: "EQ-1002",
    plant: "M002",
    value: "72 °C",
    status: "Active",
  },
  {
    id: "MP-1003",
    name: "Compressor Vibration",
    equipment: "EQ-1003",
    plant: "M003",
    value: "4.2 mm/s",
    status: "Maintenance",
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
  icon: Gauge,

  title: "Measuring Point",

  description:
    "Monitor equipment characteristics and current readings.",

  prefix: "MP",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl: "http://localhost:5000/api/measuring-points",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      name: row.name || "",

      equipment: row.equipment || "",

      plant: row.plant || "",

      value: row.value || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      equipment: form.equipment,
      plant: form.plant,
      value: form.value,
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
    value: "",
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
      label: "Point ID",
    },

    {
      key: "name",
      label: "Point Name",
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
      label: "Current Value",
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
      label: "Point ID",
    },

    {
      key: "name",
      label: "Point Name",
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
      key: "value",
      label: "Current Value",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function MeasuringPoint() {
  return <CrudPage config={config} />;
}