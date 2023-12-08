import { useEffect, useRef, useMemo, useContext } from "react";
import * as d3 from "d3";
import { dateTimeParser } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV";
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";


export default function HorizontalBar({ csvData, timeUnit, chosenMonth, chosenYear, severityFilter, plotTitle, boroHover }) {

  const gRef = useRef(null);
  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth);

  const margin = {
    top: 20,
    bottom: 40,
    left: 10,
    right: 10
  }

  const { clientHeight, clientWidth } = useContext(WindowContext);
  console.log(clientWidth)
  const svgWidth = clientWidth * .4;
  const svgHeight = clientHeight * .8; 
  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;

  const incidentCount = d3.rollup(
    csvFiltered, 
      v => ({borough: v[0].borough, casualty_severity: v[0].casualty_severity, count: v.length}), 
      d => d.borough, 
      d => d.casualty_severity
    );


  let incidentArray = Array.from(incidentCount, ([, inner]) => [...inner.values()]).flat()

  // add overall count to array for ordering
  const overallCounts = d3.rollups(incidentArray, v => ({borough: v[0].borough, overallCount: d3.sum(v, d => d.count)}), d => d.borough).map(d => d[1])
  
  incidentArray = incidentArray.map(d => {
    const overallCount = overallCounts.filter(x => x.borough === d.borough)[0].overallCount;
    return {...d, overallCount: overallCount}
  }).sort((a, b) => a.overallCount - b.overallCount)

 

  function getTimeSet(timeUnit, array, chosenYear=null, chosenMonth=null) {
    if (timeUnit === 'day') {
      const firstDay = new Date(chosenYear, chosenMonth, 1); 
      const lastDay = new Date(chosenYear, chosenMonth + 1, 0);
      const dateArray = d3.range(firstDay.getDate(), lastDay.getDate()+1)
      return dateArray
    }
    return [...new Set(array.map(d => d.datetime))];
  }
    
  const timeSet = getTimeSet(timeUnit, incidentArray, chosenYear, chosenMonth);
  // console.log(d3.index(incidentArray, d => d.borough, d => d.casualty_severity))

 
  const stack = d3.stack()
      .keys(['Slight', 'Serious', 'Fatal'])
      .value(([, group], key) => group.get(key)?.count || 0) // make sure conditional is included when data is missing - some groups don't have 'Fatal' count
  const series =  stack(d3.index(incidentArray, d => d.borough, d => d.casualty_severity));


  const color = d3.scaleOrdinal()
    .domain(['Slight', 'Serious', 'Fatal'])
    .range(d3.schemeTableau10);

  const x = d3.scaleLinear()
    .domain([0,d3.max(overallCounts, d => d.overallCount)])
    .range([0, width - margin.right]).nice();

  const xAxisGenerator = d3.axisBottom(x)
  .tickSize(-height + margin.bottom + margin.top);

  const y = d3.scaleBand()
    .domain([...new Set(incidentArray.map(d => d.borough))])
    .range([(height - margin.bottom), margin.top])
    .paddingInner(0.1);

  useEffect(() => {
    const svg = d3.select(gRef.current)
      // .append('svg')
      //   .attr('height', height)
      //   .attr('width', width)
      // .append('g');

    // add x axis
    let xAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},${height - margin.bottom + 5})`)
      .call(xAxisGenerator);
      
    xAxis.selectAll(' line')
      .attr('stroke', '#D9D9D9'); 
    xAxis.select('.domain').remove();

    // add bars
    svg.selectAll()
      .data(series)
      .join("g")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(D => D.map(d => (d.key = D.key, d)))
      .join("rect")
        .attr('class', d => d.data[0])
        .attr("x", d => x(d[0])+margin.left)
        .attr("y", d => y(d.data[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth());


    // add y-labels
    svg.selectAll()
      .data(incidentCount.keys())
      .join('text')
      .attr('y', d=> y(d))
      .attr('dy', y.bandwidth()/1.3)
      .attr('x', margin.left)
      .attr('dx', 2)
      .attr('text-anchor', 'start')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      // .attr('fill', '#3b3b3b')
      .text(d => d)
    
    return () => svg.selectAll('*').remove()
  }, [timeUnit, severityFilter, chosenMonth, chosenYear, svgWidth])

  // // update bars when data changes
  useEffect(() => {
    // d3.selectAll('.rankings rect')
    //   .each(function() {
    //     let element = d3.select(this); 
    //     let name = element.attr('name');
    //     let count = incidentArray.find(d => d.borough === name).count;
    //     element.transition().attr('width', x(count));
    //   });
    const boroIncidents = incidentArray.filter(d => d.borough === boroHover)[0];
    if (boroHover !== 'All Boroughs' &&  typeof boroIncidents !== 'undefined') {
      d3.select(gRef.current)
        .append('g')
          .attr('class', 'highlighted')
        .selectAll('rect')
        .data([boroIncidents])
        .join('rect')
          .attr('x', margin.left)
          .attr("y", d => y(d.borough))
          .attr("width", d => x(d.overallCount))
          .attr("height", y.bandwidth())
          .attr('stroke', 'red')
          .attr('stroke-width', 2.5)
          .attr('fill', 'none');
    }
    return () => d3.select('.highlighted').remove()
  }, [boroHover, chosenMonth, chosenYear, severityFilter, clientWidth])
  

  return (
    <div className="horizontal-bar grid-item" width="100%">
      <svg id={'id'} height="100%" width={svgWidth*1.1} viewBox={`0 0 ${svgWidth} ${height}`}>
        <text transform={`translate(${margin.left}, ${margin.top})`}>{plotTitle}</text>
        <g ref={gRef} transform={`translate(${0}, ${margin.top})`}></g>
      </svg>
    </div>
  )
  }


