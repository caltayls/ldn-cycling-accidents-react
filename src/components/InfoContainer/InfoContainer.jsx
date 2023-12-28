import './InfoContainer.css';
import * as d3 from 'd3';

export default function InfoContainer({ boroughFilter, yearFilter, monthFilter }) {
    return (
      <div className="filter-cont">
        <div className='filter-boro'>
          <h1 className="filter-header">{boroughFilter}</h1>
        </div>
        
        <div className="filter-details">
          <div className='filter-item years'>
              {yearFilter.map((d, i) => (
                <span key={i} className="filter-value">
                  {d}
                </span>
              ))}
          </div>
          <div className="filter-item months">
              {monthFilter.map((monthInd, index) => (
                <span key={index} className="filter-value">
                  {new Date(2000, monthInd).toLocaleString('default', { month: 'short' })}
                </span>
              ))}
          </div>
        </div>
        <div onClick={() => {
d3.selectAll('.circ')
.each(function() {
  d3.select(this)
    .transition()
    .attr('cx', 4 + Math.random() * 52);
});

        }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <line x1="0" y1="40" x2="60" y2="40" stroke="#3498db" stroke-width="4" />
  <circle className='circ' cx="10" cy="40" r="6" fill="#3498db" />

  <line x1="0" y1="20" x2="60" y2="20" stroke="#e74c3c" stroke-width="4" />
  <circle className='circ' cx="40" cy="20" r="6" fill="#e74c3c" />

  <line x1="0" y1="60" x2="60" y2="60" stroke="#27ae60" stroke-width="4" />
  <circle className='circ' cx="60" cy="60" r="6" fill="#27ae60" />
</svg>

        </div>
      </div>
      
    );
  }