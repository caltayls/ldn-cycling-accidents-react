import { useEffect } from "react";
import * as L from 'leaflet';
import * as d3 from 'd3';

export default function useLeafletMap({ mapRef, setMap, zoomInitial }) {


  

  useEffect(() => {

    const map = L.map(mapRef.current, {
      zoomSnap: 0.1,
      // crs: L.CRS.Simple,
    }).setView([51.505, -0.09], zoomInitial);

    // Add a TileLayer for the base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.svg({clickable:true}).addTo(map);

    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select('svg').attr("pointer-events", "auto");
    const g = svg.append('g')
      .attr('id', 'overlay-g')
    //.attr('class', 'leaflet-zoom-hide');


    return () => map.remove()
  }, [])
}