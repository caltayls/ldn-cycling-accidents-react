import { useEffect } from "react";
import * as d3 from 'd3';

export default function MapPolygons({ geoJsonData, geoGenerator, mapSvgRef,  fill, stroke, id, setBoroHover }) {


function handleMouseOver() {
    let name = d3.select(this).attr('name');
    d3.select(this).raise()
      .style('stroke', 'red');

    setBoroHover(name);
  }

  function handleMouseLeave() {
    let name = d3.select(this).attr('name');
    d3.select(this)
      .style('stroke', null);


    setBoroHover('All Boroughs');
    
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
    
        return () => {
            d3.select(mapSvgRef.current).selectAll('*').remove();
            };
        }, []);
            
}


