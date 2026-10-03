import { BriefcaseBusiness } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "WC-1001",
    name: "Mechanical Team",
    plant: "M001",
    capacity: "8 Technicians",
    status: "Active",
  },
  {
    id: "WC-1002",
    name: "Electrical Team",
    plant: "M002",
    capacity: "6 Technicians",
    status: "Active",
  },
  {
    id: "WC-1003",
    name: "Utility Team",
    plant: "M003",
    capacity: "5 Technicians",
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
  icon: BriefcaseBusiness,

  title: "Work Center",

  description:
    "Manage maintenance teams, skills and execution capacity.",

  prefix: "WC",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl: "http://localhost:5000/api/work-centers",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      name: row.name || "",

      plant: row.plant || "",

      capacity: row.capacity || "",

      status: row.status || "Active",
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      plant: form.plant,
      capacity: form.capacity,
      status: form.status,
    }),
  },

  // =========================
  // REQUIRED FIELDS
  // =========================
  required: ["id", "name", "plant"],

  // =========================
  // EMPTY FORM
  // =========================
  empty: {
    id: "",
    name: "",
    plant: plants[0],
    capacity: "",
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
      label: "Work Center ID",
    },

    {
      key: "name",
      label: "Work Center Name",
    },

    {
      key: "plant",
      label: "Plant",
    },

    {
      key: "capacity",
      label: "Capacity",
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
      label: "Work Center ID",
    },

    {
      key: "name",
      label: "Work Center Name",
    },

    {
      key: "plant",
      label: "Plant",
      options: plants,
    },

    {
      key: "capacity",
      label: "Capacity",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function WorkCenter() {
  return <CrudPage config={config} />;
}