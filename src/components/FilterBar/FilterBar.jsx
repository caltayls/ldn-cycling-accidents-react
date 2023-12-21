import Select from 'react-select';
import * as d3 from 'd3';
import './FilterBar.css';

export default function FilterBar({csvData, boroHover, setBoroHover, setIsBoroughFilterClicked, chosenYear, setChosenYear, chosenMonth, setChosenMonth, severityFilter, setSeverityFilter}) {
  
  const yearArray = ['All Years', ...d3.range(2005, 2023)];
  const monthNamesArray = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthArray = ['All Months',  ...d3.range(0, 12)];
  const severityFilterOptions = ['All Severities', 'Slight', 'Serious', 'Fatal'];
  const boroughs = ['All Boroughs', ...new Set(csvData.map(d => d.borough))].sort();
  
  return (
    <div className='filter-container'>
      <div className='small-screen'>
        <h2>&#xbb;</h2>
      </div>
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

  )


  function handleBoroughChange({ value }) {
    setBoroHover(value);
    setIsBoroughFilterClicked(true);
  }
  function handleYearChange({ value }) {
    setChosenYear(value);
  }
  function handleMonthChange({ value }) {
    setChosenMonth(monthArray[monthNamesArray.indexOf(value)]);
  }
  function handleSeverityChange({ value }) {
    setSeverityFilter(value);
  }
}