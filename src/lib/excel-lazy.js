/**
 * SheetJS is only pulled in when someone actually imports or exports,
 * so the first paint of the dashboard stays small.
 */
export async function exportRowsLazy(args) {
  const { exportRows } = await import('./excel');
  return exportRows(args);
}

export async function downloadTemplateLazy(args) {
  const { downloadTemplate } = await import('./excel');
  return downloadTemplate(args);
}
