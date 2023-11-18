import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import StackedBar from "../StackedBar/StackedBar";
import StackedPlot from "../StackedPlot/StackedPlot";


// TODO: Replace stacked plot with stacked bar for days of month data 
export default function InfoAndPlotBox({ csvData, boroHover, chosenYear, setChosenYear, chosenMonth, setChosenMonth }) {
    const csvFilteredByBoro = boroHover === 'All Boroughs'
        ? csvData
        : csvData.filter(d => d.borough === boroHover);

    const csvFilteredByYear = chosenYear === 'All Years'
        ? csvFilteredByBoro
        : csvFilteredByBoro.filter(d => d.datetime.getFullYear() === chosenYear);
    
    const csvFilteredByMonth = chosenMonth === 'All Months'
    ? csvFilteredByYear
    : csvFilteredByYear.filter(d => d.datetime.getMonth() === chosenMonth);

        



    return (
        <>
        <div className="plot">
            <StackedPlot 
              csvData={csvFilteredByMonth} 
              timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
              chosenYear={chosenYear}
              setChosenYear={setChosenYear}
              chosenMonth = {chosenMonth}
              setChosenMonth={setChosenMonth}
              plotTitle={"Trend in Accidents Over Time"}
              
            >
            </StackedPlot>    
            <StackedPlot csvData={csvFilteredByMonth} timeUnit='hour' plotTitle={"Accidents by Hour of Day"}></StackedPlot>
            <StackedBar csvData={csvFilteredByMonth} plotTitle={"Distribution of Cycling Accidents by Age Group and Gender"}></StackedBar>
        </div> 
        </>
        
    )

}

// for all boros create a line chart with a stacked bar chart