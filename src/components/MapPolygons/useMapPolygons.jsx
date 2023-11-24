import { useEffect } from "react";
import * as d3 from 'd3';
import * as L from 'leaflet';

export default function useMapPolygons({ className, fill, stroke, strokeWidth, fillOpacity, geoJsonData, setBoroHover, map }) {
  let isMapMoving = false;
  let highlightedBoro = '';
  useEffect(() => {
    if (map) {
      const g = d3.select('#overlay-g');
      const areaFills = g.append('g')
        .attr('class', `polygons ${className}`)
        .selectAll('path')
          .data(geoJsonData.features)
          .join('path')
          .style('fill', d => fill)
          .style('fill-opacity', fillOpacity)
          .style('stroke', stroke)
          .style("z-index", 1000)
          .style('stroke-width', strokeWidth)
          .attr('name', d => d.properties.name)
          .attr('bounds', d => {
            // for panning to borough
            const poly = L.polygon(d.geometry.coordinates);
            return JSON.stringify(poly.getBounds())
          });
      if (className === 'outline') {
        areaFills.on('mouseup', function() {
          if (isMapMoving) {
            isMapMoving=false;
            return
          }
          highlightedBoro && d3.select(`.${className} [name="${highlightedBoro}"]`)
            .style('stroke', stroke)
            .style('stroke-width', strokeWidth);

          d3.select(this).raise()
            .style('stroke', 'red')
            .style('stroke-width', strokeWidth*2);
          const boroName = d3.select(this).attr('name');
          setBoroHover(boroName);
          highlightedBoro = boroName;
        })
  
        map.on('dragstart', () => isMapMoving=true)
      }  
    }
    return () => d3.select(`#overlay-g .${className}`).remove();
  }, [map])
}


          // if (!map.dragging.moving()){
            // console.log(map.dragging.moving())
            // const bounds = JSON.parse(d3.select(this).attr('bounds'))
            // const southwest = L.latLng(bounds._southWest.lng, bounds._southWest.lat);
            // const northeast = L.latLng(bounds._northEast.lng, bounds._northEast.lat);
            // const boundsObj = L.latLngBounds(southwest, northeast);
            // map.fitBounds(boundsObj);