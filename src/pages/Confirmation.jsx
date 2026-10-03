import { CheckCircle2 } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "CF-1001",
    order: "MO-1041",
    plant: "M002",
    technician: "Technician A",
    hours: "5.5",
    status: "Completed",
  },
  {
    id: "CF-1002",
    order: "MO-1039",
    plant: "T001",
    technician: "Technician B",
    hours: "3.0",
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

const technicianOptions = [
  "Technician A",
  "Technician B",
  "Technician C",
  "Technician D",
];

const config = {
  icon: CheckCircle2,

  title: "Confirmation",

  description:
    "Record technician effort, hours and completion confirmation.",

  prefix: "CF",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/confirmations",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      order: row.order || "",

      plant: row.plant || "",

      technician: row.technician || "",

      hours: row.hours || "",

      status: row.status || "Completed",
    }),

    toPayload: (form) => ({
      code: form.id,
      order: form.order,
      plant: form.plant,
      technician: form.technician,
      hours: form.hours,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: [
    "id",
    "plant",
  ],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    order: "",
    plant: plants[0],
    technician: "",
    hours: "",
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
      label: "Confirmation ID",
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
      key: "technician",
      label: "Technician",
    },

    {
      key: "hours",
      label: "Hours",
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
      label: "Confirmation ID",
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
      key: "technician",
      label: "Technician",
      options: technicianOptions,
    },

    {
      key: "hours",
      label: "Hours",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function Confirmation() {
  return <CrudPage config={config} />;
}