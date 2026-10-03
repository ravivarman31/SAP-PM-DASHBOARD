export const plants = [
  "M001",
  "M002",
  "M003",
  "T001",
  "T002",
  "T003",
];

// Single source of truth for all SAP PM modules
export const PLANT_MASTER_DATA = plants.map((code) => ({
  id: code,
  code,
  name: `Plant ${code}`,
}));