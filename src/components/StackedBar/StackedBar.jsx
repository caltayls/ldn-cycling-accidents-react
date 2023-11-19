import * as d3 from "d3";
import { useEffect, useRef } from "react";

// TODO: fix csv age bands
export default function StackedBar({ csvData, plotTitle }) {
  
  const svgRef = useRef(null);
  const margin = {
    top: 30,
    bottom: 40,
    left: 50,
    right: 20
  }
  const height = 300 - margin.top - margin.bottom;
  const width = 600 - margin.left - margin.right;

  const ageGenderMap = d3.rollup(
      csvData, 
      v => ({ageGroup: v[0].age_binned, sex: v[0].casualty_sex, count: v.length}),
      d => d.age_binned,
      d => d.casualty_sex
  );

  const ageGenderArray = Array.from(ageGenderMap, ([, inner]) => [...inner.values()]).flat()
    .filter(d => (d.ageGroup !== '') && (d.sex !== 'Unknown') )
  


  const ageGroups = [
    '00-04', '05-09', '10-14', '15-19', '20-24', 
    '25-29', '30-34', '35-39', '40-44',  '45-49', 
    '50-54', '55-59', '60-64', '65-69', '70-74', 
    '75-79', '80-84', '85-89', '90-94', '95-99',  
  ]
  const sex = ['Male', 'Female', 'Unknown']; // need three keys for color. change color scheme later

  const series = d3.stack()
      .keys(sex) // distinct series keys, in input order
      .value(([, D], key) => D.get(key)?.count || 0) // get value for each series key and stack
    (d3.index(ageGenderArray, d => d.ageGroup, d => d.sex)); // group by stack then series key

  
  // Prepare the scales for positional and color encodings.
  const x = d3.scaleBand()
      .domain(ageGroups)
      .range([0, width])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([height, 0]).nice();

  const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeTableau10)
      .unknown("#ccc");



  useEffect(() => {
    const svg = d3.select(svgRef.current);

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

    // Append the horizontal axis.
    svg.append("g")
        .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
        .style("text-anchor", "end")  // Optional: Align text anchor
        .attr("dx", "-.8em")           // Optional: Adjust horizontal positioning
        .attr("dy", ".15em")           // Optional: Adjust vertical positioning
        .attr("transform", "rotate(-45)");  // Rotate the labels

    // Append the vertical axis.
    svg.append("g")
      .call(d3.axisLeft(y).ticks(null, "s"))




    return () => svg.selectAll('*').remove();
  }, [csvData]);
 
  return (
    <div className="stacked-bar age-groups">
      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <text transform={`translate(${margin.left + 2}, ${margin.top/2})`}>{plotTitle}</text>
        <g ref={svgRef} transform={`translate(${margin.left}, ${margin.top})`}></g>

      </svg>
    </div>
  )
}
// .attr("width", width)
// .attr("height", height)
// .attr("viewBox", [0, 0, width, height])
// .attr("style", "max-width: 100%; height: auto;");