import React, { useState, useEffect, useMemo, useRef } from 'react';
import { hexbin } from "d3-hexbin";
import * as d3 from 'd3'; 
import * as L from 'leaflet';

import './MapLeaflet.css'


export default function MapLeaflet({ geoJsonData, csvData, setBoroHover }) {  
  const [colorScaleType, setColorScaleType] = useState('Linear');
  const mapRef = useRef();
  const svgRef = useRef();
  




  useEffect(() => {
    const zoomInitial = 10;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      zoomSnap: 0.1
  }).setView([51.505, -0.09], zoomInitial);

    // Add a TileLayer for the base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.svg({clickable:true}).addTo(map);


    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select('svg').attr("pointer-events", "auto");
    const g = svg.append('g')//.attr('class', 'leaflet-zoom-hide');
    
    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    
    const projection = d3.geoTransform({point: projectPoint});

    // creates geopath from projected points (SVG)
    const pathCreator = d3.geoPath().projection(projection);

    const hexRadius = 5;

    const areaFills = g.append('g')
      .attr('class', 'fill')
    .selectAll('path')
    .data(geoJsonData.features)
    .join('path')
    .attr('fill-opacity', 0.1)
    .attr('stroke', 'black')
    .style("z-index", 1000)
    .attr('name', d => d.properties.name)
    .attr('stroke-width', 0)


    const areaOutlines = g.append('g')
      .attr('class', 'outlines')
    .selectAll('path')
    .data(geoJsonData.features)
    .join('path')
    .attr('fill-opacity', 0.0)
    .attr('stroke', 'white')
    .style("z-index", 3000)
    .attr('name', d => d.properties.name)
    .attr('stroke-width', 1)
    .on("mouseover", function(){
      d3.select(this).raise()
        .style('stroke', 'red');

      const boroName = d3.select(this).attr('name');
      setBoroHover(boroName);
    })
    .on("mouseleave", function(){
      d3.select(this)
      .style('stroke', null);
      setBoroHover('All Boroughs')
    })


  // Function to place svg based on zoom
  const onZoom = () => {
    areaFills.attr('d', pathCreator);
    areaOutlines.attr('d', pathCreator);
    
    // remove existing hexegons
    svg.selectAll('.hexagons').remove()

    const zoom = map.getZoom();
    console.log(zoom)
    const fixedMapRadius = hexRadius / 2**zoomInitial; 
    const bins = hexbin()
      .radius(fixedMapRadius * 2**zoom)
      .x(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).x)
      .y(d => map.latLngToLayerPoint(new L.LatLng(+d.latitude, +d.longitude)).y);
    

    const domainExtent = d3.extent(bins(csvData), d => d.length)
      
    // hex color scales
    const logScale = d3.scaleLog()
      .domain(domainExtent);

    const linearScale = d3.scaleLinear()
      .domain(domainExtent);

    const colorScale = d3.scaleSequential(d => d3.interpolateViridis(
      colorScaleType === 'Linear'? linearScale(d): logScale(d)
    ));
    g.append("g")
        .attr('class', 'hexagons')
        // .attr("class", "hexagon")//.raise()
      .selectAll("path")
      .data(bins(csvData))
      .join("path")
        .attr('class', 'hex')
        .attr('size', d => d.length)
        .attr("d", d => `M${d.x},${d.y}${bins.hexagon()}`)
        .style('fill', d => colorScale(d.length))
        .style('fill-opacity', 0.5);


    g.select('.outlines').raise()
  }

  onZoom();

  // reset whenever map is moved
  map.on('zoomend', onZoom)



    return () => map.remove()
  }, [csvData]);

  return (
    <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
  );
}

