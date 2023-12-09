import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

import './HexLegend.css'

export default function HexLegend({ domainExtent, style }) {

    const margin = {
      top: 10,
      bottom: 10,
      left: 10,
      right: 20
    }
    const width = 300 - margin.left - margin.right;
    const height = 50 - margin.top - margin.bottom;

    const legendRef = useRef(null);
  

    
    const legendScale = useMemo(() => {
      return d3.scaleLinear()
      .domain([0, domainExtent[1]])
      .range([0, width]).nice();

    }, [domainExtent]); 

    
    const legendRange = useMemo(() => (d3.range(0.001, legendScale.domain()[1], legendScale.domain()[1]/15)), [domainExtent]); 

  
    const legendAxis = d3.axisBottom(legendScale);

    const colorScale = d3.scaleSequential(d => d3.interpolateViridis(d3.scaleLinear()
    .domain(domainExtent)(d)));
    
    useEffect (() => {

        const svg = d3.select(legendRef.current)
                .attr('height', height + margin.top + margin.bottom)
                .attr('width', width + margin.left + margin.right)
            .append('g');
    
      const axis = svg
        .append('g')
        .call(legendAxis)
          .attr('transform', `translate(${margin.left+1}, ${20 +margin.bottom})`)

        axis.selectAll('text').attr('font-weight', 'bold')
        
    
      svg
        .selectAll('rect')
        .data(legendRange)
        .join('rect')
          .attr('x', d => legendScale(d))
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', d => colorScale(d))
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        return () => d3.select(legendRef.current).selectAll('*').remove()
    }, [domainExtent])

    
    return (
        <div className="map-legend" style={style}>
            <svg id="legend" ref={legendRef}></svg>
        </div>
    )
}