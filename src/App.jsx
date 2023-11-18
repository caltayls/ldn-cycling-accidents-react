import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import * as d3 from "d3";

import Map from './components/Map/Map';
import './App.css'
import InfoAndPlotBox from './components/InfoAndPlotBox/InfoAndPlotBox';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [boroHover, setBoroHover] = useState('All Boroughs');
  const [chosenYear, setChosenYear] = useState('All Years');
  const [chosenMonth, setChosenMonth] = useState('All Months');

  console.log(chosenYear);

  const csvFiltered = filterCSV(csvData, boroHover, chosenYear, chosenMonth);
  
  const yearArray = ['All Years', ...d3.range(2005, 2023)];
  // const monthArray = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthArray = ['All Months',  ...d3.range(0, 12)];




  useEffect(() => {

    Promise.all([
      // d3.csv('src/assets/final_cycling_data_v2.csv', formatCSV),
      d3.csv('/data/final_cycling_data_v2.csv', formatCSV),
      // d3.json('src/assets/ldn_boro_geojson.json')
      d3.json('/data/ldn_boro_geojson.json')
    ]).then(([csvD, geoJ]) => {
    
      setGeoJsonData(geoJ);
      setCsvData(csvD);
      setLoading(false);
    });
  }, []);



  if (loading) return <></>;

  return (
    <>
      <div className="title">
        <h1>{boroHover} | {chosenYear} | {chosenMonth === 'All Months'? chosenMonth: new Date(2000, chosenMonth, 1).toLocaleString('en-US', { month: 'long' })}</h1>

      </div>
      <div className='map-and-accessories'>
        <Map 
          csvData={csvData}
            // ? csvData
            // : csvData.filter(d => d.datetime.getFullYear() === chosenYear)} 
          geoJsonData={geoJsonData} 
          setBoroHover={setBoroHover} 
          chosenYear={chosenYear} 
          chosenMonth={chosenMonth} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        > 
        </Map>
      </div>

      <div className='info-box'>
        <InfoAndPlotBox 
          csvData={csvFiltered} 
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
            // value={chosenYear}
            onChange={handleYearChange}
            options={yearArray.map(d => ({value: d, label: d}))} 
            placeholder='All Years'>
          </Select>
        </div>
        <div className='time-option month'>
          <Select 
            onChange={handleMonthChange}
            options={monthArray.map(d => ({value: d, label: d}))} 
            placeholder='All Months'>
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
}


function formatCSV(d) {
  return {
    ...d,
    datetime: new Date(d.datetime), 
  }
}

function filterCSV(csv, boroHover, chosenYear, chosenMonth) {
  const csvFilteredByBoro = boroHover === 'All Boroughs'
    ? csv
    : csv.filter(d => d.borough === boroHover);

  const csvFilteredByYear = chosenYear === 'All Years'
    ? csvFilteredByBoro
    : csvFilteredByBoro.filter(d => d.datetime.getFullYear() === chosenYear);

  const csvFilteredByMonth = chosenMonth === 'All Months'
    ? csvFilteredByYear
    : csvFilteredByYear.filter(d => d.datetime.getMonth() === chosenMonth);

  return csvFilteredByMonth
}


export default App
