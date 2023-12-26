import HorizontalBar from "../HorizontalBar/HorizontalBar";
import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import MultiLinePlotVertical from "../MultiLinePlot/MultiLinePlotVertical";
import "./BoroughContainer.css"

export default function BoroughContainer({csvFilterBySeverity, severityFilter, boroughFilter, monthFilter, yearFilter, setBoroughFilter}) {
  const heightDecimal = 0.7;
  
  return (
    <div className='borough-data grid-item'>
      <div className="title">
        <h2> Cycling Accidents Across London Boroughs</h2>
      </div>
      <div className="flex-container">
        <HorizontalBar 
          heightDecimal={heightDecimal}
          severityFilter={severityFilter}
          csvData={csvFilterBySeverity}
          boroughFilter={boroughFilter} 
          monthFilter={monthFilter} 
          yearFilter={yearFilter} 
          timeUnit={yearFilter === 'All Years'? 'year': monthFilter === 'All Months'? 'month': 'day'}
        />
        <MultiLinePlotVertical
          className="multi-line boroughs vertical"
          heightDecimal={heightDecimal}
          csvData={csvFilterBySeverity} 
          timeUnit={yearFilter.length === 0? 'year': monthFilter.length === 0? 'month': 'day'} 
          severityFilter={severityFilter}
          monthFilter={monthFilter} 
          yearFilter={yearFilter}
          boroughFilter={boroughFilter}
          setBoroughFilter={setBoroughFilter}
        ></MultiLinePlotVertical>
      </div>
      <MultiLinePlot
          className="multi-line boroughs horizontal"
          heightDecimal={heightDecimal}
          csvData={csvFilterBySeverity} 
          timeUnit={yearFilter.length === 0? 'year': monthFilter.length === 0? 'month': 'day'}
          severityFilter={severityFilter}
          monthFilter={monthFilter} 
          yearFilter={yearFilter}
          boroughFilter={boroughFilter}
          setBoroughFilter={setBoroughFilter}
        />
    </div>
  )
}