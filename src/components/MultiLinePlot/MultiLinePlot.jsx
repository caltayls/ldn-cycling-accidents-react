import { useEffect, useRef, useMemo } from "react";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV"
import * as d3 from "d3";
// TODO: fix interactivty 
export default function MultiLinePlot({ csvData, chosenYear, chosenMonth, timeUnit, plotTitle, boroHover, setBoroHover, mapDivRef }) {
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
  const timeSet = getTimeSet(timeUnit, boroArray[0], chosenYear, chosenMonth);
  let highlightedBorough;

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
  }, [timeUnit]);
  
  const xAxisGen = d3.axisBottom(x)
    .tickFormat((d) => {
      return String(d)
    });


  // y scale and axis
  let y = d3.scaleLinear()
      .domain(d3.extent(boroArray.flat(), d => d.count))
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
    const tooltip = svg.append("g").attr("id", "multi-line-tool-tip");
        
    return () => svg.selectAll('*').remove();
  }, [timeUnit]);




  // handling interactivity

function handleMouseOver() {

  if (highlightedBorough) {
    d3.select(svgRef.current)
    .select(`path[name="${highlightedBorough}"]`)
      .style('stroke', null)
      .style('stroke-width', null)
      .style("mix-blend-mode", "multiply");
    
    setBoroHover('All Boroughs');
  }

  let [xm, ym] = d3.pointer(event);

  // borough of closest data point to pointer
  let { borough, x: xCoord, y: yCoord } = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));
  
  setBoroHover(borough);
  highlightedBorough = borough;

  d3.select(svgRef.current).select('circle')
      .attr('transform', `translate(${xCoord}, ${yCoord})`)
      .style('fill', 'red');

  d3.select(svgRef.current)
    .select(`path[name="${borough}"]`).raise()
      .style('stroke', 'red')
      .style('stroke-width', 3)
      .style("mix-blend-mode", "normal");

  setBoroHover(borough);

  const toolTip = d3.select(outerRef.current).select("#multi-line-tool-tip");
    // const i = bisect(boroArray.flat(), x.invert(d3.pointer(event)[0]));
    toolTip
        .style("display", null)
        .attr("transform", `translate(${xCoord},${yCoord})`);

    const path = toolTip.selectAll("path")
      .data([,])
      .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

    const text = toolTip.selectAll("text")
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

    size(text, path);
}

function handleMouseLeave() {
  d3.select(svgRef.current)
    .select(`path[name="${highlightedBorough}"]`)
      .style('stroke', null)
      .style('stroke-width', null)
      .style("mix-blend-mode", null);
  
  // hide circle
  d3.select(svgRef.current).select('circle')
    .style('fill', 'transparent');

  // hide tool tip  
  d3.select(outerRef.current).select("#multi-line-tool-tip").style("display", "none");

  setBoroHover('All Boroughs');
}

// create tool tip box
function size(text, path) {
    const {x, y, width: w, height: h} = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  }
  useEffect(() => {

    // dot for line hover
    const svg = d3.select(outerRef.current)
      .on('pointerenter pointermove', handleMouseOver)
      .on('mouseleave', handleMouseLeave)

    return () => svg.on('pointermove', null).on('mouseleave', null)
  }, [timeUnit])


  return (
    <div className="multi-line-plot">
      <svg ref={outerRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g ref={svgRef}></g>
      </svg>
    </div>
  )

}
