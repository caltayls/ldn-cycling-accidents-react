import { useEffect, useRef } from "react";
import * as L from 'leaflet';
import * as d3 from 'd3';

export default function useLeafletMap({ mapRef, setMap, zoomInitial }) {


  useEffect(() => {

    const map = L.map(mapRef.current, {
      zoomSnap: 0.1,
      // crs: L.CRS.Simple,
    }).setView([51.505, -0.09], zoomInitial);

    // labels on top of hexagons
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    // Add a TileLayer for the base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
     {
        attribution: '©OpenStreetMap, ©CartoDB',
        detectRetina: true,
    }).addTo(map);

    // add labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels',
        // detectRetina: true,
    }).addTo(map);

    L.svg({clickable:true}).addTo(map);

    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select('svg').attr("pointer-events", "auto");
    const g = svg.append('g')
      .attr('id', 'overlay-g')
    .attr('class', 'leaflet-zoom-hide');


    return () => map.remove()
  }, [])


}
     

 


// function HexLegend({ domainExtent, height, colorScale }) {

//   const legendRef = useRef(null);
//   const legendHeight = height * 7/10;
//   const legendYTranslate = legendHeight * 2/10;

//   const legendRange = useMemo(() => (d3.range(0.001, +domainExtent[1], +domainExtent[1]/51)), [domainExtent]); 
//   const legendScale = useMemo(() => {
//     return d3.scaleLinear()
//     .domain([0, domainExtent[1]])
//     .range([0, legendHeight]);

//   }, [domainExtent]); 

//   const legendAxis = d3.axisRight(legendScale);
  
//   useEffect (() => {

//       const svg = d3.select(legendRef.current)
//               .attr('height', height)
//               .attr('width', 75)
//           .append('g');
  
//     svg
//       .append('g')
//       .call(legendAxis)
//         .attr('transform', `translate(30, ${legendYTranslate})`);
  
//     svg
//       .selectAll('rect')
//       .data(legendRange)
//       .join('rect')
//         .attr('y', d => legendScale(d))
//         .attr('width', 20)
//         .attr('height', 10)
//         .attr('fill', d => colorScale(d))
//         .attr('transform', `translate(10, ${legendYTranslate})`);

//       return () => d3.select(legendRef.current).selectAll('*').remove()
//   }, [domainExtent])

  
//   return (
//       <div className="map-legend">
//           <svg id="legend" ref={legendRef}></svg>
//       </div>
//   )
// }