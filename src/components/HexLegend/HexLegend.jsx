import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

export default function HexLegend({ domainExtent, height, colorScale }) {

    const legendRef = useRef(null);
    const legendHeight = height * 7/10;
    const legendYTranslate = legendHeight * 2/10;

    const legendRange = useMemo(() => (d3.range(0.001, +domainExtent[1], +domainExtent[1]/51)), [domainExtent]); 
    const legendScale = useMemo(() => {
      return d3.scaleLinear()
      .domain([0, domainExtent[1]])
      .range([0, legendHeight]);

    }, [domainExtent]); 
  
    const legendAxis = d3.axisRight(legendScale);
    
    useEffect (() => {

        const svg = d3.select(legendRef.current)
                .attr('height', height)
                .attr('width', 75)
            .append('g');
    
      svg
        .append('g')
        .call(legendAxis)
          .attr('transform', `translate(30, ${legendYTranslate})`);
    
      svg
        .selectAll('rect')
        .data(legendRange)
        .join('rect')
          .attr('y', d => legendScale(d))
          .attr('width', 20)
          .attr('height', 10)
          .attr('fill', d => colorScale(d))
          .attr('transform', `translate(10, ${legendYTranslate})`);

        return () => d3.select(legendRef.current).selectAll('*').remove()
    }, [domainExtent])

    
    return (
        <div className="map-legend">
            <svg id="legend" ref={legendRef}></svg>
        </div>
    )
}