import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import StackedBar from "../StackedBar/StackedBar";
import StackedPlot from "../StackedPlot/Stacked";
import { filterCSV } from "../utils/filterCSV";


// TODO: Replace stacked plot with stacked bar for days of month data 
export default function InfoAndPlotBox({ csvData, boroHover, chosenYear, setChosenYear, chosenMonth, setChosenMonth }) {
  const csvFiltered = filterCSV(csvData, chosenYear, chosenMonth, boroHover)

  return (
    <>
    <div className="plot">
      <StackedPlot 
        csvData={csvFiltered} 
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        chosenYear={chosenYear}
        setChosenYear={setChosenYear}
        chosenMonth = {chosenMonth}
        setChosenMonth={setChosenMonth}
        plotTitle={"Trend in Accidents Over Time"}  
      >
      </StackedPlot>    
      <StackedPlot csvData={csvFiltered} timeUnit='hour' plotTitle={"Accidents by Hour of Day"}></StackedPlot>
      <StackedBar csvData={csvFiltered} plotTitle={"Distribution of Cycling Accidents by Age Group and Gender"}></StackedBar>
    </div> 
    </>  
  )

}
