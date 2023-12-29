import { useEffect, useRef, useMemo, useContext } from "react";
import * as d3 from "d3";
import { dateTimeParser } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV";
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";


export default function HorizontalBar({ csvData, timeUnit, monthFilter, yearFilter, severityFilter, boroughFilter, widthDecimal, heightDecimal }) {

  const gRef = useRef(null);
  const boroughNames = useMemo(() => new Set(csvData.map(d => d.borough)), []);
  const csvFiltered = useMemo(() => filterCSV(csvData, yearFilter, monthFilter), [csvData, yearFilter, monthFilter]);
  

  const margin = {
    top: 17,
    bottom: 20,
    left: 128,
    right: 10
  }

  const { clientHeight, clientWidth } = useContext(WindowContext);
  const svgWidth = clientWidth * (clientWidth > 960? 0.27: 0.9);
  const svgHeight = clientHeight * heightDecimal; 
  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;

  const incidentCount = useMemo(() => (d3.rollup(
    csvFiltered, 
      v => ({borough: v[0].borough, casualty_severity: v[0].casualty_severity, count: v.length}), 
      d => d.borough, 
      d => d.casualty_severity
    )), [csvFiltered]);


  let incidentArray = Array.from(incidentCount, ([, inner]) => [...inner.values()]).flat()

  // add overall count to array for ordering
  const overallCounts = useMemo(() => d3.rollups(incidentArray, v => ({borough: v[0].borough, overallCount: d3.sum(v, d => d.count)}), d => d.borough).map(d => d[1]), [incidentArray]);
  
  incidentArray = incidentArray.map(d => {
    const overallCount = overallCounts.filter(x => x.borough === d.borough)[0].overallCount;
    return {...d, overallCount: overallCount}
  }).sort((a, b) => a.overallCount - b.overallCount)


  const stack = d3.stack()
      .keys(['Slight', 'Serious', 'Fatal'])
      .value(([, group], key) => group.get(key)?.count || 0) // make sure conditional is included when data is missing - some groups don't have 'Fatal' count
  const series =  stack(d3.index(incidentArray, d => d.borough, d => d.casualty_severity));


  const color = d3.scaleOrdinal()
    .domain(['Slight', 'Serious', 'Fatal'])
    .range(d3.schemeTableau10);

  const x = useMemo(() => (d3.scaleLinear()
    .domain([0,d3.max(overallCounts, d => d.overallCount)])
    .range([0, width])), [overallCounts, width]);

  const xAxisGenerator = d3.axisBottom(x)
  .tickSize(-height);

  const y = useMemo(() => (d3.scaleBand()
    .domain([...new Set(incidentArray.map(d => d.borough))])
    .range([height, 0])
    .paddingInner(0.2)), [incidentArray, height]);

  useEffect(() => {
    const svg = d3.select(gRef.current)
      // .append('svg')
      //   .attr('height', height)
      //   .attr('width', width)
      // .append('g');

      const yAxis = svg.append("g")
      .attr('transform', `translate(${margin.left},${0})`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
    
    // yAxis.select('.domain').remove();
    yAxis.selectAll(' line').remove() //.attr('stroke', '#D9D9D9');
    yAxis.select('.domain').remove();

    // add x axis
    let xAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},${height+5})`)
      .call(xAxisGenerator.ticks(5, "s"));
      
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


        svg.selectAll('text')
          .attr('stroke', '#D9D9D9')
          .attr('stroke-width', 0.1);

    return () => svg.selectAll('*').remove()
  }, [timeUnit, severityFilter, monthFilter, yearFilter, svgWidth])

  // // update bars when data changes
  useEffect(() => {
    const boroIncidents = incidentArray.filter(d => d.borough === boroughFilter)[0];
    if (boroughFilter !== 'All Boroughs' &&  typeof boroIncidents !== 'undefined') {
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
  }, [boroughFilter, monthFilter, yearFilter, severityFilter, clientWidth])
  

  return (
    <div className="horizontal-bar" width="50%">
      <svg id={'id'} height={height + margin.top + margin.bottom} width={width + margin.left + margin.right} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g ref={gRef} transform={`translate(${0}, ${margin.top})`}></g>
      </svg>
    </div>
  )
  }


