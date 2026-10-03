import { ShieldCheck } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import { plants } from "../lib/plants";

const data = [
  {
    id: "PT-1001",
    order: "MO-1042",
    plant: "M001",
    type: "Work Permit",
    validity: "18 Sep 2026",
    status: "Approved",
  },
  {
    id: "PT-1002",
    order: "MO-1040",
    plant: "M003",
    type: "Hot Work",
    validity: "18 Sep 2026",
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

const orderOptions = [
  "MO-1042",
  "MO-1041",
  "MO-1040",
];

const permitTypeOptions = [
  "Work Permit",
  "Hot Work",
  "Cold Work",
  "Electrical Permit",
  "Confined Space",
  "Height Work",
];

const config = {
  icon: ShieldCheck,

  title: "Permit",

  description:
    "Control safety authorization before maintenance work begins.",

  prefix: "PT",

  data,

  // =========================
  // BACKEND API
  // =========================
  api: {
    baseUrl:
      "http://localhost:5000/api/permits",

    mapRow: (row) => ({
      ...row,

      _mongoId: row._id,

      id: row.code || row.id,

      order: row.order || "",

      plant: row.plant || "",

      type: row.type || "",

      validity: row.validity || "",

      status: row.status || "Pending",
    }),

    toPayload: (form) => ({
      code: form.id,
      order: form.order,
      plant: form.plant,
      type: form.type,
      validity: form.validity,
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
    type: "",
    validity: "",
    status: "Pending",
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
      label: "Permit ID",
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
      key: "type",
      label: "Permit Type",
    },

    {
      key: "validity",
      label: "Validity",
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
      label: "Permit ID",
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
      key: "type",
      label: "Permit Type",
      options: permitTypeOptions,
    },

    {
      key: "validity",
      label: "Validity",
    },

    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ],
};

export default function Permit() {
  return <CrudPage config={config} />;
}