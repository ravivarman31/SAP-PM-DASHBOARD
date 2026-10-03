import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";

import { exportRowsLazy } from "../lib/excel-lazy";
import { plants } from "../lib/plants";

const ExcelImport = lazy(() => import("./ExcelImport"));

import {
  Button,
  Select,
  Modal,
  ConfirmDialog,
  Field,
  PageHeader,
  StatCard,
  useToast,
} from "./primitives";

export {
  ToastProvider,
  useToast,
  Button,
  Card,
  SectionHeading,
  PageHeader,
  StatCard,
  Badge,
  Modal,
  ConfirmDialog,
  Field,
  Select,
} from "./primitives";

/* ================================================================
   API HELPERS
================================================================ */

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || "Something went wrong with the API."
    );
  }

  return result;
}

/* ===================================================================
   FILTER
=================================================================== */

export function Toolbar({
  search,
  setSearch,
  plant,
  setPlant,
  status,
  setStatus,
  statuses = [
    "Active",
    "Inactive",
    "Open",
    "Completed",
    "Pending",
  ],
  onExport,
  onImport,
  count,
  total,
}) {
  const filtered = count !== total;

  const reset = () => {
    setSearch("");
    setPlant("All Plants");
    setStatus?.("All");
  };

  return (
    <div className="bg-surface border border-line rounded-lg p-3 mb-4">
      <div className="flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, description, equipment…"
            className="w-full h-10 pl-9 pr-3 rounded-md bg-raised border border-line text-sm placeholder:text-ink-mute focus:bg-surface focus:border-accent focus:outline-none"
          />
        </div>

        <Select
          value={plant}
          onChange={setPlant}
          className="lg:w-44"
        >
          <option>All Plants</option>

          {plants.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Select>

        {status !== undefined && (
          <Select
            value={status}
            onChange={setStatus}
            className="lg:w-44"
          >
            <option value="All">All statuses</option>

            {statuses
              .filter((s) => s !== "All")
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </Select>
        )}

        <div className="flex gap-2.5">
          {filtered && (
            <Button
              icon={RotateCcw}
              onClick={reset}
              className="flex-1 lg:flex-none"
            >
              Clear
            </Button>
          )}

          {onImport && (
            <Button
              icon={Upload}
              onClick={onImport}
              className="flex-1 lg:flex-none"
            >
              Import
            </Button>
          )}

          {onExport && (
            <Button
              icon={Download}
              onClick={onExport}
              className="flex-1 lg:flex-none"
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {filtered && (
        <p className="text-xs text-ink-mute mt-2.5 pl-1">
          Showing{" "}
          <span className="tnum font-medium text-ink-soft">
            {count}
          </span>{" "}
          of {total} records.
        </p>
      )}
    </div>
  );
}

/* ====================================================================
   TABLE
==================================================================== */

export function DataTable({
  columns,
  rows,
  onView,
  onEdit,
  onDelete,
  keyField = "id",
  pageSize = 12,
  emptyHint = "Adjust the search or filters to see more records.",
}) {
  const [sort, setSort] = useState({
    key: null,
    dir: "asc",
  });

  const [paging, setPaging] = useState({
    view: "",
    page: 1,
  });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;

    const dir = sort.dir === "asc" ? 1 : -1;

    return [...rows].sort(
      (a, b) =>
        String(a[sort.key] ?? "").localeCompare(
          String(b[sort.key] ?? ""),
          undefined,
          {
            numeric: true,
          }
        ) * dir
    );
  }, [rows, sort]);

  const pages = Math.max(
    1,
    Math.ceil(sorted.length / pageSize)
  );

  const view = `${rows.length}|${sort.key}|${sort.dir}`;

  const current = Math.min(
    paging.view === view ? paging.page : 1,
    pages
  );

  const slice = sorted.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  const setPage = (n) =>
    setPaging({
      view,
      page: n,
    });

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? {
            key,
            dir: s.dir === "asc" ? "desc" : "asc",
          }
        : {
            key,
            dir: "asc",
          }
    );
  };

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-raised border-b border-line">
              {columns.map((c) => {
                const active = sort.key === c.key;

                return (
                  <th
                    key={c.key}
                    scope="col"
                    className="text-left font-medium text-ink-soft whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="w-full flex items-center gap-1.5 px-4 py-2.5 text-[13px] hover:text-accent"
                    >
                      {c.label}

                      <span
                        className={
                          active
                            ? "text-accent"
                            : "text-line-strong"
                        }
                      >
                        {active && sort.dir === "desc" ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronUp size={13} />
                        )}
                      </span>
                    </button>
                  </th>
                );
              })}

              <th
                scope="col"
                className="px-4 py-2.5 text-right text-[13px] font-medium text-ink-soft"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {slice.length ? (
              slice.map((row, i) => (
                <tr
                  key={row[keyField] || i}
                  className="border-b border-line last:border-0 hover:bg-accent-soft/40 group"
                >
                  {columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={`px-4 py-2.5 whitespace-nowrap ${
                        ci === 0
                          ? "objkey text-ink font-medium"
                          : "text-ink-soft"
                      }`}
                    >
                      {c.render
                        ? c.render(row)
                        : row[c.key] ?? "—"}
                    </td>
                  ))}

                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <IconAction
                        label="View"
                        icon={Eye}
                        onClick={() => onView?.(row)}
                      />

                      <IconAction
                        label="Edit"
                        icon={Pencil}
                        onClick={() => onEdit?.(row)}
                      />

                      <IconAction
                        label="Delete"
                        icon={Trash2}
                        onClick={() => onDelete?.(row)}
                        tone="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-14 text-center"
                >
                  <FileSpreadsheet
                    size={22}
                    className="mx-auto text-line-strong"
                  />

                  <p className="font-medium text-ink mt-3">
                    No records match this view
                  </p>

                  <p className="text-[13px] text-ink-mute mt-1">
                    {emptyHint}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-line bg-raised">
          <p className="text-[13px] text-ink-mute tnum">
            {(current - 1) * pageSize + 1}–
            {Math.min(
              current * pageSize,
              sorted.length
            )}{" "}
            of {sorted.length}
          </p>

          <div className="flex items-center gap-1">
            <IconAction
              label="Previous page"
              icon={ChevronLeft}
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            />

            <span className="text-[13px] text-ink-soft tnum px-2">
              Page {current} / {pages}
            </span>

            <IconAction
              label="Next page"
              icon={ChevronRight}
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  tone,
  ...rest
}) {
  const color =
    tone === "danger"
      ? "hover:text-danger hover:bg-danger-soft"
      : "hover:text-accent hover:bg-accent-soft";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`p-1.5 rounded text-ink-mute disabled:opacity-30 disabled:hover:bg-transparent ${color}`}
      {...rest}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

