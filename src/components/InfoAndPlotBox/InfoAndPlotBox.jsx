import { useContext } from "react";
import StackedPlot from "../StackedPlot/Stacked";


import './InfoAndPlotBox.css';
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";


// TODO: Replace stacked plot with stacked bar for days of month data 
export default function InfoAndPlotBox({ csvData, boroHover, chosenYear, setChosenYear, chosenMonth, setChosenMonth }) {

  


  return (
    <>
    <div className="plot">
      <StackedPlot 
        id={'time-bar'}
        csvData={csvData} 
        boroHover={boroHover}
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        chosenYear={chosenYear}
        setChosenYear={setChosenYear}
        chosenMonth = {chosenMonth}
        setChosenMonth={setChosenMonth}
        plotTitle={"Trend in Accidents Over Time"} 
        svgWidthDecimal = {0.44} 
      >
      </StackedPlot>
      {chosenYear === 'All Years' && (
        <StackedPlot 
          id={chosenMonth === 'All Months'? 'month-bar': 'day-bar'} 
          csvData={csvData} 
          boroHover={boroHover} 
          timeUnit={chosenMonth === 'All Months'? 'month': 'day'} 
          plotTitle={chosenMonth === 'All Months'? "Accidents by Month": "Accidents by Day"} 
          svgWidthDecimal = {0.44}  
          horizontalBar={true}>
        </StackedPlot>
      )}
      <div className="hour-and-weekday">
        <StackedPlot id={'weekday-bar'} csvData={csvData} boroHover={boroHover} timeUnit='weekday' plotTitle={"Accidents by Day of Week"} svgWidthDecimal = {0.2}  horizontalBar={true}></StackedPlot>
        <StackedPlot id={'day-bar'} csvData={csvData} boroHover={boroHover} timeUnit='hour' plotTitle={"Accidents by Hour of Day"} svgWidthDecimal = {0.2} ></StackedPlot>
      </div>    

      
    </div> 

    </>  
  )

}
