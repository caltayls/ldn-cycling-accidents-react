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
        <div onClick={handleFilterClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <path d="M10, 20 h60" stroke="#3498db" strokeWidth="4" strokeLinecap='round'/>
            <circle className='circ' cx="10" cy="40" r="6" fill="#3498db" />

            <path d="M10, 40 h60" stroke="#3498db" strokeWidth="4" strokeLinecap='round'/>
            <circle className='circ' cx="40" cy="20" r="6" fill="#3498db" />

            <path d="M10, 60 h60" stroke="#3498db" strokeWidth="4" strokeLinecap='round'/>
            <circle className='circ' cx="60" cy="60" r="6" fill="#3498db" />
          </svg>
        </div>
      </div>
      
    );


    function handleFilterClick() {
      d3.selectAll('.circ').each(function() {
        d3.select(this)
          .transition()
          .attr('cx', 12 + Math.random() * 46);
      });
    }

  }