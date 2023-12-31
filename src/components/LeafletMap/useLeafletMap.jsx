import { useContext, useEffect, useRef } from "react";
import * as L from 'leaflet';
import * as d3 from 'd3';
import { WindowContext } from "../WindowContextProvider/WindowContextProvider";

export default function useLeafletMap({ mapRef, setMap, zoomInitial }) {
 const { clientWidth } = useContext(WindowContext);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      zoomSnap: 1,
      zoomControl: clientWidth < 961? false: true,
      attributionControl: false,
      // crs: L.CRS.Simple,
    }).setView([51.505, -0.09], zoomInitial);

    // labels on top of hexagons
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    // Add a TileLayer for the base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
     {
        attribution: '',
        detectRetina: true,
    }).addTo(map);

    // add labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels',
        // detectRetina: true,
    }).addTo(map);

    L.svg({clickable:true}).addTo(map);

    const mapMaxBounds = L.latLngBounds(
      L.latLng(51.1, -1), // Southwest corner
      L.latLng(52, 1)   // Northeast corner
    );

    const greaterLondonBounds = L.latLngBounds(
      L.latLng(51.2673087006417, -0.5358825347463732), // Southwest corner
      L.latLng(51.736619676980894, 0.35812985281759285)   // Northeast corner
    );

    // map.fitBounds(greaterLondonBounds);
    map.setMaxBounds(mapMaxBounds);
  

    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select('svg').attr("pointer-events", "auto");
    const g = svg.append('g')
      .attr('id', 'overlay-g')
    .attr('class', 'leaflet-zoom-hide');

    return () => map.remove()
  }, [clientWidth])

}
     

