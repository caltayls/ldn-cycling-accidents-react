import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3";
import { dateTimeParser } from "../utils/datetime_utils";

export default function StackedPlot({ csvData, timeUnit, chosenYear, setChosenYear, chosenMonth, setChosenMonth, plotTitle, inputWidth, id }) {
  const svgRef = useRef(null);
  const [hoverYear, setHoverYear] = useState('');

  const margin = {
    top: 30,
    bottom: 40,
    left: 35,
    right: 20
  }
  const height = 180 - margin.top - margin.bottom;
  const width = inputWidth - margin.left - margin.right;

  const weekDays = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun',];

 
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
    .range(d3.schemeTableau10);


  // vertical
  const y = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
      .rangeRound([height, 0])
  }, [csvData]);


  const x = useMemo(() => {
    return d3.scaleBand()
      .domain(timeSet)
      .range([0, width])
      .padding(0.03);
  }, [timeUnit]);

  const xAxisGen = d3.axisBottom(x)
    .tickSizeOuter(0)
    .tickFormat((d) => {
      if (timeUnit === 'month') {
        const monthName = new Date(2000, d).toLocaleString('default', { month: 'short' });
        return monthName
      } else if (timeUnit === 'weekday') {
        return weekDays[d]
      }
      return String(d)
    });

  if (timeUnit === 'hour') { 
    xAxisGen.tickValues(d3.range(0, 22, 3))
  }

  // for stacked plot
  // const area = d3.area()
  //   .x(d => x(d.data[0]))
  //   .y0(d => y(d[0]))
  //   .y1(d => y(d[1]));

  // coordinates for plot interactivity
  const [x1, x2] = x.range();
  const [y1, y2] = y.range();
  const yearsGridCoords = timeSet.map(d => x(d));

  useEffect(() => {
    let svg = d3.select(svgRef.current);

    // y axis
    svg.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0).tickValues(y.ticks(5).slice(1)).ticks(5, "s"));
    
    //x axis 
    svg
      .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxisGen);

    svg.selectAll()
      .data(series)
      .join("g")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(D => D.map(d => (d.key = D.key, d)))
      .join("rect")
        .attr('class', d => d.data[0])
        .attr("x", d => x(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        
    svg.append('line')
        .attr('id', 'follow-cursor')
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('x1', x1)
        .attr('x2', x2)
        .style('stroke', 'none')  
    
    return () => svg.selectAll("*").remove();
  }, [csvData])


  // function handleMouseMove(event) {
    
  //   let [xm, ] = d3.pointer(event);
  //   let closestYear = d3.least(yearsGridCoords, (x) => Math.abs(x - xm));
  //   let svg = d3.select(svgRef.current);
  
  //   svg.select('#follow-cursor')
  //       .raise()
  //       .style('stroke', 'red')
  //       .attr('x1', closestYear)
  //       .attr('x2', closestYear);
  // }
    
  // function handleMouseLeave() {
  //   let svg = d3.select(svgRef.current);
  //   svg.select("#follow-cursor").style('stroke', null);
  // }

  // function handleClick(event) {
  //   let [xm, ] = d3.pointer(event);
  //   let closestYearCoords = d3.least(yearsGridCoords, (x) => Math.abs(x - xm));
  //   let closestTime = Math.ceil(x.invert(closestYearCoords));
  //   if (timeUnit === 'year') {
  //     setChosenYear(closestTime)
  //   } else if (timeUnit === 'month') {
  //     setChosenMonth(closestTime)
  //   }

  // }
    
  // // handling interactivity
  // useEffect(() => {
  //   const svg = d3.select(svgRef.current);
  
  //   svg
  //     .on('mousemove', handleMouseMove)
  //     .on('mouseleave', handleMouseLeave)
  //     .on('click', handleClick);
  
  //   return () => svg.on('mouseover', null).on('mouseleave', null);
  // }, [timeUnit])


  return (
    <div className="svg-container" width="100%">
      <svg id={id} height={height + margin.top + margin.bottom} width="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <text transform={`translate(${margin.left + 2}, ${margin.top/2})`}>{plotTitle}</text>
        <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`}></g>
      </svg>
    </div>
  )
}


