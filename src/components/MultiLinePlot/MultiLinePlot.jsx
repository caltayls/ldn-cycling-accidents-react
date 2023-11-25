import { useEffect, useRef, useMemo } from "react";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV"
import * as d3 from "d3";
// TODO: fix interactivty 
export default function MultiLinePlot({ boroughHighlightedRef, csvData, chosenYear, chosenMonth, severityFilter, timeUnit, plotTitle, boroHover, setBoroHover}) {
  const outerRef = useRef(null);
  const svgRef = useRef(null);
  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth);
  
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
  
  const timeSet = getTimeSet(timeUnit, boroArray.flat(), chosenYear, chosenMonth); 
 
  const margin = {
    top: 30,
    bottom: 20,
    left: 50,
    right: 20
  }
  const height = 300;
  const width = 600;

  // x scale and axis
  const x = useMemo(() => {
    return d3.scaleLinear()
      .domain(d3.extent(timeSet))
      .range([margin.left, width - margin.right])
  }, [timeUnit, severityFilter]);
  
  const xAxisGen = d3.axisBottom(x)
    .tickFormat((d) => {
      return String(d)
    });


  // y scale and axis
  let y = d3.scaleLinear()
      .domain([0, d3.max(boroArray.flat(), d => d.count)])
      .range([height - margin.bottom, margin.top]).nice();
  let yAxisGen = d3.axisLeft(y);


  // for interaction - convert year and count to x, y
  const points = boroArray.map(boro => {
    return boro.map(year => {
      return {
        borough: year.borough,
        x: x(year.datetime),
        y: y(year.count)
      };
    });
  }).flat();

  // add lines
  let lineGenerator = d3.line()
    .x(d => x(d.datetime))
    .y(d => y(d.count));

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    // add paths
    svg.append('g')
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
        .attr('name', d => d[0].borough);
    
    // add x-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxisGen);

    // y-axis
    svg.append('g')
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxisGen);

    // for interactivity
    svg.append('circle')
      .attr('class', 'pointer-circle')
      .attr('r', 5)
      .style('fill', 'transparent')

    svg
      .append('text')
        .text(plotTitle)
        // .attr('fill', 'white')
        .attr('transform', `translate(${margin.left + 2}, ${margin.top/2})`)

    // Create the tooltip container.
    svg.append("g").attr("id", "multi-line-tool-tip");
        
    return () => svg.selectAll('*').remove();
  }, [timeUnit, severityFilter]);






  // // handling interactivity

  // let [xm, ym] = d3.pointer(event);

  // // borough of closest data point to pointer
  // let { borough} = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));
 
useEffect(() => {


}, [])

  return (
    <div className="multi-line-plot">
      <svg ref={outerRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g ref={svgRef}></g>
      </svg>
    </div>
  )

}


// create tool tip box
function drawToolTipBox(text, path) {
  const {x, y, width: w, height: h} = text.node().getBBox();
  text.attr("transform", `translate(${-w / 2},${15 - y})`);
  path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
}

function toolTipGenerator(toolTipElement, x, y, xCoord, yCoord) {
  toolTipElement
    .style("display", null)
    .attr("transform", `translate(${xCoord},${yCoord})`);

  const path = toolTipElement.selectAll("path")
    .data([,])
    .join("path")
      .attr("fill", "white")
      .attr("stroke", "black");

  const text = toolTipElement.selectAll("text")
    .data([,])
    .join("text")
    .call(text => text
      .selectAll("tspan")
      .data([x.invert(xCoord), y.invert(yCoord)])
      .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.1}em`)
        .attr("font-weight", (_, i) => i ? null : "bold")
        .text(d => d));
  drawToolTipBox(text, path);
}