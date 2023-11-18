import * as d3 from 'd3';

export function dateTimeParser(timeUnit, datetimeObj) {
  if (timeUnit === 'hour') {
    return datetimeObj.getHours();
  } else if (timeUnit === 'day') {
    return datetimeObj.getDate()
  } else if (timeUnit === 'month') {
    return datetimeObj.getMonth();
  } else if (timeUnit === 'year') {
    return datetimeObj.getFullYear();
  }
}

export function getTimeSet(timeUnit, array, chosenYear=null, chosenMonth=null) {
  if (timeUnit === 'day') {
    const firstDay = new Date(chosenYear, chosenMonth, 1); 
    const lastDay = new Date(chosenYear, chosenMonth + 1, 0);
    const dateArray = d3.range(firstDay.getDate(), lastDay.getDate()+1)
    return dateArray
  }
  return [...new Set(array.map(d => d.datetime))];
}
