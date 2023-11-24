import { useEffect, useRef } from "react";
import * as d3 from 'd3';
import * as L from 'leaflet';

export default function useMapPolygons({ className, fill, stroke, strokeWidth, fillOpacity, geoJsonData, boroHover, setBoroHover, map, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
  const boroughHighlightedRef = useRef();
  let isMapMoving = false;
  // let highlightedBoro = '';
  
  useEffect(() => {
    if (map) {
      const g = d3.select('#overlay-g');
      const polyPaths = g.append('g')
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
        polyPaths.on('mouseup', function() {
          
          // prevent click when dragging map
          if (isMapMoving) {
            isMapMoving=false;
            return
          }
          d3.select(`.${className} [name="${boroughHighlightedRef.current}"]`)
            .style('stroke', stroke)
            .style('stroke-width', strokeWidth);

          d3.select(this).raise()
            .style('stroke', 'red')
            .style('stroke-width', strokeWidth*2);
          const boroName = d3.select(this).attr('name');
          setBoroHover(boroName);
          boroughHighlightedRef.current = boroName;
        })
  
        map.on('dragstart', () => isMapMoving=true)
      }  
    }
    return () => d3.select(`#overlay-g .${className}`).remove();
  }, [map])

useEffect (() => {
  if (map && isBoroughFilterClicked && className === 'outline') {
    d3.select(`.${className} [name="${boroughHighlightedRef.current}"]`)
      .style('stroke', stroke)
      .style('stroke-width', strokeWidth);
    const elementHighlighted = d3.select(`.${className} [name="${boroHover}"]`);
    if (elementHighlighted._groups[0][0] !== null) {
      elementHighlighted.raise()
        .style('stroke', 'red')
        .style('stroke-width', strokeWidth*2);

      const bounds = JSON.parse(elementHighlighted.attr('bounds'));
      const southwest = L.latLng(bounds._southWest.lng, bounds._southWest.lat);
      const northeast = L.latLng(bounds._northEast.lng, bounds._northEast.lat);
      const boundsObj = L.latLngBounds(southwest, northeast);
      map.fitBounds(boundsObj);
    } else {
      const g = d3.select(`#overlay-g`).node();
      const gBounds = g.getBBox();
      const topLeft = map.layerPointToLatLng(L.point(gBounds.x, gBounds.y));
      const bottomRight = map.layerPointToLatLng(L.point(gBounds.x + gBounds.width, gBounds.y + gBounds.height));
      map.fitBounds(L.latLngBounds(topLeft, bottomRight));
    }
    
  }
  setIsBoroughFilterClicked(false);
  boroughHighlightedRef.current = boroHover;

}, [boroHover])



}

