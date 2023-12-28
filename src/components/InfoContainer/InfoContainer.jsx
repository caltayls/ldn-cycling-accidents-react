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
        <div onMouseEnter={() => {
  d3.selectAll('.circ')
  .each(function() {
    d3.select(this)
      .transition()
      .attr('cx', 12 + Math.random() * 46);
  })

        }}>

     
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M10, 20 h60" stroke="#3498db" stroke-width="4" strokeLinecap='round'/>
          <circle className='circ' cx="10" cy="40" r="6" fill="#3498db" />

          <path d="M10, 40 h60" stroke="#3498db" stroke-width="4" strokeLinecap='round'/>
          <circle className='circ' cx="40" cy="20" r="6" fill="#3498db" />

          <path d="M10, 60 h60" stroke="#3498db" stroke-width="4" strokeLinecap='round'/>
          <circle className='circ' cx="60" cy="60" r="6" fill="#3498db" />
        </svg>
        </div>
        <div className='plot-svg' onMouseEnter={() => {
          d3.select('.button-line').transition().attr('d', `M5 55 L24 ${6 + Math.random() * 48} L43 ${6 + Math.random() * 48} L62 ${6 + Math.random() * 48}`);
        }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <path d="M5, 5 v50 h60" stroke='#424041' strokeWidth="3" fill="transparent" />
          <path className='button-line' d="M5 55 L24 30 L43 40 L62 20" stroke='#424041' strokeWidth="2" fill="transparent" strokeLinecap='round' strokeLinejoin='round'/>
        </svg>
        </div>
      </div>
      
    );
  }