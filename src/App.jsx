import { useState, useEffect } from 'react';
import * as d3 from "d3";
import './App.css';

import { WindowContextProvider } from './components/WindowContextProvider/WindowContextProvider';
import SummaryBox from './components/SummaryBox/SummaryBox';
import DatetimeContainer from './components/DatetimeContainer/DatetimeContainer';
import MapAndSummary from './components/MapAndSummary/MapAndSummary';
import PopulationPyramid from './components/PopulationPyramid/PopulationPyramid';
import BoroughContainer from './components/BoroughContainer/BoroughContainer';
import { filterCSV } from './components/utils/filterCSV';
import FilterBar from './components/FilterBar/FilterBar';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boroughFilter, setBoroughFilter] = useState('All Boroughs');
  const [isBoroughFilterClicked, setIsBoroughFilterClicked] = useState(false);
  const [yearFilter, setYearFilter] = useState([]);
  const [monthFilter, setMonthFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);
  const [chartWindowOpen, setChartWindowOpen] = useState(false);
  

  // this allows data paths to be modified depending on if in production or development
  // const isProduction = import.meta.env.MODE === 'production';
  // const urlBase = isProduction ? import.meta.env.BASE_URL : '/';
  
  const csvFilterBySeverity = severityFilter.length === 0
    ? csvData
    : csvData.filter(d => severityFilter.includes(d.casualty_severity));
  
  const csvFiltered = filterCSV(csvFilterBySeverity, yearFilter, monthFilter, boroughFilter)

  useEffect(() => {
    Promise.all([
      d3.csv('/src/assets/final_cycling_data_v2.csv', formatCSV), // add url base to both to make work outside of s3
      d3.json('/src/assets/ldn_boro_geojson.json')
    ]).then(([csvD, geoJ]) => {
      setGeoJsonData(geoJ);
      setCsvData(csvD);
      setIsLoading(false);
    });
  }, []);

  // create context for all state in app
  if (isLoading) return <></>;
  return (
    <>
    <WindowContextProvider>

      
    <div className='chart-page-button' onClick={() => 
      setChartWindowOpen(true)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 60 60">
        <path d="M5, 5 v50 h60" stroke='rgb(173, 173, 173)' strokeWidth="4" fill="transparent" />
        <path className='button-line' d="M5 55 L22 30 L41 40 L60 20" stroke='rgb(173, 173, 173)' strokeWidth="4" fill="transparent" strokeLinecap='round' strokeLinejoin='round'/>
      </svg>
    </div>

      <header className='filter-options'>
        <FilterBar
          csvData={csvData}
          boroughFilter={boroughFilter}
          setBoroughFilter={setBoroughFilter}
          setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          chartWindowOpen={chartWindowOpen}
          setChartWindowOpen={setChartWindowOpen}
        />
      </header>
      <div className='split-container'>
        <div className='left-side split-grid'>
          <MapAndSummary
              geoJsonData={geoJsonData}
              csvData={csvData}
              csvFilterBySeverity={csvFiltered} 
              boroughFilter={boroughFilter}
              setBoroughFilter={setBoroughFilter}
              monthFilter={monthFilter}
              yearFilter={yearFilter}
              severityFilter={severityFilter}
              isBoroughFilterClicked={isBoroughFilterClicked}
              setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          ></MapAndSummary>
        </div>
        <div className={`right-side split-grid ${chartWindowOpen? 'active': ''}`}>

          <div 
            className={`map-page-return ${chartWindowOpen? 'active': ''}`}
            onClick={() => setChartWindowOpen(false)}
          >
            <svg width="30px" height="30px" viewBox='0 0 100 100'>
              <path d="M10 10 L90 90 L50 50 L90 10 L10 90" stroke='rgb(173, 173, 173)' strokeWidth="10" fill="transparent" strokeLinecap='round' strokeLinejoin='round'></path>
            </svg>
          </div>
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
          <BoroughContainer
            severityFilter={severityFilter}
            csvFilterBySeverity={csvFilterBySeverity}
            boroughFilter={boroughFilter}
            setBoroughFilter={setBoroughFilter}
            yearFilter={yearFilter}
            monthFilter={monthFilter}
          />
          <div className='datetime grid-item'>
            <DatetimeContainer 
              csvData={csvFiltered} 
              boroughFilter={boroughFilter} 
              yearFilter={yearFilter} 
              setYearFilter={setYearFilter}
              monthFilter={monthFilter}
            />
          </div>
          <div className="population-pyramid grid-item">
            <PopulationPyramid 
              csvData={csvFiltered} 
              plotTitle={"Distribution of Cycling Accidents by Age Group and Gender"}
            />
          </div>
        </div>
      </div>
    </WindowContextProvider>
    </>
  );
}

function formatCSV(d) {
  return {
    ...d,
    datetime: new Date(d.datetime), 
  }
}

export default App
