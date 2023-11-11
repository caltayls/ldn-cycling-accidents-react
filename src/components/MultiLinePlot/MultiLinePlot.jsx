import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function MultiLinePlot({ csvData }) {
  const svgRef = useRef(null);
  const boroObj = d3.rollup(csvData, v=> ({count: v.length}), (d) => d.borough, (d) => d.datetime.getFullYear());
  console.log(boroObj);

  const margin = {
    top: 30,
    bottom: 20,
    left: 50,
    right: 20
  }
  const height = 400 - margin.top - margin.bottom;
  const width = 600 - margin.left - margin.right;

  // x scale and axis
  let x = d3.scaleTime()
      .domain(d3.extent(csvData, d => d.datetime))
      .range([0, width]);
  let xAxisGen = d3.axisBottom(x);


  // y scale and axis
  let y = d3.scaleLinear()
      .domain(d3.extent(csvData, d => d.count))
      .range([height, 0]).nice();
  let yAxisGen = d3.axisLeft(y);


  // for interaction - convert year and count to x, y
  let points = csvD.map((d) => {
    return {
      borough: d.borough,
      x: x(d.year),
      y: y(d.count)
    }
  });
  
  // format data
  let groupedData = d3.group(csvData, d => d.borough); 

  // add lines
  let lineGenerator = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count));

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxisGen);

    svg.append('g')
        .call(yAxisGen);
    
    svg.append('g')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
      .selectAll('path')
      .data(groupedData.values())
      .join('path')
        .attr('d', lineGenerator)
        .attr('name', d => d[0].borough)
        .style("mix-blend-mode", "multiply")
        
        
        d3.select('#line-plot svg').on('pointermove', lineMoveCursor)
  })
  
  // handling interactivity
  useEffect(() => {
    // dot for line hover
    const dot = d3.select(svgRef.current)
    .append('circle')
      .attr('r', 10)
      .style('fill', 'transparent');
  })
  return (
    <div className="multi-line-plot">
      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`}></g>
      </svg>
    </div>
  )

  

  }





function lineMoveCursor(event) {
  let [xm, ym] = d3.pointer(event);
  console.log(xm, ym)
  // borough of closest data point to pointer
  let { borough, x, y } = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));

  dot
      .attr('transform', `translate(${x}, ${y})`)
      .style('fill', 'red');

  d3.selectAll('#line-plot path')
      .each(function(d) {
        elementName = d3.select(this).attr('name');
        if (elementName === borough) {
          d3.select(this).attr('stroke', 'red')
        }
      })
}