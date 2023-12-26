import Select from 'react-select';
import * as d3 from 'd3';
import './FilterBar.css';

export default function FilterBar({csvData, boroughFilter, setBoroughFilter, setIsBoroughFilterClicked, yearFilter, setYearFilter, monthFilter, setMonthFilter, severityFilter, setSeverityFilter}) {
  
  const yearArray = ['All Years', ...d3.range(2005, 2023)];
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
          value={yearFilter}
          isClearable={true}
          // defaultValue={yearFilter}
          onChange={handleYearChange}
          options={yearArray.map(d => ({value: d, label: d}))} 
          placeholder={yearFilter.length === 0? 'All Years': 0} //change
          >
        </Select>
      </div>
      <div className='filter-option month'>
        <Select 
          // value={ monthFilter.length === 0? 'All Months': monthFilter.map(d => monthNamesArray[d + 1])}
          
          isMulti
          isSearchable={false}
          placeholder={'All Months'}
          options={monthNamesArray.map(d => ({value: d, label: d}))} 
          closeMenuOnSelect={false}
          onChange={handleMonthChange}
          
          // placeholder={ monthFilter.length === 0? 'All Months': monthFilter.map(d => monthNamesArray[d + 1])}
          />
    
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
    setBoroughFilter(value);
    setIsBoroughFilterClicked(true);
  }
  function handleYearChange({ value }) {
    setYearFilter(value);
  }
  function handleMonthChange(selectedOptions) {
    // setMonthFilter(monthArray[monthNamesArray.indexOf(value)]);
    // setMonthFilter(value.map(d => monthNamesArray.indexOf(d)))
    setMonthFilter(selectedOptions.map(d => monthNamesArray.indexOf(d.value)));
  }
  function handleSeverityChange({ value }) {
    setSeverityFilter(value);
  }
}