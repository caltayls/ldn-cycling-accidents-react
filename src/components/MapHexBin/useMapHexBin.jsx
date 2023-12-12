import { useEffect, useState } from "react";
import * as d3 from 'd3';
import { hexbin } from "d3-hexbin";
import * as L from 'leaflet';


export default function useMapHexBin({csvData, map, hexCoordsRef, hexRadius, colorScaleType, setHexDomainExtent}) {
  

  
  useEffect(() => {
    const g = d3.select('#overlay-g');
    if (map) {     
      const zoomInitial = 10;
      const zoom = map.getZoom();
      const fixedMapRadius = hexRadius / 2 ** zoomInitial;
      const radius = fixedMapRadius * 2 ** zoom;


      const bins = hexbin()
      .radius(radius)
      .x(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).x)
      .y(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).y);

      const hexCenters = bins(csvData).map(d => ({x: d.x, y: d.y}));
    
      const hexCoords =  hexCenters && hexCenters.map(d => {
        const { x, y } = d;
        const layerPoint = new L.Point(x, y);
        // console.log(layerPoint) precise
        const latLng = map.layerPointToLatLng(layerPoint);
        return latLng;
      });
    
  
      hexCoordsRef.current = hexCoords;


      const domainExtent = d3.extent(bins(csvData), d => d.length);
      setHexDomainExtent(domainExtent);
      // hex color scales



      const quantColorScale = d3.scaleQuantize()
        .domain(domainExtent)
        .range(['rgb(255, 240, 217)', 'rgb(179, 233, 180)', 'rgb(65, 182, 196)', 'rgb(34, 94, 168)', 'rgb(8, 29, 88)']);
    
      g.append("g")
          .attr('class', 'hexagons')
          .style('opacity', 1)  
          // .attr("class", "hexagon")//.raise()
        .selectAll("path")
        .data(bins(csvData))
        .join("path")
          .attr('class', 'hex')
          .attr('size', d => d.length)
          // .attr("d", d => `M${d.x},${d.y}${bins.hexagon()}`)
          .style('fill', d => quantColorScale(d.length))

    }
   
    return () => g.selectAll('.hexagons').remove()

  }, [map, csvData, hexRadius, colorScaleType])
}