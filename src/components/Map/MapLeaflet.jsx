import React, { useState, useEffect, useMemo, useRef } from 'react';
import { hexbin } from "d3-hexbin";
import * as d3 from 'd3'; 
import * as L from 'leaflet';
import useMapPolygons from '../MapPolygons/useMapPolygons';
import useLeafletMap from '../LeafletMap/useLeafletMap';
import useMapHexBin from '../MapHexBin/useMapHexBin';
import { filterCSV } from '../utils/filterCSV';

import './MapLeaflet.css'

export default function MapLeaflet({ geoJsonData, csvData, setBoroHover, chosenMonth, chosenYear, severityFilter }) {
  const [ map, setMap ] = useState('');
  const hexCoordsRef = useRef(''); // ref used to prevent rerendering
  
  const csvFiltered = useMemo(() => filterCSV(csvData, chosenYear, chosenMonth), [severityFilter, chosenMonth, chosenYear]);
  const mapRef = useRef(null);
  const zoomInitial = 10;
 
  // used to give map object state
  L.Map.addInitHook(function() {setMap(this)});

  useLeafletMap({
    mapRef: mapRef,
    zoomInitial: zoomInitial,
    setMap: setMap,
  });

  useMapPolygons({
    map: map,
    className: 'fill', 
    geoJsonData: geoJsonData,
    setBoroHover: setBoroHover,
    fill: 'rgb(72, 20, 103)',
    fillOpacity: 0.5,
    
  });

   useMapHexBin({
    csvData: csvFiltered,
    map: map,
    zoomInitial: zoomInitial,
    hexCoordsRef: hexCoordsRef,
  });

  useMapPolygons({
    map: map,
    className: 'outline', 
    geoJsonData: geoJsonData,
    setBoroHover: setBoroHover,
    fill: 'red',
    fillOpacity: 0.0,
    stroke: 'white',
    strokeWidth: 1
  });

  // for drawing geojson data
  function projectPoint(x, y) {
    const point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
  const projection = d3.geoTransform({point: projectPoint});
  const pathCreator = d3.geoPath().projection(projection);

  // path drawer and zoom handler
  useEffect(() => {
    if (map && hexCoordsRef.current) {
      const g = d3.select('#overlay-g');
      const fixedMapRadius = 5 / 2 ** zoomInitial;
      const onZoom = () => {
        
        g.selectAll('.polygons path').attr('d', pathCreator);
        const zoom = map.getZoom();

        const radiusNew = fixedMapRadius * 2 ** zoom;
        g.selectAll('.hexagons path').attr('d', (d, i) => {
          const latLng = hexCoordsRef.current[i];
          // console.log(latLng) precise
          const point = map.latLngToLayerPoint(latLng); // <-- not precise -- rounds to integer!
          // console.log(point)
          return generateHexagonPath(point.x, point.y, radiusNew+0.3);
        });

        g.select('.outline').raise();
      };

      onZoom();

      // Use 'zoomend' event directly
      map.on('zoomend', onZoom);

      return () => {
        map.off('zoomend', onZoom);
        g.selectAll('.hexagons path').remove()
      };
    }
  }, [map, csvFiltered]);
 
  return (
    <>
    <div id='map-container' ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
    </>
  );
}

 
function generateHexagonPath(centerX, centerY, radius) {
  // Calculate the coordinates of the hexagon vertices relative to the center
  const x0 = centerX;
  const y0 = centerY - radius;
  const x1 = centerX + radius * Math.sqrt(3) / 2;
  const y1 = centerY - radius / 2;
  const x2 = centerX + radius * Math.sqrt(3) / 2;
  const y2 = centerY + radius / 2;
  const x3 = centerX;
  const y3 = centerY + radius;
  const x4 = centerX - radius * Math.sqrt(3) / 2;
  const y4 = centerY + radius / 2;
  const x5 = centerX - radius * Math.sqrt(3) / 2;
  const y5 = centerY - radius / 2;

  // Build the SVG path string
  const path = `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} L ${x5} ${y5} Z`;
  
  return path;
}