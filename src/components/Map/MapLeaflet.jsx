import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { hexbin } from "d3-hexbin";
import * as d3 from 'd3'; 
import * as L from 'leaflet';
import useMapPolygons from '../MapPolygons/useMapPolygons';
import useLeafletMap from '../LeafletMap/useLeafletMap';
import useMapHexBin from '../MapHexBin/useMapHexBin';
import HexTools from '../HexTools/HexTools';
import { filterCSV } from '../utils/filterCSV';

import './MapLeaflet.css'
import HexLegend from '../HexLegend/HexLegend';
import { WindowContext } from '../WindowContextProvider/WindowContextProvider';

export default function MapLeaflet({ boroughHighlightedRef, geoJsonData, csvData, boroughFilter, setBoroughFilter, monthFilter, yearFilter, severityFilter, isBoroughFilterClicked, setIsBoroughFilterClicked }) {
  const [ map, setMap ] = useState('');

  const { clientWidth } = useContext(WindowContext);
  
  // adjust hex state 
  const [hexRadius, setHexRadius] = useState(5);
  const [hexOpacity, setHexOpacity] = useState(1);

  const [colorScaleType, setColorScaleType] = useState('Linear');
  const [hexDomainExtent, setHexDomainExtent] = useState([]);

  const hexCoordsRef = useRef(''); // ref used to prevent rerendering
  const csvFiltered = useMemo(() => filterCSV(csvData, yearFilter, monthFilter), [severityFilter, monthFilter, yearFilter]);
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
    setBoroughFilter: setBoroughFilter,
    fill: '#9ea39b',
    fillOpacity: 0.1,
    isBoroughFilterClicked: isBoroughFilterClicked, 
    setIsBoroughFilterClicked: setIsBoroughFilterClicked 
  });

   useMapHexBin({
    csvData: csvFiltered,
    map: map,
    zoomInitial: zoomInitial,
    hexCoordsRef: hexCoordsRef,
    hexRadius: hexRadius,
    colorScaleType: colorScaleType,
    hexOpacity: hexOpacity,
    setHexDomainExtent: setHexDomainExtent,

  });

  useMapPolygons({
    map: map,
    className: 'outline', 
    geoJsonData: geoJsonData,
    boroughFilter: boroughFilter,
    setBoroughFilter: setBoroughFilter,
    fill: 'red',
    fillOpacity: 0.0,
    stroke: '#717171',
    strokeWidth: 1,
    isBoroughFilterClicked: isBoroughFilterClicked, 
    setIsBoroughFilterClicked: setIsBoroughFilterClicked,
    boroughHighlightedRef: boroughHighlightedRef
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
      const fixedMapRadius = hexRadius / 2 ** zoomInitial;
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
  }, [map, csvFiltered, hexRadius, colorScaleType]);

  let hexToolsPosition = clientWidth < 961? {left: 3}: {right: 3};
 
  return (
    <>
    <HexTools hexOpacity={hexOpacity} setHexOpacity={setHexOpacity} setHexRadius={setHexRadius} setColorScaleType={setColorScaleType} style={{ position: 'absolute', ...hexToolsPosition,  zIndex:2}}></HexTools> 
    <HexLegend domainExtent={hexDomainExtent} style={{ position: 'absolute', left: 3, bottom: 8,  zIndex:3}}></HexLegend>
    <div id='map-container' ref={mapRef} style={{height: '100%', width:'100%', zIndex:1, margin:0}}></div>
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