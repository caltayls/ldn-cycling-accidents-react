import HorizontalBar from "../HorizontalBar/HorizontalBar";
import MultiLinePlotVertical from "../MultiLinePlot/MultiLinePlotVertical";

export default function BoroughContainer({csvFilterBySeverity, severityFilter, boroHover, chosenMonth, chosenYear, setBoroHover}) {
  return (
    <div className='borough-data grid-item'>
      <HorizontalBar 
        widthDecimal={0.3}
        plotTitle={'London Boroughs: Cycling Incidents'}
        severityFilter={severityFilter}
        csvData={csvFilterBySeverity}
        boroHover={boroHover} 
        chosenMonth={chosenMonth} 
        chosenYear={chosenYear} 
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'}
      />
      <MultiLinePlotVertical 
        widthDecimal={0.18}
        csvData={csvFilterBySeverity} 
        timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
        severityFilter={severityFilter}
        chosenMonth={chosenMonth} 
        chosenYear={chosenYear}
        boroHover={boroHover}
        setBoroHover={setBoroHover}
        plotTitle={"Trends in Accidents Across London Boroughs Over Time"}
      ></MultiLinePlotVertical>
    </div>
  )
}