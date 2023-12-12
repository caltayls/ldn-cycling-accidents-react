import * as d3 from 'd3';
import './HexTools.css'
import { useEffect, useState } from 'react';


export default function HexTools({map, hexRadius, setHexRadius, setColorScaleType, style}) {
    let [hexOpacity, setHexOpacity] = useState(1);

    function handleRadiusChange(e) {
        setHexRadius(e.target.value)
        setTimeout(() => {
            d3.select('#leaflet-container .outline').raise(); // pushes borough outlines to top
          }, 1);
    }

    function handleHexagonOpacity(e) {
      setHexOpacity(e.target.value);
      console.log(e.target.value)
      d3.select('.hexagons').style('fill-opacity', e.target.value);
    }



    return (
    
        <div className="hexTools" style={style}>
   
           <div className="radiusSlider">
            <h4>Hexagon size</h4>
            <input type="range" min="1" max="8" value={hexRadius} step={0.5}
                onChange={handleRadiusChange}></input> 
           </div>

           <div className="opacitySlider">
            <h4>Hexagon opacity</h4>
            <input type="range" min="0" max="1" value={hexOpacity} step={0.1}
                onChange={handleHexagonOpacity}></input> 
           </div>
    
        </div>
    )

}

