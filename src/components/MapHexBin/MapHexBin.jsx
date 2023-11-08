import { useEffect, useState, useMemo } from "react";
import { hexbin } from "d3-hexbin";
import * as d3 from 'd3'; 



import HexTools from "../HexTools/HexTools";
import HexLegend from "../HexLegend/HexLegend";


export default function MapHexBin({ csvData, projection, width, height, mapSvgRef }) {
  const [hexRadius, setHexRadius] = useState(4);
  const [colorScaleType, setColorScaleType] = useState('Linear');


  const hex = useMemo(() => (hexbin()
    .extent([width, height])
    .radius(hexRadius)
    .x(d => projection([+d.long, +d.lat])[0])
    .y(d => projection([+d.long, +d.lat])[1])
  ), [hexRadius]);

  const domainExtent = useMemo(() => d3.extent(hex(csvData), d => d.length), [hexRadius, colorScaleType]);
    
  // hex color scales
  const logScale = d3.scaleLog()
    .domain(domainExtent);

  const linearScale = d3.scaleLinear()
    .domain(domainExtent);

  const colorScale = d3.scaleSequential(d => d3.interpolateViridis(
    colorScaleType === 'Linear'? linearScale(d): logScale(d)
  ));



  useEffect (() => {

    // d3.select(mapSvgRef.current).selectAll('.hexagon').remove();
    // d3.select('#legend svg').remove();
    // d3.select(`${mapSvgRef.current} .map-outline`).remove();

    let svg = d3.select(mapSvgRef.current)


    svg
      .append("g")
        .attr("class", "hexagon")//.raise()
      .selectAll("path")
      .data(hex(csvData))
      .join("path")
        .attr('class', 'hex')
        .attr('size', d => d.length)
        .attr("d", d => `M${d.x},${d.y}${hex.hexagon()}`)
        .style('fill', d => colorScale(d.length));
      
    // createLegend(domainExtent, colorScale) 
    return () => {d3.select(mapSvgRef.current).selectAll('.hexagon').remove()}
    }, [hexRadius, colorScaleType])
  
    
    return (
    <>
      <HexLegend height={height} domainExtent={domainExtent} colorScale={colorScale}></HexLegend>
      <HexTools hexRadius={hexRadius} setHexRadius={setHexRadius} setColorScaleType={setColorScaleType} mapSvgRef={mapSvgRef}></HexTools>
    </>
    )
  }
  