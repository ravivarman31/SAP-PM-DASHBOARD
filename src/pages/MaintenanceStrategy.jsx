import { Target } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "MS-1001",
    name: "Pump Monthly PM",
    cycle: "30 Days",
    plant: "M001",
    method: "Time Based",
    status: "Active",
  },
  {
    id: "MS-1002",
    name: "Motor Quarterly PM",
    cycle: "90 Days",
    plant: "M002",
    method: "Time Based",
    status: "Active",
  },
  {
    id: "MS-1003",
    name: "Compressor Condition PM",
    cycle: "250 Hours",
    plant: "M003",
    method: "Performance Based",
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

const cycleOptions = [
  "7 Days",
  "15 Days",
  "30 Days",
  "60 Days",
  "90 Days",
  "180 Days",
  "365 Days",
  "100 Hours",
  "250 Hours",
  "500 Hours",
  "1000 Hours",
];

const methodOptions = [
  "Time Based",
  "Performance Based",
];

const config = {
  icon: Target,

  title: "Maintenance Strategy",

  description:
    "Define recurring maintenance strategies and inspection cycles.",

  prefix: "MS",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/maintenance-strategies",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      name: row.name || "",

      cycle: row.cycle || "",

      plant: row.plant || "",

      method: row.method || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      cycle: form.cycle,
      plant: form.plant,
      method: form.method,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: [
    "id",
    "name",
    "plant",
  ],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    name: "",
    cycle: "",
    plant: plants[0],
    method: "",
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
      label: "Strategy ID",
    },

    {
      key: "name",
      label: "Strategy Name",
    },

    {
      key: "cycle",
      label: "Cycle",
    },

    {
      key: "plant",
      label: "Plant",
    },

    {
      key: "method",
      label: "Method",
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
      label: "Strategy ID",
    },

    {
      key: "name",
      label: "Strategy Name",
    },

    {
      key: "cycle",
      label: "Cycle",
      options: cycleOptions,
    },

    {
      key: "plant",
      label: "Plant",
      options: plants,
    },

    {
      key: "method",
      label: "Method",
      options: methodOptions,
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function MaintenanceStrategy() {
  return <CrudPage config={config} />;
}