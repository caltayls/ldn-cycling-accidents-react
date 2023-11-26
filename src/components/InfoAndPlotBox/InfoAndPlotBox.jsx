import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import StackedBar from "../StackedBar/StackedBar";
import StackedPlot from "../StackedPlot/Stacked";
import { filterCSV } from "../utils/filterCSV";

import './InfoAndPlotBox.css';


// TODO: Replace stacked plot with stacked bar for days of month data 
export default function InfoAndPlotBox({ csvData, boroHover, chosenYear, setChosenYear, chosenMonth, setChosenMonth }) {
  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth, boroHover)

  return (
    <>
    <div className="plot">
      <StackedPlot 
        id={'time-bar'}
        csvData={csvFiltered} 
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        chosenYear={chosenYear}
        setChosenYear={setChosenYear}
        chosenMonth = {chosenMonth}
        setChosenMonth={setChosenMonth}
        plotTitle={"Trend in Accidents Over Time"} 
        inputWidth ={600} 
      >
      </StackedPlot>
      <div className="hour-and-weekday">
        <StackedPlot id={'weekday-bar'} csvData={csvFiltered} timeUnit='weekday' plotTitle={"Accidents by Day of Week"} inputWidth={300} horizontalBar={true}></StackedPlot>
        <StackedPlot id={'day-bar'} csvData={csvFiltered} timeUnit='hour' plotTitle={"Accidents by Hour of Day"} inputWidth={300}></StackedPlot>
      </div>    

      <StackedBar csvData={csvFiltered} plotTitle={"Distribution of Cycling Accidents by Age Group and Gender"}></StackedBar>
    </div> 
    </>  
  )

}