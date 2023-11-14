import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import MapPolygons from "../MapPolygons/MapPolygons";
import MapHexBin from "../MapHexbin/MapHexbin";
import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";




export default function Map({ csvData, geoJsonData, setBoroHover, chosenYear, chosenMonth }) {


  const mapSvgRef = useRef(null);

  const width = 600;
  const height = 500;

  const projection = useMemo(() => (
    d3.geoNaturalEarth1()
      .fitSize([width, height], geoJsonData)
  ), []);

  const geoGenerator = d3.geoPath()
    .projection(projection);



  return (
    <>
      <div className='map-features'>
        <svg width={width} height={height}>
          <g ref={mapSvgRef}></g>
        </svg>
        <MultiLinePlot csvData={csvData} timeUnit='year'></MultiLinePlot>
      </div>
      <MapPolygons id='map-fill' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='none' fill='#440154'></MapPolygons>
      <MapHexBin csvData={csvData} projection={projection} width={width} height={height} mapSvgRef={mapSvgRef} chosenYear={chosenYear} chosenMonth={chosenMonth}></MapHexBin>
      <MapPolygons id='map-outline' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='#ffff' fill='transparent' setBoroHover={setBoroHover}></MapPolygons>

    </>
  )

}
  