/* ====================================================================
   CRUD PAGE
==================================================================== */

export function CrudPage({ config }) {
  const toast = useToast();

  const [data, setData] = useState(config.data || []);

  const [search, setSearch] = useState("");

  const [plant, setPlant] = useState("All Plants");

  const [status, setStatus] = useState("All");

  const [mode, setMode] = useState(null);

  const [form, setForm] = useState({});

  const [pendingDelete, setPendingDelete] =
    useState(null);

  const [importing, setImporting] = useState(false);

  const [loading, setLoading] = useState(
    Boolean(config.api?.baseUrl)
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* ================================================================
     LOAD DATA FROM BACKEND
  ================================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!config.api?.baseUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await apiRequest(
          config.api.baseUrl
        );

        const apiRows = Array.isArray(result.data)
          ? result.data
          : [];

        const mappedRows = apiRows.map((row) =>
          config.api.mapRow
            ? config.api.mapRow(row)
            : row
        );

        if (!cancelled) {
          setData(mappedRows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          toast(
            `Failed to load ${config.title}.`,
            "error"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [config, toast]);

  /* ================================================================
     FILTER
  ================================================================ */

  const rows = useMemo(
    () =>
      data.filter((r) => {
        const q = search.trim().toLowerCase();

        return (
          (!q ||
            Object.values(r)
              .join(" ")
              .toLowerCase()
              .includes(q)) &&
          (plant === "All Plants" ||
            r.plant === plant) &&
          (status === "All" ||
            r.status === status)
        );
      }),
    [data, search, plant, status]
  );

  /* ================================================================
     STATS
  ================================================================ */

  const stats = useMemo(() => {
    const open = data.filter((r) =>
      [
        "Open",
        "Active",
        "Pending",
        "In Progress",
      ].includes(r.status)
    ).length;

    const done = data.filter((r) =>
      [
        "Completed",
        "Closed",
        "Approved",
      ].includes(r.status)
    ).length;

    const covered = new Set(
      data
        .map((r) => r.plant)
        .filter(Boolean)
    ).size;

    return [
      {
        label: "Total records",
        value: data.length,
        note: `${config.title} master list`,
        tone: "accent",
      },
      {
        label: "Active or open",
        value: open,
        note: "Currently in the workload",
        tone: "warn",
      },
      {
        label: "Completed",
        value: done,
        note: "Closed in this period",
        tone: "ok",
      },
      {
        label: "Plant coverage",
        value: `${covered || plants.length}/${plants.length}`,
        note: "Plants with records",
        tone: "info",
      },
    ];
  }, [data, config.title]);

  /* ================================================================
     NEW ID
  ================================================================ */

  const nextId = () =>
    `${config.prefix}-${String(
      1001 + data.length
    ).padStart(4, "0")}`;

  /* ================================================================
     OPEN MODAL
  ================================================================ */

  const open = (m, row) => {
    setMode(m);

    if (row) {
      setForm({ ...row });
      return;
    }

    const hasIdOptions = config.fields?.some(
      (field) =>
        field.key === "id" &&
        Array.isArray(field.options)
    );

    setForm({
      ...config.empty,
      id: hasIdOptions ? "" : nextId(),
    });
  };

  /* ================================================================
     SAVE
  ================================================================ */

  const save = async () => {
    const missing = (config.required || []).filter(
      (k) =>
        !String(form[k] ?? "").trim()
    );

    if (missing.length) {
      const labels = missing.map(
        (k) =>
          config.fields.find(
            (f) => f.key === k
          )?.label || k
      );

      toast(
        `Fill in ${labels.join(", ")} before saving.`,
        "warn"
      );

      return;
    }

    /* --------------------------------------------------------------
       LOCAL PAGE
    -------------------------------------------------------------- */

    if (!config.api?.baseUrl) {
      if (mode === "add") {
        setData([form, ...data]);

        toast(`${form.id} added.`);
      } else {
        setData(
          data.map((x) =>
            x.id === form.id ? form : x
          )
        );

        toast(`${form.id} updated.`);
      }

      setMode(null);
      return;
    }

    /* --------------------------------------------------------------
       BACKEND PAGE
    -------------------------------------------------------------- */

    try {
      setSaving(true);

      const payload = config.api.toPayload
        ? config.api.toPayload(form)
        : form;

      let result;

      if (mode === "add") {
        result = await apiRequest(
          config.api.baseUrl,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        const newRow = result.data
          ? config.api.mapRow
            ? config.api.mapRow(result.data)
            : result.data
          : form;

        setData((prev) => [
          newRow,
          ...prev,
        ]);

        toast(
          `${form.id} added successfully.`
        );
      } else {
        const backendId =
          form._mongoId || form._id;

        result = await apiRequest(
          `${config.api.baseUrl}/${backendId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        const updatedRow = result.data
          ? config.api.mapRow
            ? config.api.mapRow(result.data)
            : result.data
          : form;

        setData((prev) =>
          prev.map((row) =>
            row.id === form.id
              ? updatedRow
              : row
          )
        );

        toast(
          `${form.id} updated successfully.`
        );
      }

      setMode(null);
    } catch (err) {
      toast(
        err.message || "Save failed.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================================================
     DELETE
  ================================================================ */

  const remove = async () => {
    if (!pendingDelete) return;

    if (!config.api?.baseUrl) {
      setData(
        data.filter(
          (x) =>
            x.id !== pendingDelete.id
        )
      );

      toast(
        `${pendingDelete.id} deleted.`,
        "info"
      );

      setPendingDelete(null);
      return;
    }

    try {
      setSaving(true);

      const backendId =
        pendingDelete._mongoId ||
        pendingDelete._id;

      await apiRequest(
        `${config.api.baseUrl}/${backendId}`,
        {
          method: "DELETE",
        }
      );

      setData((prev) =>
        prev.filter(
          (x) =>
            x.id !== pendingDelete.id
        )
      );

      toast(
        `${pendingDelete.id} deleted successfully.`,
        "info"
      );

      setPendingDelete(null);
    } catch (err) {
      toast(
        err.message || "Delete failed.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================================================
     EXPORT
  ================================================================ */

  const handleExport = async () => {
    const n = await exportRowsLazy({
      title: config.title,
      columns: config.columns,
      rows,
    });

    toast(
      `Exported ${n} ${
        n === 1 ? "record" : "records"
      } to Excel.`
    );
  };

  /* ================================================================
     EXCEL IMPORT
  ================================================================ */

  const commitImport = ({
    creates,
    updates,
  }) => {
    setData((prev) => {
      const byId = new Map(
        prev.map((r) => [
          String(r.id).toLowerCase(),
          r,
        ])
      );

      updates.forEach((r) => {
        const k = String(
          r.id
        ).toLowerCase();

        byId.set(k, {
          ...byId.get(k),
          ...r,
        });
      });

      return [
        ...creates,
        ...byId.values(),
      ];
    });

    setImporting(false);

    const parts = [];

    if (creates.length) {
      parts.push(
        `${creates.length} added`
      );
    }

    if (updates.length) {
      parts.push(
        `${updates.length} updated`
      );
    }

    toast(
      `Import finished — ${
        parts.join(", ") ||
        "nothing changed"
      }.`
    );
  };

  /* ================================================================
     UI
  ================================================================ */

  return (
    <div>
      <PageHeader
        icon={config.icon}
        title={config.title}
        description={config.description}
        actionLabel={
          config.actionLabel || "Add record"
        }
        onAction={() => open("add")}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            {...s}
          />
        ))}
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        plant={plant}
        setPlant={setPlant}
        status={status}
        setStatus={setStatus}
        statuses={config.statuses}
        count={rows.length}
        total={data.length}
        onExport={handleExport}
        onImport={() => setImporting(true)}
      />

      {loading && (
        <div className="bg-surface border border-line rounded-lg p-8 text-center">
          <p className="text-sm text-ink-soft">
            Loading {config.title.toLowerCase()}...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-danger-soft border border-danger/20 rounded-lg p-5 mb-4">
          <p className="font-medium text-danger">
            Failed to load {config.title}
          </p>

          <p className="text-sm text-ink-soft mt-1">
            {error}
          </p>
        </div>
      )}

      {!loading && (
        <DataTable
          columns={config.columns}
          rows={rows}
          onView={(r) =>
            open("view", r)
          }
          onEdit={(r) =>
            open("edit", r)
          }
          onDelete={setPendingDelete}
        />
      )}

      {mode && (
        <Modal
          title={`${
            mode === "add"
              ? "Add"
              : mode === "edit"
              ? "Edit"
              : "View"
          } ${config.title.toLowerCase()}`}
          subtitle={
            mode === "view"
              ? `${form.id} — read only`
              : "Fields marked with an asterisk are required."
          }
          onClose={() => setMode(null)}
          onSave={save}
          view={mode === "view"}
          saving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                value={form[f.key]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    [f.key]: v,
                  })
                }
                type={f.type}
                options={f.options}
                required={(config.required || []).includes(
                  f.key
                )}
                readOnly={mode === "view"}
              />
            ))}
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.id}?`}
          body={
            config.api?.baseUrl
              ? "This will permanently delete the record from MongoDB."
              : "This removes the record from the current session."
          }
          onConfirm={remove}
          onClose={() =>
            setPendingDelete(null)
          }
        />
      )}

      {importing && (
        <Suspense fallback={null}>
          <ExcelImport
            config={config}
            existing={data}
            onClose={() =>
              setImporting(false)
            }
            onCommit={commitImport}
          />
        </Suspense>
      )}
    </div>
  );
}