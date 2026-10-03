# SAP PM — Plant Maintenance dashboard

A React + Vite front end for SAP Plant Maintenance: master data, maintenance
processing and reporting for a six-plant network, with Excel import and export
on every record screen.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  nav.js                  navigation model shared by the rail, breadcrumb and search
  index.css               design tokens (colour, type, radius) as a Tailwind @theme block
  components/
    primitives.jsx        Button, Modal, ConfirmDialog, Field, Badge, StatCard, toasts
    PMUI.jsx              Toolbar, DataTable and CrudPage, plus the plant list
    ExcelImport.jsx       three-step import wizard
    Sidebar.jsx Header.jsx Dashboard.jsx
  pages/                  one file per SAP PM module
  lib/
    excel.js              SheetJS reading, validation, template and export
    excel-lazy.js         dynamic-import wrappers so SheetJS stays out of the first load
```

Every master-data and transaction screen is one config object passed to
`CrudPage`: columns, form fields, required keys and status values. Adding a
module means adding a config, not a screen.

## Excel import

The **Import** button on any record screen opens a three-step wizard.

1. **Choose file** — drag and drop or browse. Accepts `.xlsx`, `.xlsm`, `.xls`
   and `.csv` up to 8 MB. **Download template** generates a workbook with the
   right headers, a sample row and an instructions sheet listing allowed values.
2. **Match columns** — headers are matched to fields automatically, exact match
   first, then a loose match. Every field can be repointed, and the first row of
   the file is shown beside each one. Multi-sheet workbooks get a sheet picker.
   Title rows above the real header are detected and skipped.
3. **Review and import** — counts of new, to-update and failed rows, with a
   per-row reason for anything that cannot be imported.

Rows are checked for empty required fields, values outside a field's allowed
list, duplicate IDs inside the file, and IDs that already exist. Case
differences in list values are corrected silently (`active` becomes `Active`).
Existing IDs update the record rather than adding a duplicate; that behaviour can
be switched off before importing. Rows with errors are skipped, never guessed at.

Export writes the current filtered view with auto-fitted columns, a frozen
header row and an autofilter.

## Design

One family, IBM Plex Sans, with IBM Plex Mono for object keys such as `EQ-1001`,
because those are codes rather than prose. A steel-teal accent carries actions;
green, amber and red are reserved for operational status so colour always means
the same thing. All tokens live in the `@theme` block in `src/index.css`.

## Data

Records are in-memory React state seeded from the page configs. Imports, edits
and deletions last for the session. Point the config `data` at an API response
to make them persist.
