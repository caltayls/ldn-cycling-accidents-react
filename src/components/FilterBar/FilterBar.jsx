import Select from 'react-select';
import * as d3 from 'd3';
import './FilterBar.css';
import { useContext, useState } from 'react';
import { WindowContext } from '../WindowContextProvider/WindowContextProvider';

export default function FilterBar({csvData, boroughFilter, setBoroughFilter, setIsBoroughFilterClicked, yearFilter, setYearFilter, monthFilter, setMonthFilter, severityFilter, setSeverityFilter, setChartWindowOpen}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const yearArray = d3.range(2005, 2023);
  const monthNamesArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const severityFilterOptions = ['All Severities', 'Slight', 'Serious', 'Fatal'];
  const boroughs = ['All Boroughs', ...new Set(csvData.map(d => d.borough))].sort();

  const { clientWidth } = useContext(WindowContext);
  
  return (
    <>
    <div className='header title'>
    <h1> London Cycling Accidents</h1>
    </div>
    <div className='bluebar'></div>
    
    <div className={`filter-container ${menuOpen? 'active': ''}`}>
      <div className='filter-option borough'>
        <Select 
            value={boroughFilter}
            isClearable={true}
            onChange={handleBoroughChange}
            options={boroughs.map(d => ({value: d, label: d}))} 
            placeholder={boroughFilter}
            >
          </Select>
      </div>
      <div className='filter-option year'>
        <Select 
          isMulti
          isSearchable={false}
          placeholder={'All Years'}
          options={yearArray.map(d => ({value: d, label: d}))} 
          closeMenuOnSelect={false}
          onChange={handleYearChange}
        />
      </div>
      <div className='filter-option month'>
        <Select 
          isMulti
          isSearchable={false}
          placeholder={'All Months'}
          options={monthNamesArray.map(d => ({value: d, label: d}))} 
          closeMenuOnSelect={false}
          onChange={handleMonthChange}
        />
      </div>
      <div className='filter-option severity'>
        <Select 
          isMulti
          isSearchable={false}
          closeMenuOnSelect={false}
          onChange={handleSeverityChange}
          options={severityFilterOptions.map(d => ({value: d, label: d}))} 
          placeholder={'All Severities'}
        /> 
      </div>

    </div>
    <div className={`hamburger ${menuOpen? 'active': ''}`} onClick={handleHamburgerClick}>
      <div className='hamburger-icon'>
        <span className='bar'/>
        <span className='bar'/>
        <span className='bar'/>
      </div>

    </div>

    <div className='chart-page-button' onClick={() => {
            d3.select('.button-line').transition().attr('d', `M5 55 L20 ${6 + Math.random() * 48} L39 ${6 + Math.random() * 48} L58 ${6 + Math.random() * 48}`);
            setChartWindowOpen(true);
          }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 60 60">
        <path d="M5, 5 v50 h60" stroke='rgb(173, 173, 173)' strokeWidth="4" fill="transparent" />
        <path className='button-line' d="M5 55 L22 30 L41 40 L60 20" stroke='rgb(173, 173, 173)' strokeWidth="4" fill="transparent" strokeLinecap='round' strokeLinejoin='round'/>
      </svg>
    </div>
  </>

  )

  function handleHamburgerClick() {
    setMenuOpen(!menuOpen);

  }

  function handleBoroughChange({ value }) {
    setBoroughFilter(value);
    setIsBoroughFilterClicked(true);
  }
  function handleYearChange(selectedOptions) {
    setYearFilter(selectedOptions.map(d => d.value));
  }
  function handleMonthChange(selectedOptions) {
    // setMonthFilter(monthArray[monthNamesArray.indexOf(value)]);
    // setMonthFilter(value.map(d => monthNamesArray.indexOf(d)))
    setMonthFilter(selectedOptions.map(d => monthNamesArray.indexOf(d.value)));
  }
  function handleSeverityChange(selectedOptions) {
    setSeverityFilter(selectedOptions.map(d => d.value));
  }
}