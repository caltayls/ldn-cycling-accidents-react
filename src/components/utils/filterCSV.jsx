export function filterCSV(csv, yearFilter=[], monthFilter=[], boroughFilter='', severityFilter='') {
  let csvFiltered = csv;
  if (boroughFilter) {
  csvFiltered = boroughFilter === 'All Boroughs'
    ? csvFiltered
    : csvFiltered.filter(d => boroughFilter.includes(d.borough));
  }

  if (severityFilter) {
    csvFiltered = severityFilter.length === 0
    ? csvFiltered
    : csvFiltered.filter(d => severityFilter.includes(d.casualty_severity));
  }

  csvFiltered = yearFilter.length === 0
    ? csvFiltered
    : csvFiltered.filter(d => yearFilter.includes(d.datetime.getFullYear()));

  csvFiltered = monthFilter.length === 0
    ? csvFiltered
    : csvFiltered.filter(d => monthFilter.includes(d.datetime.getMonth()));


  return csvFiltered
}