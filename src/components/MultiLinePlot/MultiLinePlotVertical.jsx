import { useEffect, useRef, useMemo, useContext } from "react";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV"
import * as d3 from "d3";
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";
import { svg } from "leaflet";



export default function MultiLinePlotVertical({ widthDecimal, boroughHighlightedRef, csvData, chosenYear, chosenMonth, severityFilter, timeUnit, plotTitle, boroHover, setBoroHover}) {
  const divRef = useRef(null);
  const outerRef = useRef(null);
  const gRef = useRef(null);
  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth);
  const { clientHeight, clientWidth } = useContext(WindowContext);
  
  const timeSet = getTimeSet(timeUnit, chosenYear, chosenMonth); 
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
  
  // create array from map then fill array with datetime intervals that have count of zero.
  const boroArray = Array.from(boroObj, ([, inner]) => {
    const boroArray = [...inner.values()];
    const boroName = boroArray[0].borough;
    const boroYears = boroArray.flat().map(d => d.datetime);
    const yearsToAdd = timeSet.filter(d => !boroYears.includes(d) && d);
    const boroArrayToAppend = yearsToAdd.map(d => {
      return {borough: boroName, datetime: d, count: 0}
    });
    const combinedArray = [...boroArray.flat(), ...boroArrayToAppend]

    return combinedArray.sort((a, b) => timeUnit !== 'month'? (a.datetime - b.datetime): (parseInt(a.datetime) - parseInt(b.datetime)))
  });

  


 
 
  const svgWidth = clientWidth * widthDecimal; 
  const svgHeight = clientHeight * 0.8;


  const margin = {
    top: 40,
    bottom: 15,
    left: 15,
    right: 35
  }
  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;
 

  // y axis 
  const y = useMemo(() => {
    return d3.scaleLinear()
      .domain(d3.extent(timeSet))
      .range([0, height])
  }, [timeUnit, severityFilter, clientWidth]);

  const yAxisGen = d3.axisRight(y)
    .tickFormat((d) => {
      if (timeUnit === 'month') {
        const monthName = new Date(2000, d).toLocaleDateString('default', { month: 'short' });
        return monthName
      }
      return String(d)
    });

  // x axis
  let x = d3.scaleLinear()
      .domain([0, d3.max(boroArray.flat(), d => d.count)])
      .range([width, 0]);

  let xAxisGen = d3.axisTop(x);


  // for interaction - convert year and count to x, y
  const points = boroArray.map(boro => {
    return boro.map(year => {
      return {
        borough: year.borough,
        y: y(year.datetime),
        x: x(year.count)
      };
    });
  }).flat();

  // add lines
  let lineGenerator = d3.line()
    .x(d => x(d.count))
    .y(d => y(d.datetime));

  useEffect(() => {
    const g = d3.select(gRef.current)


    // add x-axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0, ${0})`)
      .call(xAxisGen.tickValues(x.ticks(5).slice(1)).ticks(5, "s"));

    xAxis.selectAll(' line')
      .attr('stroke', '#D9D9D9'); 
    xAxis.select('.domain').remove();

    // y-axis
    const yAxis = g.append('g')
        .attr('transform', `translate(${width*1.03}, 0)`)
        .call(yAxisGen.tickSize(-width*1.03));

        yAxis.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 
      yAxis.select('.domain').remove();


    // add paths
    g.append('g')
        .attr('class', 'line-paths')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
      .selectAll('path')
      .data(boroArray)
      .join('path')
        .style("mix-blend-mode", "multiply")
        .attr('d', lineGenerator)
        .attr('name', d => d[0].borough)

    g.select(`[name="${boroHover}"]`).raise()
        .style('stroke', 'red')
        .style('stroke-width', 3)
        .style("mix-blend-mode", "normal");
    

        
    return () => g.selectAll('*').remove();
  }, [timeUnit, severityFilter, chosenMonth, chosenYear, clientWidth, boroHover]);
  


  


  return (
    <>
    <div className="multi-line boroughs" width="50%">
      <svg ref={outerRef} height={height + margin.top + margin.bottom} width={width + margin.left + margin.right} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g ref={gRef} transform={`translate(${margin.left}, ${margin.top})`} ></g>
      </svg>
    </div>

    </>
  )

}
