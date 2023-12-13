import HorizontalBar from "../HorizontalBar/HorizontalBar";
import MultiLinePlotVertical from "../MultiLinePlot/MultiLinePlotVertical";
import "./BoroughContainer.css"

export default function BoroughContainer({csvFilterBySeverity, severityFilter, boroHover, chosenMonth, chosenYear, setBoroHover}) {
  const heightDecimal = 0.7;
  
  return (
    <div className='borough-data grid-item'>
      <h2> Cycling Accidents Across London Boroughs</h2>
      <div className="flex-container">
        <HorizontalBar 
          widthDecimal={0.3}
          heightDecimal={heightDecimal}
          severityFilter={severityFilter}
          csvData={csvFilterBySeverity}
          boroHover={boroHover} 
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'}
        />
        <MultiLinePlotVertical 
          widthDecimal={0.18}
          heightDecimal={heightDecimal}
          csvData={csvFilterBySeverity} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
          severityFilter={severityFilter}
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
          setBoroHover={setBoroHover}
        ></MultiLinePlotVertical>
      </div>
    </div>
  )
}