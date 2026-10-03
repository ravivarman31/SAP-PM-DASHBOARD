import * as XLSX from 'xlsx';

export const ACCEPTED = '.xlsx,.xlsm,.xls,.csv';
const MAX_BYTES = 8 * 1024 * 1024;

/* ---------------------------------------------------------------- reading */

export async function readWorkbook(file) {
  if (!file) throw new Error('No file selected.');
  if (file.size > MAX_BYTES) throw new Error('That file is larger than 8 MB. Split it and import in parts.');
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xlsm', 'xls', 'csv'].includes(ext)) {
    throw new Error(`${file.name} is not a spreadsheet. Use .xlsx, .xls or .csv.`);
  }
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  if (!wb.SheetNames.length) throw new Error('That workbook has no sheets.');
  return wb;
}

/** Reads a sheet into { headers, rows } where rows are plain objects keyed by header. */
export function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { headers: [], rows: [] };

  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
  if (!matrix.length) return { headers: [], rows: [] };

  // The header is the first row that has at least two non-empty cells —
  // exported reports often carry a title line above the real table.
  let headerIndex = matrix.findIndex((r) => r.filter((c) => String(c).trim() !== '').length >= 2);
  if (headerIndex < 0) headerIndex = 0;

  const seen = new Map();
  const headers = matrix[headerIndex].map((h, i) => {
    let label = String(h ?? '').trim() || `Column ${i + 1}`;
    if (seen.has(label)) {
      const n = seen.get(label) + 1;
      seen.set(label, n);
      label = `${label} (${n})`;
    } else seen.set(label, 1);
    return label;
  });

  const rows = matrix.slice(headerIndex + 1)
    .map((cells, i) => {
      const row = { __line: headerIndex + 2 + i };
      headers.forEach((h, c) => { row[h] = cellText(cells[c]); });
      return row;
    })
    .filter((row) => headers.some((h) => row[h] !== ''));

  return { headers, rows };
}

function cellText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return String(value).trim();
}

/* ---------------------------------------------------------------- mapping */

const normalise = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Guesses which spreadsheet column feeds which field, by exact then loose match. */
export function autoMap(fields, headers) {
  const map = {};
  const taken = new Set();
  const pick = (test) => headers.find((h) => !taken.has(h) && test(normalise(h)));

  fields.forEach((f) => {
    const label = normalise(f.label);
    const key = normalise(f.key);
    const hit =
      pick((h) => h === label) ||
      pick((h) => h === key) ||
      pick((h) => h.includes(label) || label.includes(h)) ||
      pick((h) => h.includes(key) || key.includes(h));
    if (hit) { map[f.key] = hit; taken.add(hit); }
    else map[f.key] = '';
  });
  return map;
}

/* ------------------------------------------------------------- validation */

/**
 * Turns mapped sheet rows into records, with one issue list per row.
 * severity 'error'  -> row cannot be imported
 * severity 'warning'-> row imports, but something was changed or will overwrite
 */
export function validateRows({ sheetRows, mapping, fields, required = [], keyField = 'id', existing = [] }) {
  const existingIds = new Set(existing.map((r) => String(r[keyField] ?? '').toLowerCase()));
  const seenInFile = new Map();

  return sheetRows.map((sheetRow, index) => {
    const record = {};
    fields.forEach((f) => {
      const column = mapping[f.key];
      record[f.key] = column ? (sheetRow[column] ?? '') : '';
    });

    const issues = [];

    required.forEach((key) => {
      if (!String(record[key] ?? '').trim()) {
        const field = fields.find((f) => f.key === key);
        issues.push({ severity: 'error', field: key, message: `${field?.label || key} is empty` });
      }
    });

    fields.forEach((f) => {
      const value = String(record[f.key] ?? '').trim();
      if (!f.options || !value) return;
      const match = f.options.find((o) => normalise(o) === normalise(value));
      if (match) record[f.key] = match;
      else issues.push({ severity: 'error', field: f.key, message: `"${value}" is not a valid ${f.label.toLowerCase()}` });
    });

    const id = String(record[keyField] ?? '').trim().toLowerCase();
    let action = 'create';
    if (id) {
      if (seenInFile.has(id)) {
        issues.push({ severity: 'error', field: keyField, message: `Duplicate of row ${seenInFile.get(id)} in this file` });
        action = 'skip';
      } else {
        seenInFile.set(id, sheetRow.__line);
        if (existingIds.has(id)) {
          action = 'update';
          issues.push({ severity: 'warning', field: keyField, message: 'Already exists — will be updated' });
        }
      }
    }

    return {
      index,
      line: sheetRow.__line,
      record,
      issues,
      action,
      hasError: issues.some((i) => i.severity === 'error'),
    };
  });
}

/* ----------------------------------------------------------- writing out */

function autoWidths(header, rows) {
  return header.map((h, i) => ({
    wch: Math.min(42, Math.max(12, h.length + 2, ...rows.map((r) => String(r[i] ?? '').length + 2))),
  }));
}

function download(workbook, filename) {
  XLSX.writeFile(workbook, filename, { compression: true });
}

/** Blank workbook with the exact headers this module expects, plus one sample row. */
export function downloadTemplate({ title, fields, required = [], sample }) {
  const header = fields.map((f) => f.label + (required.includes(f.key) ? ' *' : ''));
  const example = fields.map((f) => {
    if (sample && sample[f.key]) return sample[f.key];
    if (f.options) return f.options[0];
    return '';
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, example]);
  ws['!cols'] = autoWidths(header, [example]);
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, 'Import');

  const notes = [
    ['How to use this template'],
    [''],
    ['1', 'Keep the header row exactly as it is. Columns marked * are required.'],
    ['2', 'Replace the sample row with your records, one record per row.'],
    ['3', 'Save as .xlsx, then upload it from the Import button on the ' + title + ' screen.'],
    ['4', 'Rows whose ID already exists will update that record instead of adding a duplicate.'],
    [''],
    ['Allowed values'],
    ...fields.filter((f) => f.options).map((f) => [f.label, f.options.join('  |  ')]),
  ];
  const nws = XLSX.utils.aoa_to_sheet(notes);
  nws['!cols'] = [{ wch: 22 }, { wch: 86 }];
  XLSX.utils.book_append_sheet(wb, nws, 'Instructions');

  download(wb, `${slug(title)}-import-template.xlsx`);
}

/** Exports whatever is currently on screen, using the visible column labels. */
export function exportRows({ title, columns, rows }) {
  const header = columns.map((c) => c.label);
  const body = rows.map((r) => columns.map((c) => plain(r[c.key])));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  ws['!cols'] = autoWidths(header, body);
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: body.length, c: header.length - 1 } }) };
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 28) || 'Export');
  download(wb, `${slug(title)}-${stamp()}.xlsx`);
  return body.length;
}

function plain(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return '';
  return v;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stamp = () => new Date().toISOString().slice(0, 10);
