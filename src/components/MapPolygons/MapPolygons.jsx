import { useEffect } from "react";
import * as d3 from 'd3';

export default function MapPolygons({ geoJsonData, geoGenerator, mapSvgRef,  fill, stroke, id, setBoroughFilter, mapDivRef }) {


function handleMouseOver() {
    let name = d3.select(this).attr('name');
    d3.select(this).raise()
      .style('stroke', 'red');

    setBoroughFilter(name);
    d3.select(mapDivRef.current).select(`.multi-line-plot path[name="${name}"]`).raise()
      .style('stroke', 'red')
      .style('stroke-width', 3)
      .style("mix-blend-mode", "normal");
  }

  function handleMouseLeave() {
    let name = d3.select(this).attr('name');
    d3.select(this)
      .style('stroke', null);

    d3.select(mapDivRef.current).select(`.multi-line-plot path[name="${name}"]`)
      .style('stroke', null)
      .style('stroke-width', null)
      .style("mix-blend-mode", null);


    setBoroughFilter('All Boroughs');
    
  }
    
    useEffect(() => {            
        d3.select(mapSvgRef.current)
            .append('g')
            .attr('id', id)
            .selectAll('path')
            .data(geoJsonData.features)
            .join('path')
                .attr('name', d => d.properties.name)
                .attr('d', geoGenerator)
                .attr('stroke', stroke)
                .attr('fill', fill)
                .on('mouseover', handleMouseOver)
                .on('mouseleave', handleMouseLeave);
    
        return () => d3.select(mapSvgRef.current).selectAll('*').remove();
            
        }, []);
            
}


