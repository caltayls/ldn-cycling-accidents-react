import { useContext, useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";

export default function StackedPlot({ csvData, boroHover, timeUnit, chosenYear, setChosenYear, chosenMonth, setChosenMonth, plotTitle, svgWidthDecimal, id }) {
  const svgRef = useRef(null);
  const [hoverYear, setHoverYear] = useState('');
  const { clientHeight, clientWidth } = useContext(WindowContext);


  const svgWidth = clientWidth * svgWidthDecimal; 


  const margin = {
    top: 30,
    bottom: 20,
    left: 30,
    right: 30
  }
  const height = 180 - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;
  

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


  
  const timeSet = getTimeSet(timeUnit, severityArray, chosenYear, chosenMonth);
  
  const series =  useMemo(() => {
    const stack = d3.stack()
      .keys(['Slight', 'Serious', 'Fatal'])
      .value(([, group], key) => group.get(key)?.count || 0) // make sure conditional is included when data is missing - some groups don't have 'Fatal' count
    return stack(d3.index(severityArray, d => d.datetime, d => d.casualty_severity));
  }, [severityArray]); 

  const color = d3.scaleOrdinal()
    .domain(['Slight', 'Serious', 'Fatal'])
    .range(d3.schemeTableau10);


  // vertical
  const y = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
      .rangeRound([height, 0])
  }, [series, height]);


  const x = useMemo(() => {
    return d3.scaleBand()
      .domain(timeSet)
      .range([0, width])
      .padding(0.1);
  }, [csvData, width]);


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

    
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0).tickValues(y.ticks(5).slice(1)).ticks(5, "s").tickSize(-width));
    
    yAxis.select('.domain').remove();
    yAxis.selectAll(' line').attr('stroke', '#D9D9D9');
    
    
    const xAxis = svg
      .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxisGen);
        
    xAxis.select('.domain').remove();
    xAxis.selectAll(' line').attr('stroke', '#D9D9D9');
     

// data
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
        
    // svg.append('line')
    //     .attr('id', 'follow-cursor')
    //     .attr('y1', y1)
    //     .attr('y2', y2)
    //     .attr('x1', x1)
    //     .attr('x2', x2)
    //     .style('stroke', 'none')  
    
    return () => svg.selectAll("*").remove();
  }, [csvData, clientWidth])




  return (
    <div className="svg-container" width="100%">
      <svg id={id} height={height + margin.top + margin.bottom} width={width + margin.left + margin.right} viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <text transform={`translate(${10}, ${margin.top/2})`}>{plotTitle}</text>
        <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`}></g>
      </svg>
    </div>
  )
}


