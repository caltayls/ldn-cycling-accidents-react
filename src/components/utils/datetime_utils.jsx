import * as d3 from 'd3';

export function dateTimeParser(timeUnit, datetimeObj) {
  if (timeUnit === 'hour') {
    return datetimeObj.getHours();
  } else if (timeUnit === 'day') {
    return datetimeObj.getDate();
  } else if (timeUnit === 'month') {
    return datetimeObj.getMonth();
  } else if (timeUnit === 'year') {
    return datetimeObj.getFullYear();
  } else if (timeUnit === 'weekday') {
    let sunFirstIndex = datetimeObj.getDay();
    let monFirstIndex = (sunFirstIndex + 6) % 7; // sunday is first day by default - change to mon first
    return monFirstIndex;
  }
}

export function getTimeSet(timeUnit, yearFilter=null, monthFilter=null) {
  timeUnit = String(timeUnit);
  
  if (timeUnit === 'day') {
    const lastDay = [31];
    const dateArray = d3.range(1, Math.max(...lastDay)+1);
    return dateArray

  } else if (timeUnit === 'hour') {
    return d3.range(0, 24)
  } else if (timeUnit === 'weekday') {
    return d3.range(0, 7)
  } else if (timeUnit === 'month') {
    return d3.range(0, 12)
  } else if (timeUnit === 'year') { 
    return d3.range(2005, 2023)
  } 

}
