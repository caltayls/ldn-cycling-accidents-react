import { useState, useEffect } from 'react';
import * as d3 from "d3";
import './App.css';

import { WindowContextProvider } from './components/WindowContextProvider/WindowContextProvider';
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
  const [boroHover, setBoroHover] = useState('All Boroughs');
  const [isBoroughFilterClicked, setIsBoroughFilterClicked] = useState(false);
  const [chosenYear, setChosenYear] = useState('All Years');
  const [chosenMonth, setChosenMonth] = useState('All Months');
  const [severityFilter, setSeverityFilter] = useState('All Severities')

  // this allows data paths to be modified depending on if in production or development
  const isProduction = import.meta.env.MODE === 'production';
  const urlBase = isProduction ? import.meta.env.BASE_URL : '/';
  
  const csvFilterBySeverity = 
  severityFilter === 'All Severities'
    ? csvData
    : csvData.filter(d => d.casualty_severity === severityFilter);
  
  const csvFiltered = filterCSV(csvFilterBySeverity, chosenYear, chosenMonth, boroHover)

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

  if (isLoading) return <></>;
  return (
    <>
    <WindowContextProvider>
      <header className='filter-options'>
        <FilterBar
          csvData={csvData}
          boroHover={boroHover}
          setBoroHover={setBoroHover}
          setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          chosenYear={chosenYear}
          setChosenYear={setChosenYear}
          chosenMonth={chosenMonth}
          setChosenMonth={setChosenMonth}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
        />
      </header>
      <section className='split-container'>
        <div className='left-side split-grid'>
          <MapAndSummary
              geoJsonData={geoJsonData}
              csvData={csvData}
              csvFilterBySeverity={csvFilterBySeverity} 
              boroHover={boroHover}
              setBoroHover={setBoroHover}
              chosenMonth={chosenMonth}
              chosenYear={chosenYear}
              severityFilter={severityFilter}
              isBoroughFilterClicked={isBoroughFilterClicked}
              setIsBoroughFilterClicked={setIsBoroughFilterClicked}
          ></MapAndSummary>
        </div>
        <div className='right-side split-grid'>
          <BoroughContainer
            severityFilter={severityFilter}
            csvFilterBySeverity={csvFilterBySeverity}
            boroHover={boroHover}
            setBoroHover={setBoroHover}
            chosenYear={chosenYear}
            chosenMonth={chosenMonth}
          />
          <div className='datetime grid-item'>
            <DatetimeContainer 
              csvData={csvFiltered} 
              boroHover={boroHover} 
              chosenYear={chosenYear} 
              setChosenYear={setChosenYear}
              chosenMonth={chosenMonth}
              setChosenMonth={setChosenMonth}
            />
          </div>
          <div className="population-pyramid grid-item">
            <PopulationPyramid 
              csvData={csvFiltered} 
              plotTitle={"Distribution of Cycling Accidents by Age Group and Gender"}
            />
          </div>
        </div>
      </section>
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
