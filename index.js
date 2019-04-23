import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {defaults as defaultControls} from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import {createStringXY} from 'ol/coordinate.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Overlay from 'ol/Overlay.js'
import {transform} from 'ol/proj';

var mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  // className: 'custom-mouse-position',
  // target: document.getElementById('mouse-position'),
  // undefinedHTML: '&nbsp;'
});


var map = new Map({
  controls: defaultControls().extend([mousePositionControl]),
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    // projection: 'EPSG:4326',
    center: [2023318, 6835059],
    zoom: 4,
    minZoom: 3
  })
});

let map1 = document.getElementById('map')
let posDiv = document.getElementById('mouseMovePosition')
let marker = document.getElementById('marker')

map.addEventListener('click',(e)=>{
  var pos = e.coordinate
  console.log(pos)
  var lonLat = transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
  var a = new Overlay({
    position: pos,
    element: marker
  });

//clears all overlays from map
  map.getOverlays().clear()

  marker.innerHTML = ""
  marker.style.display = "block";
  
  map.addOverlay(a);
  fetch(`http://api.geonames.org/countryCodeJSON?lat=${lonLat[1]}&lng=${lonLat[0]}&username=apitester321`)
  .then((response)=>{
    return response.json();
  })
  .then(function(res){
    if(Object.keys(res).length<2){
      marker.innerHTML = '<h3>Water</h3><p>No articles found for Atlantis yet...</p>'
      return 0;
    }
    fetch(`https://newsapi.org/v2/top-headlines?country=${res.countryCode}&apiKey=21c0f9bd0baa4aa68fedbbdbd97194f4`)
    .then(function(response) {
      return response.json()
    })
    .then((response)=>{
        if(!response.articles.length){
          marker.innerHTML = `<h3>${res.countryName}</h3><p>No articles found for this country</p>`
          return 0;
        }
      marker.innerHTML = `<h3>${res.countryName}</h3>${response.articles[0].title}<img src="${response.articles[0].urlToImage}">`
    },(response)=>{console.log(`${response} this is rejected`)});

  });

})

map1.addEventListener('mousemove', (e)=>{
  posDiv.innerHTML = `Browser Cursor Position X: ${e.clientX} and Position Y: ${e.clientY}`
})
