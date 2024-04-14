import { useEffect, useState } from "react";
import * as d3 from 'd3';
import { hexbin } from "d3-hexbin";
import * as L from 'leaflet';


export default function useMapHexBin({csvData, map, hexCoordsRef, hexRadius, hexOpacity, colorScaleType, setHexDomainExtent, zoomInitial, boroughFilter}) {
  

  
  useEffect(() => {
    const g = d3.select('#overlay-g');
    if (map) {     
      const zoom = map.getZoom();
      const fixedMapRadius = hexRadius / 2 ** zoomInitial;
      const radius = fixedMapRadius * 2 ** zoom;


      const bins = hexbin()
      .radius(radius)
      .x(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).x)
      .y(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).y);

      const csvFilteredByBorough = boroughFilter === 'All Boroughs'? csvData: csvData.filter(d => d.borough === boroughFilter);
      console.log(csvFilteredByBorough)
      const hexCenters = bins(csvFilteredByBorough).map(d => ({x: d.x, y: d.y}));
    
      const hexCoords =  hexCenters && hexCenters.map(d => {
        const { x, y } = d;
        const layerPoint = new L.Point(x, y);
        // console.log(layerPoint) precise
        const latLng = map.layerPointToLatLng(layerPoint);
        return latLng;
      });
    
  
      hexCoordsRef.current = hexCoords;


      const domainExtent = d3.extent(bins(csvFilteredByBorough), d => d.length);
      console.log(domainExtent)
      setHexDomainExtent(domainExtent);
      // hex color scales



      const quantColorScale = d3.scaleQuantize()
        .domain(domainExtent)
        .range(['rgb(205, 229, 148)', 'rgb(128, 198, 163)', 'rgb(65, 182, 196)', 'rgb(34, 94, 168)', 'rgb(8, 29, 88)']);
    
      g.append("g")
          .attr('class', 'hexagons')
          .style('opacity', hexOpacity)  
          // .attr("class", "hexagon")//.raise()
        .selectAll("path")
        .data(bins(csvFilteredByBorough))
        .join("path")
          .attr('class', 'hex')
          .attr('size', d => d.length)
          // .attr("d", d => `M${d.x},${d.y}${bins.hexagon()}`)
          .style('fill', d => quantColorScale(d.length))


    }
   
    return () => g.selectAll('.hexagons').remove()

  }, [map, csvData, hexRadius, colorScaleType, boroughFilter])
}