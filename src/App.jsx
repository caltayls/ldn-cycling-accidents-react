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
import InfoContainer from './components/InfoContainer/InfoContainer';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boroughFilter, setBoroughFilter] = useState('All Boroughs');
  const [isBoroughFilterClicked, setIsBoroughFilterClicked] = useState(false);
  const [yearFilter, setYearFilter] = useState([]);
  const [monthFilter, setMonthFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);

  // this allows data paths to be modified depending on if in production or development
  const isProduction = import.meta.env.MODE === 'production';
  const urlBase = isProduction ? import.meta.env.BASE_URL : '/';
  
  const csvFilterBySeverity = severityFilter.length === 0
    ? csvData
    : csvData.filter(d => d.casualty_severity === severityFilter);
  
  const csvFiltered = filterCSV(csvFilterBySeverity, yearFilter, monthFilter, boroughFilter)

  useEffect(() => {
    Promise.all([
      d3.csv(urlBase + 'data/final_cycling_data_v2.csv', formatCSV),
      d3.json(urlBase + 'data/ldn_boro_geojson.json')
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
        />
      </header>
      <div className='split-container'>
        <div className='left-side split-grid'>
          <MapAndSummary
              geoJsonData={geoJsonData}
              csvData={csvData}
              csvFilterBySeverity={csvFilterBySeverity} 
              boroughFilter={boroughFilter}
              setBoroughFilter={setBoroughFilter}
              monthFilter={monthFilter}
              yearFilter={yearFilter}
              severityFilter={severityFilter}
              isBoroughFilterClicked={isBoroughFilterClicked}
              setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          ></MapAndSummary>
        </div>
        <div className='right-side split-grid'>
          <div className='info-box grid-item'>
            <InfoContainer
              boroughFilter={boroughFilter}
              yearFilter={yearFilter}
              monthFilter={monthFilter}
              severityFilter={severityFilter}
            />
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
