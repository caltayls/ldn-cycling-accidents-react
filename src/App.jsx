import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';

import * as d3 from "d3";

import MapLeaflet from './components/Map/MapLeaflet';
import './App.css'
import InfoAndPlotBox from './components/InfoAndPlotBox/InfoAndPlotBox';
import MultiLinePlot from './components/MultiLinePlot/MultiLinePlot';
import MapAndMultiPlot from './components/MapAndMultiPlot/MapAndMultiPlot';



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


  const yearArray = ['All Years', ...d3.range(2005, 2023)];
  const monthNamesArray = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthArray = ['All Months',  ...d3.range(0, 12)];
  const severityFilterOptions = ['All Severities', 'Slight', 'Serious', 'Fatal'];
  const boroughs = ['All Boroughs', ...new Set(csvData.map(d => d.borough))].sort();
  

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
      
      <MapAndMultiPlot
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
      ></MapAndMultiPlot>
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

      <div className='filter-options'>
        <div className='filter-option borough'>
          <Select 
              value={boroHover}
              isClearable={true}
              // defaultValue={chosenYear}
              onChange={handleBoroughChange}
              options={boroughs.map(d => ({value: d, label: d}))} 
              placeholder={boroHover}
              >
            </Select>
        </div>
        <div className='filter-option year'>
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
        <div className='filter-option month'>
          <Select 
            value={ chosenMonth === 'All Months'? chosenMonth: monthNamesArray[chosenMonth + 1]}
            onChange={handleMonthChange}
            options={monthNamesArray.map(d => ({value: d, label: d}))} 
            placeholder={ chosenMonth === 'All Months'? chosenMonth: monthNamesArray[chosenMonth + 1]}>
          </Select>
        </div>
        <div className='filter-option severity'>
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

  function handleBoroughChange({ value }) {
    setBoroHover(value);
    setIsBoroughFilterClicked(true);
  }
  function handleYearChange({ value }) {
    setChosenYear(value);
  }
  function handleMonthChange({ value }) {
    let monthIndex = monthNamesArray.indexOf(value);
    setChosenMonth(monthArray[monthNamesArray.indexOf(value)]);
  }
  function handleSeverityChange({ value }) {
    setSeverityFilter(value);
  }

}


function formatCSV(d) {
  return {
    ...d,
    datetime: new Date(d.datetime), 
  }
}


export default App
