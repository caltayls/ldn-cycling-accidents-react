import Select from 'react-select';
import * as d3 from 'd3';
import './FilterBar.css';

export default function FilterBar({csvData, boroughFilter, setBoroughFilter, setIsBoroughFilterClicked, yearFilter, setYearFilter, monthFilter, setMonthFilter, severityFilter, setSeverityFilter}) {
  
  const yearArray = d3.range(2005, 2023);
  const monthNamesArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthArray = [d3.range(0, 12)];
  const severityFilterOptions = ['All Severities', 'Slight', 'Serious', 'Fatal'];
  const boroughs = ['All Boroughs', ...new Set(csvData.map(d => d.borough))].sort();
  
  return (
    <div className='filter-container'>
      <div className='small-screen'>

      </div>
      <div className='filter-option borough'>
        <Select 
            value={boroughFilter}
            isClearable={true}
            // defaultValue={yearFilter}
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

  )


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