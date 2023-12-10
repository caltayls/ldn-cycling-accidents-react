import * as d3 from 'd3';

import { filterCSV } from "../utils/filterCSV";
import { dateTimeParser, getTimeSet } from '../utils/datetime_utils';
import { useEffect, useRef } from 'react';

import './SummaryBox.css';


export default function SummaryBox({ csvData, chosenYear, chosenMonth, severityFilter, timeUnit, boroHover }) {

  const svgRefs = {
    All: useRef(null),
    Slight: useRef(null),
    Serious: useRef(null),
    Fatal: useRef(null),
  }


 const timeSet = getTimeSet(timeUnit, chosenYear, chosenMonth); 



  const width = 100;
  const height = 20;



  useEffect(() => {
    Object.keys(svgRefs).forEach(d => drawLine(d))

    return () => d3.selectAll('.summary-line g').remove();

  }, [boroHover])


  if (boroHover !== 'All Boroughs') return (
    <div id='summary-box'>
      <h1>{boroHover}</h1>
      <table>
        <tbody>
          {Object.keys(svgRefs).map(d => {
            const { incidentCount } = getArrayAndCount(d);
            return (
              <tr key={d}>
                <th>{d} Incidents</th>
                <td>{incidentCount}</td>
                <td><svg ref={svgRefs[d]}></svg></td>
              </tr>
            )
          })}
        </tbody>


      </table>

    </div>
  )

  function drawLine(ref) {
    const svgRef = svgRefs[ref];
    const { boroArray } = getArrayAndCount(ref);

    const x = d3.scaleLinear()
    .domain(d3.extent(timeSet))
    .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(boroArray.flat(), d => d.count))
      .range([height, 0]);

    const lineGen = d3.line()
      .x(d => x(d.datetime))
      .y(d => y(d.count));

    const svg = d3.select(svgRef.current)
    .attr('class', 'summary-line')
    .attr('width', width)
    .attr('height', height);

    svg.append('g')
      .selectAll('path')
      .data([boroArray])
      .join('path')
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', 'red');
  }


  function getArrayAndCount(severity='All') {

    const  csvFiltered = filterCSV(csvData, 'All Years', 'All Months', boroHover, severity !== 'All'? severity: '');
    
    const boroObj = d3.rollup(
      csvFiltered, 
      v=> ({
        borough: v[0].borough, 
        datetime: dateTimeParser(timeUnit, v[0].datetime), 
        count: v.length
      }), 
      (d) => d.borough, 
      (d) => dateTimeParser(timeUnit, d.datetime),
    );

    const boroArray = Array.from(boroObj, ([, inner]) => [...inner.values()].sort((a, b) => timeUnit !== 'month'? (a.datetime - b.datetime): (parseInt(a.datetime) - parseInt(b.datetime)))); 
    const boroYears = boroArray.flat().map(d => d.datetime);
    const yearsToAdd = timeSet.filter(d => !boroYears.includes(d) && d);
    
    const boroArrayToAppend = yearsToAdd.map(d => {
      return {borough: boroHover, datetime: d, count: 0}
    });
    const combinedArray = [...boroArray.flat(), ...boroArrayToAppend].sort((a, b) => a.datetime - b.datetime);
    return ({
          boroArray: combinedArray,
          incidentCount: d3.sum(combinedArray.flat(), d=> d.count),
        })
    }
  
}