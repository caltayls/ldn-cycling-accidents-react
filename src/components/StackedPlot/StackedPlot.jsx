import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3";

export default function StackedPlot({ csvData, timeUnit, chosenYear, setChosenYear, chosenMonth, setChosenMonth, plotTitle }) {
  const svgRef = useRef(null);
  const [hoverYear, setHoverYear] = useState('');

  const margin = {
    top: 30,
    bottom: 40,
    left: 50,
    right: 20
  }
  const height = 250 - margin.top - margin.bottom;
  const width = 600 - margin.left - margin.right;

  function dateTimeParser(timeUnit, datetimeObj) {
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
  const groupByYearAndSeverity = useMemo(() => {
    return d3.rollup(
      csvData, 
      v => ({datetime: dateTimeParser(timeUnit, v[0].datetime), casualty_severity: v[0].casualty_severity, count: v.length}), 
      d => dateTimeParser(timeUnit, d.datetime), 
      d => d.casualty_severity
    );
  }, [csvData, timeUnit]); 




  // flat array of above map iterator
  const severityArray = useMemo(() => {
    return Array.from(groupByYearAndSeverity, ([, inner]) => [...inner.values()]).flat()
      .sort((a, b) => a.datetime - b.datetime);
  }, [csvData]);

  function getTimeSet(timeUnit, array, chosenYear=null, chosenMonth=null) {
    if (timeUnit === 'day') {
      const firstDay = new Date(chosenYear, chosenMonth, 1); 
      const lastDay = new Date(chosenYear, chosenMonth + 1, 0);
      const dateArray = d3.range(firstDay.getDate(), lastDay.getDate()+1)
      return dateArray
    }
    return [...new Set(array.map(d => d.datetime))];
  }
  
  const timeSet = getTimeSet(timeUnit, severityArray, chosenYear, chosenMonth);
  
  const series =  useMemo(() => {
    const stack = d3.stack()
      .keys(['Slight', 'Serious', 'Fatal'])
      .value(([, group], key) => group.get(key)?.count || 0) // make sure conditional is included when data is missing - some groups don't have 'Fatal' count
    return stack(d3.index(severityArray, d => d.datetime, d => d.casualty_severity));
  }, [csvData]); 

  const color = d3.scaleOrdinal()
    .domain(['Slight', 'Serious', 'Fatal'])
    .range(d3.schemeSpectral[series.length]);

  const y = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
      .rangeRound([height, 0])
  }, [csvData]);

  const yAxisGen = d3.axisLeft(y);

  const x = useMemo(() => {
    return d3.scaleLinear()
      .domain(d3.extent(timeSet))
      .range([0, width])
  }, [timeUnit]);

  const xAxisGen = d3.axisBottom(x)
    .tickFormat((d) => {
      return String(d)
    });

  // for stacked plot
  const area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // coordinates for plot interactivity
  const [x1, x2] = x.range();
  const [y1, y2] = y.range();
  const yearsGridCoords = timeSet.map(d => x(d));

  useEffect(() => {
    let svg = d3.select(svgRef.current);

    svg
      .append('g')
        .call(yAxisGen);
    svg
      .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxisGen);

    svg.append("g")
      .selectAll('path')
        .data(series)
        .join("path")
        .attr('class', d => d.key)
        .attr("fill", d => color(d.key))
        .attr("d", area);
        
        
    svg.append('line')
        .attr('id', 'follow-cursor')
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('x1', x1)
        .attr('x2', x2)
        .style('stroke', 'none')  
    
    return () => svg.selectAll("*").remove();
  }, [csvData])


  function handleMouseMove(event) {
    
    let [xm, ] = d3.pointer(event);
    let closestYear = d3.least(yearsGridCoords, (x) => Math.abs(x - xm));
    let svg = d3.select(svgRef.current);
  
    svg.select('#follow-cursor')
        .raise()
        .style('stroke', 'red')
        .attr('x1', closestYear)
        .attr('x2', closestYear);
  }
    
  function handleMouseLeave() {
    let svg = d3.select(svgRef.current);
    svg.select("#follow-cursor").style('stroke', null);
  }

  function handleClick(event) {
    let [xm, ] = d3.pointer(event);
    let closestYearCoords = d3.least(yearsGridCoords, (x) => Math.abs(x - xm));
    let closestTime = Math.ceil(x.invert(closestYearCoords));
    if (timeUnit === 'year') {
      setChosenYear(closestTime)
    } else if (timeUnit === 'month') {
      setChosenMonth(closestTime)
    }

  }
    
  // handling interactivity
  useEffect(() => {
    const svg = d3.select(svgRef.current);
  
    svg
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', handleClick);
  
    return () => svg.on('mouseover', null).on('mouseleave', null);
  }, [timeUnit])


  return (
    <svg id="line-and-bar" height={height + margin.top + margin.bottom} width={width + margin.left + margin.right}>
      <text fill="white" transform={`translate(${margin.left + 2}, ${margin.top/2})`}>{plotTitle}</text>
      <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`}></g>
    </svg>
  )
}


