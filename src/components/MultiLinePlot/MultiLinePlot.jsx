import { useEffect, useRef, useMemo, useContext } from "react";
import { dateTimeParser, getTimeSet } from "../utils/datetime_utils";
import { filterCSV } from "../utils/filterCSV"
import * as d3 from "d3";
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";
import { svg } from "leaflet";



export default function MultiLinePlot({className, boroughHighlightedRef, csvData, yearFilter, monthFilter, severityFilter, timeUnit, plotTitle, boroughFilter, setboroughFilter}) {
  const divRef = useRef(null);
  const outerRef = useRef(null);
  const gRef = useRef(null);
  const csvFiltered = filterCSV(csvData, yearFilter, monthFilter);
  const { clientHeight, clientWidth } = useContext(WindowContext);
  
  
  const boroObj = useMemo(() => (d3.rollup(
    csvFiltered, 
    v=> ({
      borough: v[0].borough, 
      datetime: dateTimeParser(timeUnit, v[0].datetime), 
      count: v.length
    }), 
    (d) => d.borough, 
    (d) => dateTimeParser(timeUnit, d.datetime),
  )), [csvFiltered, timeUnit]);


  
  const timeSet = getTimeSet(timeUnit, yearFilter, monthFilter); 

   // create array from map then fill array with datetime intervals that have count of zero.
   const boroArray = useMemo(() => (Array.from(boroObj, ([, inner]) => {
    const boroArray = [...inner.values()];
    const boroName = boroArray[0].borough;
    const boroYears = boroArray.flat().map(d => d.datetime);
    const yearsToAdd = timeSet.filter(d => !boroYears.includes(d) && d);
    const boroArrayToAppend = yearsToAdd.map(d => {
      return {borough: boroName, datetime: d, count: 0}
    });
    const combinedArray = [...boroArray.flat(), ...boroArrayToAppend]

    return combinedArray.sort((a, b) => timeUnit !== 'month'? (a.datetime - b.datetime): (parseInt(a.datetime) - parseInt(b.datetime)))
  })), [boroObj]);

 
  const svgWidth = clientWidth * 0.95; 
  const svgHeight = clientHeight * 0.3;


  const margin = {
    top: 30,
    bottom: 30,
    left: 15,
    right: 20
  }
  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;
 

  // x scale and axis
  const x = useMemo(() => {
    return d3.scaleLinear()
      .domain(d3.extent(timeSet))
      .range([margin.left, width])
  }, [width, margin, timeSet]);


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
      .range([height, 0]).nice();
  let yAxisGen = d3.axisLeft(y);


  // add lines
  let lineGenerator = d3.line()
    .x(d => x(d.datetime))
    .y(d => y(d.count));

  useEffect(() => {
    const g = d3.select(gRef.current)


    // add x-axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisGen);

    xAxis.selectAll(' line')
      .attr('stroke', '#D9D9D9'); 
    xAxis.select('.domain').remove();

    // y-axis
    const yAxis = g.append('g')
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxisGen.tickSize(-width + margin.left));

        yAxis.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 
      yAxis.select('.domain').remove();

    // for interactivity
    g.append('circle')
      .attr('class', 'pointer-circle')
      .attr('r', 5)
      .style('fill', 'transparent')

    g
      .append('text')
        .text(plotTitle)
        // .attr('fill', 'white')
        .attr('transform', `translate(${0}, ${-margin.top/2 - 2})`)

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

    g.select(`[name="${boroughFilter}"]`).raise()
        .style('stroke', 'red')
        .style('stroke-width', 3)
        .style("mix-blend-mode", "normal");
    

        
    return () => g.selectAll('*').remove();
  }, [timeUnit, severityFilter, monthFilter, yearFilter, clientWidth, boroughFilter]);


  return (
    <>
    <div className={className} width="100%">
      <svg ref={outerRef} height={height + margin.top + margin.bottom} width={width + margin.left + margin.right} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g ref={gRef} transform={`translate(${margin.left}, ${margin.top})`} ></g>
      </svg>
    </div>
    </>
  )

}











  // // // handling interactivity

  // function handleMouseMove(event) {

  //   let [xm, ym] = d3.pointer(event);
  //   // borough of closest data point to pointer
  //   let { borough, x: xCoord, y: yCoord} = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));
  //   if (boroughFilter !== 'All Boroughs') {

  //     let { borough, x: xCoord, y: yCoord} = d3.least(points.filter(d => d.borough === boroughFilter), d => Math.abs(d.x - xm));

  //     let pointerCircle = d3.select('.pointer-circle')
  //       .attr('display', null)
  //       .transition()  
  //       .attr('cx', xCoord)
  //       .attr('cy', yCoord)
  //       .style('stroke', 'red')



  //     const yearArr = boroArray.flat().filter(d => d.datetime === x.invert(xCoord)).sort((a,b) => a.count - b.count);      
  //     let boroughRank = yearArr.findIndex(d => d.borough === boroughFilter);



  //   } 

  // }

  // function handleMouseLeave() {
  //   let pointerCircle = d3.select('.pointer-circle')
  //   .style('display', 'none')

 
  // }



// function handleClick() {
//   let [xm, ym] = d3.pointer(event);
//   // borough of closest data point to pointer
//   let { borough, x: xCoord, y: yCoord} = d3.least(points, d => Math.hypot(d.x - xm, d.y - ym));

//   if (boroughFilter !== 'All Boroughs') { // removes already selected borough
    
//     // remove plot highlight
//     d3.select(`g.line-paths path[name="${ boroughHighlightedRef.current}"]`)
//     .style('stroke', 'steelblue')
//     .style('stroke-width', 1.5)
//     .style("mix-blend-mode", "multiply");

//     // remove map highlight
//     d3.select(`.outline [name="${boroughHighlightedRef.current}"]`)
//     .style('stroke', 'white')
//     .style('stroke-width', 1);

//     //hide circle
//     let pointerCircle = d3.select('.pointer-circle')
//       .style('stroke', null)
//       .attr('display', 'none');



//     boroughHighlightedRef.current = '';
//     setboroughFilter('All Boroughs');
//   } else {
//     d3.select(`g.line-paths [name="${borough}"]`).raise()
//         .style('stroke', 'red')
//         .style('stroke-width', 3)
//         .style("mix-blend-mode", "normal");

//     d3.select(`.outline [name="${borough}"]`).raise()
//         .style('stroke', 'red')
//         .style('stroke-width', 2);

//     let pointerCircle = d3.select('.pointer-circle')
//       .attr('display', null)
//       .attr('cx', xCoord)
//       .attr('cy', yCoord)
//       .style('stroke', 'red')



//     setboroughFilter(borough);
//   }

// }


// useEffect(() => {
// const svg = d3.select(outerRef.current);
// svg.on('click', handleClick).on('mousemove', handleMouseMove).on('mouseleave', handleMouseLeave)

// // return () => svg.off('click', handleClick).off('mousemove', handleMouseMove).off('mouseleave', handleMouseLeave)

// }, [boroughFilter, monthFilter, yearFilter, clientWidth])
