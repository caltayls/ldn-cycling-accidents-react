import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3";

export default function LineAndBar({ csvData }) {
    const svgRef = useRef(null);
    const [cursorCoords, setCursorCoords] = useState([]);

    const margin = {
        top: 30,
        bottom: 20,
        left: 50,
        right: 20
      }
      const height = 400 - margin.top - margin.bottom;
      const width = 600 - margin.left - margin.right;

    const groupByYearAndSeverity = useMemo(() => {
        return d3.rollup(
            csvData, 
            v => ({year: new Date(v[0].year), severity: v[0]['Casualty Severity'], count: v.length}), 
            d => d.year, 
            d => d['Casualty Severity']
        );

    }, []) 
    
    // flat array of above map iterator
    const severityArray = useMemo(() => {
        return Array.from([...groupByYearAndSeverity.values()], iterator => Array.from(iterator.values())).flat()
        .sort((a, b) => a.year - b.year);
    }, []);


    const years = [...new Set(severityArray.map(d => d.year))];


    const series =  useMemo(() => {
        return d3.stack()
            .keys(d3.union(severityArray.map(d => d.severity)))
            .value(([, group], key) => group.get(key).count)
            (d3.index(severityArray, d => d.year, d => d.severity));

    }, []); 

    const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeAccent);



    const y = useMemo(() => {
        return d3.scaleLinear()
            // .domain([0, d3.max(yearCount.values(), d => d)])
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .rangeRound([height, 0])
    }, []);

   

    const yAxisGen = d3.axisLeft(y);

 


    const x = useMemo(() => {
        return d3.scaleUtc()
            .domain(d3.extent(years))
            .range([0, width])
    }, []);

    const xAxisGen = d3.axisBottom(x);


    const area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

    let [x1, x2] = x.range();
    let [y1, y2] = y.range();

    const yearsGridCoords = [...new Set(years.map(d => x(d)))];


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
              .attr("fill", d => color(d.key))
              .attr("d", area);

            
        svg.append('line')
                .attr('id', 'follow-cursor')
                .attr('y1', y1)
                .attr('y2', y2)
                .attr('x1', x1)
                .attr('x2', x2)
                .style('stroke', 'none')  
            
            



        
        return () => svg.selectAll("*").remove()
    }, [])


    function handleMouseMove(event) {
        let svg = d3.select(svgRef.current);
      
        let [xm, ] = d3.pointer(event)
        let closestYear = d3.least(yearsGridCoords, (x) => Math.abs(x - xm));
      
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
      
      useEffect(() => {
        let svg = d3.select(svgRef.current);
      
        svg
            .on('mousemove', handleMouseMove)
            .on('mouseleave', handleMouseLeave);
      
        return () => {
          svg.on('mouseover', null).on('mouseleave', null);
        }
    }, [])
 

    return (
        <svg id="line-and-bar" height={height + margin.top + margin.bottom} width={width + margin.left + margin.right}>
            <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`} ></g>
            
        </svg>
    )
}