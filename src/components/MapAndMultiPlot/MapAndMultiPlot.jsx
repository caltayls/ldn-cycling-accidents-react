import { useRef, useState } from "react";

import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MapLeaflet from "../Map/MapLeaflet";

export default function MapAndMultiPlot({ geoJsonData, csvData, csvFilterBySeverity, boroHover, setBoroHover, chosenMonth, chosenYear, severityFilter, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
 
  const boroughHighlightedRef = useRef(''); // used to remove previously selectled borough highlight

  return (
    <>
      <div className='leaflet-map'>
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
      <div className='multi-line-plot'>
        <MultiLinePlot 
        csvData={csvData} 
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        severityFilter={severityFilter}
        chosenMonth={chosenMonth} 
        chosenYear={chosenYear}
        boroHover={boroHover}
        setBoroHover={setBoroHover}
        plotTitle={"Trends in Accidents Across London Boroughs Over Time"}
        boroughHighlightedRef={boroughHighlightedRef}
        ></MultiLinePlot>
      </div>
    </>
  )
}