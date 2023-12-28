import * as d3 from 'd3';

import { filterCSV } from "../utils/filterCSV";
import { dateTimeParser, getTimeSet } from '../utils/datetime_utils';
import { useEffect, useRef } from 'react';

import './SummaryBox.css';


export default function SummaryBox({ csvData, yearFilter, monthFilter, severityFilter, timeUnit, boroughFilter }) {

  const svgRefs = {
    All: useRef(null),
    Slight: useRef(null),
    Serious: useRef(null),
    Fatal: useRef(null),
  }


 const timeSet = getTimeSet(timeUnit, yearFilter, monthFilter); 
 console.log(timeUnit)
 console.log(timeSet)

  useEffect(() => {
    Object.keys(svgRefs).forEach(d => drawLine(d))

    return () => d3.selectAll('.summary-line g').remove();

  }, [boroughFilter, yearFilter, monthFilter])

  return (
    <>
      <h2>Summary</h2>
      <div className='table-container'>
        <table>
          <thead>
            <tr>
              <th className='align-left'>Incident Type</th>
              <th>Count</th>
              <th >Trend</th>
              {boroughFilter !== 'All Boroughs' && (            
                <>
                <th>Rank</th>
                <th>% of Incident Type </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.keys(svgRefs).map(d => {
              let { boroRanks } = getArrayAndCount(d, 'All Boroughs')
              if (d === 'All') boroRanks = boroRanks.filter(d => d.casualty_severity === 'Serious');
              const { incidentCount } = getArrayAndCount(d, boroughFilter);
              const { incidentCount: allBoroIncidentCount} = getArrayAndCount(d, 'All Boroughs');

              return (
                <tr key={d}>
                  <th>{d}</th>
                  <td>{incidentCount.toLocaleString()}</td>
                  <td><svg ref={svgRefs[d]}></svg></td>
                  <td>{boroughFilter !== 'All Boroughs' && `#${boroRanks.findIndex(d => d.borough === boroughFilter)+1}`}</td>
                  <td>{boroughFilter !== 'All Boroughs' && `${Math.round(incidentCount/allBoroIncidentCount*100*10)/10}%`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </>
  )

  function drawLine(ref) {
    const LineFills = {
      All: 'black',
      Slight:'#4e79a7',
      Serious: '#f28e2c',
      Fatal: '#e15759'
    };

    const margin = {top:1, bottom: 1};
    const width = 150;
    const height = 20 - margin.top - margin.bottom;

    const svgRef = svgRefs[ref];
    const { boroArray } = getArrayAndCount(ref, boroughFilter);

    const areaGen = d3.area()
    .x(d => x(d.datetime))
    .y0(d => y(d.count))
    .y1(height + margin.top);


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
    .attr('height', height + margin.bottom + margin.top);

    svg.append('g')
        .attr('transform', 'translate(0, 0)')
      .selectAll('path')
      .data([boroArray])
      .join('path')
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', LineFills[ref]);

    // add area under line
    svg.append('g')
        .attr('transform', 'translate(0, 0)')
      .selectAll('path')
      .data([boroArray])
      .join('path')
        .attr('d', areaGen)
        .attr('fill', LineFills[ref])
        .attr('opacity', 0.4);
}


  function getArrayAndCount(severity='All', borough) {

    const  csvFiltered = filterCSV(csvData, yearFilter, monthFilter, borough, severity !== 'All'? severity: '');
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
    
    // add zero counts to times that have no accidents to make plots look nicer
    const boroArrayToAppend = yearsToAdd.map(d => {
      return {borough: boroughFilter, datetime: d, count: 0}
    });
    const combinedArray = [...boroArray.flat(), ...boroArrayToAppend].sort((a, b) => a.datetime - b.datetime);

    let allBoroSummedArray, allBoroSummedObj, incidentArray;
    if (borough === "All Boroughs"){
      allBoroSummedObj = d3.rollup(combinedArray, v => ({datetime: v[0].datetime, count: d3.sum(v, d => d.count)}), d => d.datetime);
      allBoroSummedArray = Array.from(allBoroSummedObj, inner => inner[1]);


    // For borough ranks
      const incidentCount = d3.rollup(
        csvFiltered, 
          v => ({borough: v[0].borough, casualty_severity: v[0].casualty_severity, count: v.length}), 
          d => d.borough, 
          d => d.casualty_severity
        );
    
      incidentArray = Array.from(incidentCount, ([, inner]) => [...inner.values()]).flat();
    
      // add overall count to array for ordering
      const overallCounts = d3.rollups(incidentArray, v => ({borough: v[0].borough, overallCount: d3.sum(v, d => d.count)}), d => d.borough).map(d => d[1]);
      
      incidentArray = incidentArray.map(d => {
        const overallCount = overallCounts.filter(x => x.borough === d.borough)[0].overallCount;
        return {...d, overallCount: overallCount}
      }).sort((a, b) => b.overallCount - a.overallCount);
    }
  return ({
          boroArray: borough === "All Boroughs"? allBoroSummedArray: combinedArray,
          incidentCount: borough === "All Boroughs"? d3.sum(allBoroSummedArray.flat(), d=> d.count): d3.sum(combinedArray.flat(), d=> d.count),
          boroRanks: borough.length !== 0 && incidentArray
        })
    }
  
}