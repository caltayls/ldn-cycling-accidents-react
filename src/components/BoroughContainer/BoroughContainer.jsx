import HorizontalBar from "../HorizontalBar/HorizontalBar";
import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MultiLinePlotVertical from "../MultiLinePlot/MultiLinePlotVertical";
import "./BoroughContainer.css"

export default function BoroughContainer({csvFilterBySeverity, severityFilter, boroHover, chosenMonth, chosenYear, setBoroHover}) {
  const heightDecimal = 0.7;
  
  return (
    <div className='borough-data grid-item'>
      <h2> Cycling Accidents Across London Boroughs</h2>
      <div className="flex-container">
        <HorizontalBar 
          heightDecimal={heightDecimal}
          severityFilter={severityFilter}
          csvData={csvFilterBySeverity}
          boroHover={boroHover} 
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'}
        />
        <MultiLinePlotVertical
          className="multi-line boroughs vertical"
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
      <MultiLinePlot
          className="multi-line boroughs horizontal"
          heightDecimal={heightDecimal}
          csvData={csvFilterBySeverity} 
          timeUnit={chosenYear === 'All Years'? 'year': chosenMonth === 'All Months'? 'month': 'day'} 
          severityFilter={severityFilter}
          chosenMonth={chosenMonth} 
          chosenYear={chosenYear}
          boroHover={boroHover}
          setBoroHover={setBoroHover}
        />
    </div>
  )
}