import { useEffect, useRef, useMemo } from "react";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV"
import * as d3 from "d3";
// TODO: fix interactivty 
export default function MultiLinePlot({ width, boroughHighlightedRef, csvData, chosenYear, chosenMonth, severityFilter, timeUnit, plotTitle, boroHover, setBoroHover}) {
  const divRef = useRef(null);
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
    top: 25,
    bottom: 20,
    left: 25,
    right: 15
  }
  const height = 300;
 

  // x scale and axis
  const x = useMemo(() => {
    return d3.scaleLinear()
      .domain(d3.extent(timeSet))
      .range([margin.left, width - margin.right])
  }, [timeUnit, severityFilter]);
  
  const xAxisGen = d3.axisBottom(x)
    .tickFormat((d) => {
      
      if (timeUnit === 'month') {
        const monthName = new Date(2000, d).toLocaleDateString('default', { month: 'short' });
        return monthName
      }
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


    // add x-axis
    const xAxis = svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxisGen);

    xAxis.selectAll(' line')
      .attr('stroke', '#D9D9D9'); 
    xAxis.select('.domain').remove();

    // y-axis
    const yAxis = svg.append('g')
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxisGen.tickSize(-width + margin.left + margin.right));

        yAxis.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 
      yAxis.select('.domain').remove();

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
        .attr('name', d => d[0].borough)

    svg.select(`[name="${boroHover}"]`).raise()
        .style('stroke', 'red')
        .style('stroke-width', 3)
        .style("mix-blend-mode", "normal");
    

        
    return () => svg.selectAll('*').remove();
  }, [timeUnit, severityFilter, chosenMonth, chosenYear]);






  // // handling interactivity

  function handleMouseMove(event) {

    let [xm, ym] = d3.pointer(event);
    // borough of closest data point to pointer
    let { borough, x: xCoord, y: yCoord} = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));
    if (boroHover !== 'All Boroughs') {

      let { borough, x: xCoord, y: yCoord} = d3.least(points.filter(d => d.borough === boroHover), d => Math.abs(d.x - xm));

      let pointerCircle = d3.select('.pointer-circle')
        .attr('display', null)
        .transition()  
        .attr('cx', xCoord)
        .attr('cy', yCoord)
        .style('stroke', 'red')



      const yearArr = boroArray.flat().filter(d => d.datetime === x.invert(xCoord)).sort((a,b) => a.count - b.count);      
      let boroughRank = yearArr.findIndex(d => d.borough === boroHover);



    } 

  }

  function handleMouseLeave() {
    let pointerCircle = d3.select('.pointer-circle')
    .style('display', 'none')

 
  }

  function handleClick() {
    let [xm, ym] = d3.pointer(event);
    // borough of closest data point to pointer
    let { borough, x: xCoord, y: yCoord} = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));

    if (boroHover !== 'All Boroughs') { // removes already selected borough
      
      // remove plot highlight
      d3.select(`g.line-paths path[name="${ boroughHighlightedRef.current}"]`)
      .style('stroke', 'steelblue')
      .style('stroke-width', 1.5)
      .style("mix-blend-mode", "multiply");

      // remove map highlight
      d3.select(`.outline [name="${boroughHighlightedRef.current}"]`)
      .style('stroke', 'white')
      .style('stroke-width', 1);

      //hide circle
      let pointerCircle = d3.select('.pointer-circle')
        .style('stroke', null)
        .attr('display', 'none');
  


      boroughHighlightedRef.current = '';
      setBoroHover('All Boroughs');
    } else {
      d3.select(`g.line-paths [name="${borough}"]`).raise()
          .style('stroke', 'red')
          .style('stroke-width', 3)
          .style("mix-blend-mode", "normal");

      d3.select(`.outline [name="${borough}"]`).raise()
          .style('stroke', 'red')
          .style('stroke-width', 2);

      let pointerCircle = d3.select('.pointer-circle')
        .attr('display', null)
        .attr('cx', xCoord)
        .attr('cy', yCoord)
        .style('stroke', 'red')
  


      setBoroHover(borough);
    }

  }

 
useEffect(() => {
  const svg = d3.select(outerRef.current);
  svg.on('click', handleClick).on('mousemove', handleMouseMove).on('mouseleave', handleMouseLeave)

  // return () => svg.off('click', handleClick).off('mousemove', handleMouseMove).off('mouseleave', handleMouseLeave)

}, [boroHover, chosenMonth, chosenYear])

  return (
    // <div ref={divRef} className="multi-line-plot" width="100%" height="20vh">
    <>
    
    <svg ref={outerRef} width='45vw' height="100%" viewBox={`0 0 ${width} ${height}`}>
      <g ref={svgRef}></g>
    </svg>
    
    </>

    // {/* </div> */}
  )

}


