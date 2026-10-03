import { Factory } from "lucide-react";
import { CrudPage, Badge } from "../components/PMUI";
import {
  plants,
  PLANT_MASTER_DATA,
} from "../lib/plants";

const data = PLANT_MASTER_DATA.map(
  (plant, index) => ({
    id: plant.code,
    name: plant.name,
    manager:
      index < 3
        ? "Operations Team"
        : "Technical Team",
    location:
      index < 3
        ? "Main Unit"
        : "Technical Unit",
    status: [
      "Active",
      "Active",
      "Maintenance",
      "Active",
      "Active",
      "Inactive",
    ][index],
  })
);

const config = {
  icon: Factory,

  title: "Plant",

  description:
    "Manage the six SAP PM plant locations and their operational status.",

  prefix: "PL",

  data,

  /* ================================================================
     BACKEND API
  ================================================================ */

  api: {
    baseUrl: "http://localhost:5000/api/plants",

    mapRow: (row) => ({
      ...row,

      // MongoDB _id used internally for PUT / DELETE
      _mongoId: row._id,

      // UI uses id as Plant Code
      id: row.code,
    }),

    toPayload: (form) => ({
      code: form.id,
      name: form.name,
      manager: form.manager,
      location: form.location,
      status: form.status,
    }),
  },

  required: [
    "id",
    "name",
  ],

  empty: {
    id: "",
    name: "",
    manager: "",
    location: "",
    status: "Active",
  },

  stats: [
    {
      label: "Total Records",
      value: "6",
      note: "SAP PM plants",
    },
    {
      label: "Active / Open",
      value: "4",
      note: "Operational plants",
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

  statuses: [
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
  ],

  columns: [
    {
      key: "id",
      label: "Plant ID",
    },

    {
      key: "name",
      label: "Plant Name",
    },

    {
      key: "manager",
      label: "Plant Manager",
    },

    {
      key: "location",
      label: "Location",
    },

    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge value={r.status} />
      ),
    },
  ],

  fields: [
    {
      key: "id",
      label: "Plant ID",
      options: plants,
    },

    {
      key: "name",
      label: "Plant Name",
    },

    {
      key: "manager",
      label: "Plant Manager",
    },

    {
      key: "location",
      label: "Location",
    },

    {
      key: "status",
      label: "Status",
      options: [
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
      ],
    },
  ],
};

export default function Plant() {
  return <CrudPage config={config} />;
}