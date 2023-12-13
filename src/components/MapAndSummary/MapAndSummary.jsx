import { useRef, useState } from "react";

import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MapLeaflet from "../Map/MapLeaflet";
import SummaryBox from "../SummaryBox/SummaryBox";
import './MapAndSummary.css';

export default function MapAndSummary({ geoJsonData, csvData, csvFilterBySeverity, boroHover, setBoroHover, chosenMonth, chosenYear, severityFilter, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
 
  const boroughHighlightedRef = useRef(''); // used to remove previously selectled borough highlight

  return (
    <>
      <div className='summary grid-item'>
        <SummaryBox
          csvData={csvData} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
          severityFilter={severityFilter}
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
        ></SummaryBox>
      </div>
      <div className='leaflet-map grid-item'>
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