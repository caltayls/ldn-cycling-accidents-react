import { useRef, useState } from "react";

import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MapLeaflet from "../Map/MapLeaflet";
import SummaryBox from "../SummaryBox/SummaryBox";

export default function MapAndMultiPlot({ geoJsonData, csvData, csvFilterBySeverity, boroHover, setBoroHover, chosenMonth, chosenYear, severityFilter, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
 
  const boroughHighlightedRef = useRef(''); // used to remove previously selectled borough highlight
  // const width = 800;

  return (
    <>
      <div className='summary grid-item' style={{height: '33vh', width:"49vw"}}>
        <SummaryBox
          csvData={csvData} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
          severityFilter={severityFilter}
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
        ></SummaryBox>
        {/* <MultiLinePlot 
          csvData={csvFilterBySeverity} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
          severityFilter={severityFilter}
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
          setBoroHover={setBoroHover}
          plotTitle={"Trends in Accidents Across London Boroughs Over Time"}
          boroughHighlightedRef={boroughHighlightedRef}
        ></MultiLinePlot> */}
      </div>
      <div className='leaflet-map grid-item' style={{position:'relative', height: '50vh', width:"100%"}}>
        <MapLeaflet 
          geoJsonData={geoJsonData} 
          csvData={csvFilterBySeverity}
          boroHover={boroHover} 
          setBoroHover={setBoroHover} 
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          severityFilter={severityFilter}
          isBoroughFilterClicked={isBoroughFilterClicked}
          setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          boroughHighlightedRef={boroughHighlightedRef}
        >
        </MapLeaflet>
      </div>

    </>
  )
}