import { useContext } from "react";
import StackedPlot from "../StackedPlot/Stacked";


import './DatetimeContainer.css';
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";


// TODO: Replace stacked plot with stacked bar for days of month data 
export default function DatetimeContainer({ csvData, boroughFilter, yearFilter, setYearFilter, monthFilter, setMonthFilter }) {

  const { clientWidth } = useContext(WindowContext);
  const elementWidth = clientWidth > 960? 0.45: 0.9;
  const flexElementWidth = clientWidth > 960? 0.2: 0.9;


  return (
    <>
    <StackedPlot 
      id={'time-bar'}
      csvData={csvData} 
      boroughFilter={boroughFilter}
      timeUnit={yearFilter.length === 0? 'year': monthFilter.length === 0? 'month': 'day'} 
      yearFilter={yearFilter}
      setYearFilter={setYearFilter}
      monthFilter = {monthFilter}
      setMonthFilter={setMonthFilter}
      plotTitle={"Trend in Accidents Over Time"} 
      svgWidthDecimal = {elementWidth} 
    >
    </StackedPlot>
    {yearFilter.length === 0 && (
      <StackedPlot 
        id={monthFilter.length === 0? 'month-bar': 'day-bar'} 
        csvData={csvData} 
        boroughFilter={boroughFilter} 
        timeUnit={monthFilter.length === 0? 'month': 'day'} 
        plotTitle={monthFilter.length === 0? "Accidents by Month": "Accidents by Day"} 
        svgWidthDecimal = {elementWidth}  
        horizontalBar={true}>
      </StackedPlot>
    )}
    <div className="hour-and-weekday">
      <StackedPlot id={'weekday-bar'} csvData={csvData} boroughFilter={boroughFilter} timeUnit='weekday' plotTitle={"Accidents by Day of Week"} svgWidthDecimal = {flexElementWidth}  horizontalBar={true}></StackedPlot>
      <StackedPlot id={'day-bar'} csvData={csvData} boroughFilter={boroughFilter} timeUnit='hour' plotTitle={"Accidents by Hour of Day"} svgWidthDecimal = {flexElementWidth} ></StackedPlot>
    </div>    
    </>  
  )

}
