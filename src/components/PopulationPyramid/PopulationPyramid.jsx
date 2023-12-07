import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

export default function PopulationPyramid({ csvData, plotTitle }) {

  const gRef = useRef();
  const ageGroups = [
    '00-04', '05-09', '10-14', '15-19', '20-24', 
    '25-29', '30-34', '35-39', '40-44',  '45-49', 
    '50-54', '55-59', '60-64', '65-69', '70-74', 
    '75-79', '80-84', '85-89', '90-94', '95-99',  
  ];

  const ageGenderMap = d3.rollup(
    csvData, 
    v => ({ageGroup: v[0].age_binned, sex: v[0].casualty_sex, count: v.length}),
    d => d.age_binned,
    d => d.casualty_sex
  );

  const ageGenderArray = Array.from(ageGenderMap, ([, inner]) => [...inner.values()]).flat()
    .filter(d => (d.ageGroup !== '') && (d.sex !== 'Unknown') );

console.log(ageGenderArray)

    const margin = {
      top: 30,
      bottom: 40,
      left: 50,
      right: 20
    }
    const height = 350 - margin.top - margin.bottom;
    const width = 600 - margin.left - margin.right;

  

    const xM = d3.scaleLinear()
      .domain([0, d3.max(ageGenderArray, d => d.count)])
      .range([width / 2, 0]).nice();

    const xF = d3.scaleLinear()
      .domain(xM.domain())
      .range([width / 2, width]);

    const y = d3.scaleBand()
      .domain(ageGroups)
      .rangeRound([height, 0])
      .padding(0.1);


  useEffect(() => {

    const g = d3.select(gRef.current);




        const xAxisM = g
        .append('g')
          .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xM).ticks(width / 80, "s").tickSize(-height))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick:first-of-type").remove());
      
  
  
      const xAxisF = g
        .append('g')
          .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xF).ticks(width / 80, "s").tickSize(-height))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick:first-of-type").remove());
  
  
      const yAxis = g
          .append('g')
         .attr("transform", `translate(${0},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove());


        yAxis.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 

        xAxisF.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 

        xAxisM.selectAll(' line')
        .attr('stroke', '#D9D9D9'); 
        
      
  
    g.append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .attr("dy", "0.35em")
        .attr("x", margin.left)
        .attr("y", y(ageGroups[0]))
        .text("Male");
  
    g.append("text")
        .attr("text-anchor", "start")
        .attr("fill", "black")
        .attr("dy", "0.35em")
        .attr("x", width - margin.left - margin.right)
        .attr("y", y(ageGroups[0]))
        .text("Female");


        
    g.append("g")
    .selectAll("rect")
    .data(ageGenderArray)
    .join("rect")
      .attr("fill", d => d3.schemeSet1[d.sex === "Male" ? 1 : 0])
      .attr("x", d => d.sex === "Male" ? xM(d.count) : xF(0))
      .attr("y", d => y(d.ageGroup))
      .attr("width", d => d.sex === "Male" ? xM(0) - xM(d.count) : xF(d.count) - xF(0))
      .attr("height", y.bandwidth());
  


    return () => d3.select(gRef.current).selectAll('*').remove();

  }, [csvData])


  return (
    <>
    <svg width="100%" height="{height + margin.top + margin.bottom}" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <text transform={`translate(${margin.left + 2}, ${margin.top/2})`}>{plotTitle}</text>
        <g ref={gRef} transform={`translate(${margin.left}, ${margin.top})`}></g>
    </svg>
    </>
  )

  

}