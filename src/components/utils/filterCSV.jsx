export function filterCSV(csv, chosenYear, chosenMonth, boroHover='', severity='') {
  let csvFiltered = csv;
  if (boroHover) {
  csvFiltered = boroHover === 'All Boroughs'
    ? csvFiltered
    : csvFiltered.filter(d => d.borough === boroHover);
  }

  if (severity) {
    csvFiltered = severity === 'All Severities'
    ? csvFiltered
    : csvFiltered.filter(d => d.casualty_severity === severity);
  }

  csvFiltered = chosenYear === 'All Years'
    ? csvFiltered
    : csvFiltered.filter(d => d.datetime.getFullYear() === chosenYear);

  csvFiltered = chosenMonth === 'All Months'
    ? csvFiltered
    : csvFiltered.filter(d => d.datetime.getMonth() === chosenMonth);


  return csvFiltered
}