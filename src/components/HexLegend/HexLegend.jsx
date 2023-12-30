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
  

    const quantColorScale = d3.scaleQuantize()
      .domain(domainExtent)
      .range(['rgb(205, 229, 148)', 'rgb(128, 198, 163)', 'rgb(65, 182, 196)', 'rgb(34, 94, 168)', 'rgb(8, 29, 88)']);

    const legendLabels = [domainExtent[0], ...quantColorScale.thresholds()];
    const x = d3.scaleLinear(d3.extent(domainExtent), [0, width]);
    const legendAxis = d3.axisBottom(x);



    useEffect (() => {

      const svg = d3.select(legendRef.current)
          .attr('height', height + margin.top + margin.bottom)
          .attr('width', width + margin.left + margin.right)
          .append('g');
    
      const axis = svg
        .append('g')
        .call(legendAxis)
          .attr('transform', `translate(${margin.left+1}, ${20 +margin.bottom})`)

      axis.selectAll('text').attr('font-weight', '400');

      axis.select('.domain').attr('stroke-width', 0.8)
        
    
      svg
        .selectAll('rect')
        .data(legendLabels)
        .join('rect')
          .attr('x', d => x(d))
          .attr('width', 55)
          .attr('height', 20)
          .attr('fill', d => quantColorScale(d))
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        return () => d3.select(legendRef.current).selectAll('*').remove()
    }, [domainExtent])

    
    return (
        <div className="map-legend" style={style}>
            <svg id="legend" ref={legendRef}></svg>
        </div>
    )
}