import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';

import * as d3 from "d3";

import Map from './components/Map/MapLeaflet';
import './App.css'
import InfoAndPlotBox from './components/InfoAndPlotBox/InfoAndPlotBox';
// import MapReactLeaflet from './components/Map/MapReactLeaflet';

function App() {
  const [csvData, setCsvData] = useState([]);

  const [geoJsonData, setGeoJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [boroHover, setBoroHover] = useState('All Boroughs');
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


  const yearArray = ['All Years', ...d3.range(2005, 2023)];
  // const monthArray = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthArray = ['All Months',  ...d3.range(0, 12)];
  const severityFilterOptions = ['All Severities', 'Slight', 'Serious', 'Fatal'];
  




  useEffect(() => {

    Promise.all([
      // d3.csv('src/assets/final_cycling_data_v2.csv', formatCSV),
      d3.csv(urlBase + 'data/final_cycling_data_v2.csv', formatCSV),
      // d3.json('src/assets/ldn_boro_geojson.json')
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
      <div className="title">
        <h1>{boroHover} | {chosenYear} | {chosenMonth === 'All Months'? chosenMonth: new Date(2000, chosenMonth, 1).toLocaleString('en-US', { month: 'long' })}</h1>
      </div>
      <div className='leaflet-map'>
        <Map 
          geoJsonData={geoJsonData} 
          csvData={csvFilterBySeverity} 
          setBoroHover={setBoroHover} 
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          severityFilter={severityFilter}
        >
        </Map>
      </div>

      <div className='info-box'>
        <InfoAndPlotBox 
          csvData={csvFilterBySeverity} 
          boroHover={boroHover} 
          chosenYear={chosenYear} 
          setChosenYear={setChosenYear}
          chosenMonth={chosenMonth}
          setChosenMonth={setChosenMonth}>
        </InfoAndPlotBox>
      </div>

      <div className='time-options'>
        <div className='time-option year'>
          <Select 
            value={chosenYear}
            isClearable={true}
            // defaultValue={chosenYear}
            onChange={handleYearChange}
            options={yearArray.map(d => ({value: d, label: d}))} 
            placeholder={chosenYear}
            >
          </Select>
        </div>
        <div className='time-option month'>
          <Select 
            value={chosenMonth}
            onChange={handleMonthChange}
            options={monthArray.map(d => ({value: d, label: d}))} 
            placeholder={chosenMonth}>
          </Select>
        </div>
        <div className='filter severity'>
          <Select 
              value={severityFilter}
              onChange={handleSeverityChange}
              options={severityFilterOptions.map(d => ({value: d, label: d}))} 
              placeholder={severityFilter}>
            </Select>
        </div>
      </div>
    </>
  );
  
  function handleYearChange({ value }) {
    setChosenYear(value)
  }
  function handleMonthChange({ value }) {
    setChosenMonth(value)
  }
  function handleSeverityChange({ value }) {
    setSeverityFilter(value)
  }

}


function formatCSV(d) {
  return {
    ...d,
    datetime: new Date(d.datetime), 
  }
}


export default App
