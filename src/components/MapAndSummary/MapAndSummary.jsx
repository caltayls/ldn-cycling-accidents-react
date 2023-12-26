import { useRef, useState } from "react";

import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MapLeaflet from "../Map/MapLeaflet";
import SummaryBox from "../SummaryBox/SummaryBox";
import './MapAndSummary.css';

export default function MapAndSummary({ geoJsonData, csvData, csvFilterBySeverity, boroughFilter, setBoroughFilter, monthFilter, yearFilter, severityFilter, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
 
  const boroughHighlightedRef = useRef(''); // used to remove previously selectled borough highlight

  return (
    <>
      <div className='summary grid-item'>
        <SummaryBox
          csvData={csvData} 
          timeUnit={yearFilter.length === 0? 'year': monthFilter.length === 0? 'month': 'day'} 
          severityFilter={severityFilter}
          monthFilter={monthFilter} 
          yearFilter={yearFilter}
          boroughFilter={boroughFilter}
        />
      </div>
      <div className='leaflet-map grid-item'>
        <MapLeaflet 
          geoJsonData={geoJsonData} 
          csvData={csvFilterBySeverity}
          boroughFilter={boroughFilter} 
          setBoroughFilter={setBoroughFilter} 
          monthFilter={monthFilter} 
          yearFilter={yearFilter}
          severityFilter={severityFilter}
          isBoroughFilterClicked={isBoroughFilterClicked}
          setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          boroughHighlightedRef={boroughHighlightedRef}
        />
      </div>
    </>
  )
}