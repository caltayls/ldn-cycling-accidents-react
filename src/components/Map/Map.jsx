import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import MapPolygons from "../MapPolygons/MapPolygons";
import MapHexBin from "../MapHexBin/MapHexBin";
import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import { filterCSV } from "../utils/filterCSV";
import './Map.css';




export default function Map({ csvData, geoJsonData, boroHover, setBoroHover, chosenYear, chosenMonth, timeUnit }) {


  const mapSvgRef = useRef(null);

  const width = 600;
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
      <div className='map-features'>
        <svg width={width} height={height}>
          <g ref={mapSvgRef}></g>
        </svg>
        <MapPolygons id='map-fill' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='none' fill='#440154'></MapPolygons>
        <MapPolygons id='map-outline' geoJsonData={geoJsonData} geoGenerator={geoGenerator} mapSvgRef={mapSvgRef} stroke='#ffff' fill='transparent' setBoroHover={setBoroHover}></MapPolygons>
        <MapHexBin csvData={csvFiltered} projection={projection} width={width} height={height} mapSvgRef={mapSvgRef} chosenYear={chosenYear} chosenMonth={chosenMonth}></MapHexBin>
        
        <MultiLinePlot 
          csvData={csvData} 
          timeUnit={timeUnit} 
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
          setBoroHover={setBoroHover}
          
          plotTitle={"Trends in Accidents Across London Boroughs Over Time"}
        ></MultiLinePlot>
      </div>
      
      

    </>
  )

}
  

