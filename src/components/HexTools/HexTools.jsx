import * as d3 from 'd3';
import './HexTools.css'


export default function HexTools({ hexRadius, setHexRadius, setColorScaleType, mapSvgRef }) {
    const colorRadioChoices = ['Linear', 'Logarithmic'];

    function handleRadiusChange(e) {
        setHexRadius(e.target.value)
        setTimeout(() => {
            d3.select(mapSvgRef.current).select('#map-outline').raise();
          }, 1);
    }


    function handleScaleChange(e) {
        setColorScaleType(e.target.value)
    }

    return (
    
        <div className="hexTools">
           <div className="radiusSlider">
            <h4>Hex size</h4>
            <input type="range" min="1" max="8" value={hexRadius} step={0.5}
                onChange={handleRadiusChange}></input> 
           </div>
           <div className='colorScaleRadio'>
            <h4> Colour scale type</h4>
            <RadioButtons handleChange={handleScaleChange} colorRadioChoices={colorRadioChoices}></RadioButtons>
           </div>
        </div>
    )

}


function RadioButtons( { colorRadioChoices, handleChange }) {
  return (
    <div className='radio-buttons'>
      {colorRadioChoices.map(d => (
        <div className='radio-button' key={d}>
          <input 
            type="radio" 
            id={d} 
            name="colorScale" 
            value={d} 
            defaultChecked={d==='Linear'} 
            onChange={handleChange}
          >
          </input>
          <label htmlFor={d}>{d}</label>
        </div>
      ))}
    </div>
  )
}

