import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import MapPolygons from "../MapPolygons/MapPolygons";
import MapHexBin from "../MapHexBin/MapHexBin";
import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import { filterCSV } from "../utils/filterCSV";
import './Map.css';




export default function Map({ csvData, geoJsonData, boroHover, setBoroHover, chosenYear, chosenMonth, severityFilter, timeUnit, mapDivRef }) {


  const mapSvgRef = useRef(null);
  console.log(csvData)

  const width = 800;
  const height = 400;

  const projection = useMemo(() => (
    d3.geoNaturalEarth1()
      .fitSize([width, height], geoJsonData)
  ), []);

  const geoGenerator = d3.geoPath()
    .projection(projection);


  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth);

  return (
    <>
    <div className="map-features">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <g ref={mapSvgRef}></g>
        </svg>
    </div>
        
    <MultiLinePlot 
      csvData={csvData} 
      timeUnit={timeUnit} 
      severityFilter={severityFilter}
      chosenMonth={chosenMonth} 
      chosenYear={chosenYear}
      boroHover={boroHover}
      setBoroHover={setBoroHover}
      mapDivRef={mapDivRef}
      plotTitle={"Trends in Accidents Across London Boroughs Over Time"}
    ></MultiLinePlot>

    <MapPolygons id='map-fill' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='none' fill='#440154' mapDivRef={mapDivRef}></MapPolygons>
    <MapPolygons id='map-outline' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='#ffff' fill='transparent' setBoroHover={setBoroHover} mapDivRef={mapDivRef}></MapPolygons>
    <MapHexBin csvData={csvFiltered} projection={projection} width={width} height={height} mapSvgRef={mapSvgRef} chosenYear={chosenYear} chosenMonth={chosenMonth} mapDivRef={mapDivRef}></MapHexBin>
    </>
  )

}
  

