
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/sap_pm_dashboard";

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =====================================================
// EXCEL UPLOAD
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// =====================================================
// PLANTS
// =====================================================

const PLANTS = [
  "M001",
  "M002",
  "M003",
  "T001",
  "T002",
  "T003",
];

// =====================================================
// COMMON OPTIONS
// =====================================================

const STATUS_OPTIONS = [
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

const PRIORITY_OPTIONS = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

// =====================================================
// MODULE DEFINITIONS
// =====================================================

const moduleDefinitions = [
  {
    key: "plants",
    sheetName: "Plants",
    modelName: "Plant",
  },
  {
    key: "functional-locations",
    sheetName: "FunctionalLocations",
    modelName: "FunctionalLocation",
  },
  {
    key: "equipment",
    sheetName: "Equipment",
    modelName: "Equipment",
  },
  {
    key: "measuring-points",
    sheetName: "MeasuringPoints",
    modelName: "MeasuringPoint",
  },
  {
    key: "work-centers",
    sheetName: "WorkCenters",
    modelName: "WorkCenter",
  },
  {
    key: "boms",
    sheetName: "BOMs",
    modelName: "BOM",
  },
  {
    key: "task-lists",
    sheetName: "TaskLists",
    modelName: "TaskList",
  },
  {
    key: "assets",
    sheetName: "Assets",
    modelName: "Asset",
  },
  {
    key: "measuring-documents",
    sheetName: "MeasuringDocuments",
    modelName: "MeasuringDocument",
  },
  {
    key: "maintenance-strategies",
    sheetName: "MaintenanceStrategies",
    modelName: "MaintenanceStrategy",
  },
  {
    key: "notifications",
    sheetName: "Notifications",
    modelName: "Notification",
  },
  {
    key: "breakdowns",
    sheetName: "Breakdowns",
    modelName: "Breakdown",
  },
  {
    key: "maintenance-orders",
    sheetName: "MaintenanceOrders",
    modelName: "MaintenanceOrder",
  },
  {
    key: "permits",
    sheetName: "Permits",
    modelName: "Permit",
  },
  {
    key: "confirmations",
    sheetName: "Confirmations",
    modelName: "Confirmation",
  },
  {
    key: "maintenance-completions",
    sheetName: "MaintenanceCompletions",
    modelName: "MaintenanceCompletion",
  },
];

// =====================================================
// GENERIC SCHEMA
// =====================================================

const genericSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    plant: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      default: "Active",
      trim: true,
    },

    priority: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// =====================================================
// CREATE MODELS
// =====================================================

const models = {};

for (const module of moduleDefinitions) {
  models[module.key] = mongoose.model(
    module.modelName,
    genericSchema.clone()
  );
}

// =====================================================
// GET MODEL
// =====================================================

function getModel(module) {
  return models[module.key];
}

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SAP PM Dashboard Backend is running",
    mongodb: "Connected",
  });
});

// =====================================================
// GENERIC CRUD APIs
// =====================================================

