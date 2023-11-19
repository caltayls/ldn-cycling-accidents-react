export function filterCSV(csv, chosenYear, chosenMonth, boroHover='') {
  let csvFiltered = csv;
  if (boroHover) {
  csvFiltered = boroHover === 'All Boroughs'
    ? csv
    : csv.filter(d => d.borough === boroHover);
  }

  csvFiltered = chosenYear === 'All Years'
    ? csvFiltered
    : csvFiltered.filter(d => d.datetime.getFullYear() === chosenYear);

  csvFiltered = chosenMonth === 'All Months'
    ? csvFiltered
    : csvFiltered.filter(d => d.datetime.getMonth() === chosenMonth);

  return csvFiltered
}