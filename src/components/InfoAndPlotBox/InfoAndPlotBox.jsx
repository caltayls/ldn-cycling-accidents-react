import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import StackedBar from "../StackedBar/StackedBar";
import StackedPlot from "../StackedPlot/StackedPlot";

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
            >
            </StackedPlot>    
            <StackedPlot csvData={csvFilteredByMonth} timeUnit='hour'></StackedPlot>
            <StackedBar csvData={csvFilteredByMonth}></StackedBar>
        </div> 
        </>
        
    )

}

// for all boros create a line chart with a stacked bar chart