for (const module of moduleDefinitions) {
  const Model = getModel(module);
  const route = `/api/${module.key}`;

  // ---------------------------------------------------
  // GET ALL
  // ---------------------------------------------------

  app.get(route, async (req, res) => {
    try {
      const data = await Model.find()
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error(
        `GET ${route} error:`,
        error
      );

      res.status(500).json({
        success: false,
        message: `Failed to fetch ${module.key}`,
        error: error.message,
      });
    }
  });

  // ---------------------------------------------------
  // GET SINGLE
  // ---------------------------------------------------

  app.get(`${route}/:id`, async (req, res) => {
    try {
      const item = await Model.findById(
        req.params.id
      ).lean();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${module.modelName} not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to fetch ${module.modelName}`,
        error: error.message,
      });
    }
  });

  // ---------------------------------------------------
  // CREATE
  // ---------------------------------------------------

  app.post(route, async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      if (!body.code) {
        return res.status(400).json({
          success: false,
          message: "Code is required",
        });
      }

      body.code = String(body.code)
        .trim()
        .toUpperCase();

      const existing = await Model.findOne({
        code: body.code,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `${module.modelName} code already exists`,
        });
      }

      const item = await Model.create(body);

      res.status(201).json({
        success: true,
        message: `${module.modelName} created successfully`,
        data: item,
      });
    } catch (error) {
      console.error(
        `POST ${route} error:`,
        error
      );

      res.status(500).json({
        success: false,
        message: `Failed to create ${module.modelName}`,
        error: error.message,
      });
    }
  });

  // ---------------------------------------------------
  // UPDATE
  // ---------------------------------------------------

  app.put(`${route}/:id`, async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      if (body.code) {
        body.code = String(body.code)
          .trim()
          .toUpperCase();
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${module.modelName} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: `${module.modelName} updated successfully`,
        data: item,
      });
    } catch (error) {
      console.error(
        `PUT ${route} error:`,
        error
      );

      res.status(500).json({
        success: false,
        message: `Failed to update ${module.modelName}`,
        error: error.message,
      });
    }
  });

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------

  app.delete(`${route}/:id`, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(
        req.params.id
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${module.modelName} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: `${module.modelName} deleted successfully`,
      });
    } catch (error) {
      console.error(
        `DELETE ${route} error:`,
        error
      );

      res.status(500).json({
        success: false,
        message: `Failed to delete ${module.modelName}`,
        error: error.message,
      });
    }
  });
}

// =====================================================
// EXCEL HEADER NORMALIZATION
// =====================================================

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

// =====================================================
// EXCEL VALUE NORMALIZATION
// =====================================================

function normalizeExcelRow(row) {
  const output = {};

  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeHeader(key);

    if (!normalized) {
      continue;
    }

    let targetKey = key.trim();

    const aliases = {
      id: "code",
      code: "code",
      locationid: "code",
      equipmentid: "code",
      workcenterid: "code",
      tasklistid: "code",
      assetid: "code",
      notificationid: "code",
      breakdownid: "code",
      orderid: "code",
      permitid: "code",
      confirmationid: "code",
      completionid: "code",

      locationname: "name",
      equipmentname: "name",
      plantname: "name",

      plantcode: "plant",

      statustype: "status",

      prioritylevel: "priority",
    };

    if (aliases[normalized]) {
      targetKey = aliases[normalized];
    }

    output[targetKey] = value;
  }

  if (output.code !== undefined) {
    output.code = String(output.code)
      .trim()
      .toUpperCase();
  }

  return output;
}

// =====================================================
// COMMON EXCEL IMPORT
// =====================================================

app.post(
  "/api/import/excel",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Excel file is required",
        });
      }

      const workbook = XLSX.read(
        req.file.buffer,
        {
          type: "buffer",
          cellDates: true,
        }
      );

      const summary = [];
      const errors = [];

      const totals = {
        inserted: 0,
        updated: 0,
        skipped: 0,
      };

      for (const module of moduleDefinitions) {
        const Model = getModel(module);

        if (
          !workbook.SheetNames.includes(
            module.sheetName
          )
        ) {
          summary.push({
            module: module.key,
            sheet: module.sheetName,
            status: "Sheet not found",
            inserted: 0,
            updated: 0,
            skipped: 0,
          });

          continue;
        }

        const worksheet =
          workbook.Sheets[module.sheetName];

        const rawRows =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: "",
              raw: false,
            }
          );

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (let index = 0; index < rawRows.length; index++) {
          try {
            const row = normalizeExcelRow(
              rawRows[index]
            );

            if (!row.code) {
              skipped++;

              errors.push({
                sheet: module.sheetName,
                row: index + 2,
                message: "Code is missing",
              });

              continue;
            }

            if (
              row.plant &&
              !PLANTS.includes(
                String(row.plant).trim()
              )
            ) {
              skipped++;

              errors.push({
                sheet: module.sheetName,
                row: index + 2,
                message: `Invalid plant: ${row.plant}`,
              });

              continue;
            }

            const existing =
              await Model.findOne({
                code: row.code,
              });

            if (existing) {
              await Model.findByIdAndUpdate(
                existing._id,
                row,
                {
                  new: true,
                  runValidators: false,
                }
              );

              updated++;
              totals.updated++;
            } else {
              await Model.create(row);

              inserted++;
              totals.inserted++;
            }
          } catch (error) {
            skipped++;
            totals.skipped++;

            errors.push({
              sheet: module.sheetName,
              row: index + 2,
              message: error.message,
            });
          }
        }

        summary.push({
          module: module.key,
          sheet: module.sheetName,
          status: "Imported",
          inserted,
          updated,
          skipped,
        });
      }

      res.status(200).json({
        success: true,
        message:
          "SAP PM Excel import completed successfully",
        summary,
        totals,
        errors,
      });
    } catch (error) {
      console.error(
        "Excel import error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Excel import failed",
        error: error.message,
      });
    }
  }
);

// =====================================================
// EXCEL TEMPLATE INFORMATION
// =====================================================

app.get(
  "/api/import/excel-template",
  (req, res) => {
    res.status(200).json({
      success: true,
      sheets: moduleDefinitions.map(
        (module) => ({
          sheetName: module.sheetName,
          module: module.key,
          required: ["code"],
        })
      ),
    });
  }
);

// =====================================================
// COMMON EXCEL EXPORT
// =====================================================

app.get(
  "/api/export/excel",
  async (req, res) => {
    try {
      const workbook =
        XLSX.utils.book_new();

      for (const module of moduleDefinitions) {
        const Model = getModel(module);

        const rows = await Model.find()
          .select("-_id")
          .lean();

        let worksheet;

        if (rows.length > 0) {
          worksheet =
            XLSX.utils.json_to_sheet(rows);
        } else {
          worksheet =
            XLSX.utils.aoa_to_sheet([
              ["No data"],
            ]);
        }

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          module.sheetName
        );
      }

      const excelBuffer =
        XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="SAP_PM_Data.xlsx"'
      );

      res.send(excelBuffer);
    } catch (error) {
      console.error(
        "Excel export error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to export SAP PM data",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "Global server error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
);

// =====================================================
// DATABASE + SERVER
// =====================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    app.listen(PORT, () => {
      console.log(
        `SAP PM Backend running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

