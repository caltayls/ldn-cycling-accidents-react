import * as d3 from 'd3';

import { filterCSV } from "../utils/filterCSV";
import { dateTimeParser, getTimeSet } from '../utils/datetime_utils';
import { useEffect, useRef } from 'react';

import './SummaryBox.css';


export default function SummaryBox({ csvData, chosenYear, chosenMonth, severityFilter, timeUnit, boroHover }) {

  const svgRefs = {
    all: useRef(null),
    slight: useRef(null),
    severe: useRef(null),
    fatal: useRef(null),
  }

  const csvFilteredAll = filterCSV(csvData, 'All Years', 'All Months', boroHover);
  const csvFilteredSlight = filterCSV(csvData, 'All Years', 'All Months', boroHover, 'Slight');
  const csvFilteredSevere = filterCSV(csvData, 'All Years', 'All Months', boroHover, 'Severe');
  const csvFilteredFatal = filterCSV(csvData, 'All Years', 'All Months', boroHover, 'Fatal');



  const boroObj = d3.rollup(
    csvFilteredAll, 
    v=> ({
      borough: v[0].borough, 
      datetime: dateTimeParser(timeUnit, v[0].datetime), 
      count: v.length
    }), 
    (d) => d.borough, 
    (d) => dateTimeParser(timeUnit, d.datetime),
  );

  const boroArray = Array.from(boroObj, ([, inner]) => [...inner.values()].sort((a, b) => timeUnit !== 'month'? (a.datetime - b.datetime): (parseInt(a.datetime) - parseInt(b.datetime))));
  const timeSet = getTimeSet(timeUnit, chosenYear, chosenMonth); 

  console.log(d3.sum(boroArray.flat(), d=> d.count))

  const width = 100;
  const height = 20;

  const x = d3.scaleLinear()
    .domain(d3.extent(timeSet))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(boroArray.flat(), d => d.count))
    .range([height, 0])

  const lineGen = d3.line()
    .x(d => x(d.datetime))
    .y(d => y(d.count));

  useEffect(() => {
    drawLine(svgRefs.all);

    // return () => svg.selectAll('*').remove();

  }, [boroHover])


  if (boroHover !== 'All Boroughs') return (
    <div id='summary-box'>
      <h1>{boroHover}</h1>
      <table>
        <tbody>
          <tr>
            <th>Total Incidents</th>
            <td>5</td>
            <td>      
                <svg ref={svgRefs.all}></svg>           
            </td>
          </tr>
        </tbody>


      </table>

    </div>
  )

  
  function drawLine(svgRef) {
    const svg = d3.select(svgRef.current)
    .attr('width', width)
    .attr('height', height);

    svg.append('g')
      .selectAll('path')
      .data(boroArray)
      .join('path')
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', 'red');
  }


  function getArrayAndCount(severity='All') {
    const  csvFiltered = filterCSV(csvData, 'All Years', 'All Months', boroHover, severity !== 'All'? severity: '');
    return (
      {
        csvFiltered: csvFiltered,
        incidentCount: d3.sum(csvFiltered.flat(), d=> d.count),
      })
  }
  
}