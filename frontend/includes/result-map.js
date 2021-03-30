// Init default map
var RESULT_MAP = null;
var RESULT_MAP_MARKERS = [];
var RESULT_CENTER_MARKER = null;

const SCORE_DESCRIPTIONS = {
    "score_0": "Excellent",
    "score_1": "Very Good",
    "score_2": "Good",
    "score_3": "Fair",
    "score_4": "Poor"
}

const SCORE_THRESHOLDS = [86.0, 80.0, 74.0, 68.0, 0.0];

function removeCenterMarker() {
    if (RESULT_CENTER_MARKER) {
        RESULT_CENTER_MARKER.remove();
    }
}

function addCenterMarker(lat, lon, radius) {
    if (radius == null) {
        return;
    }
    removeCenterMarker();
    RESULT_CENTER_MARKER = L.circle([lat, lon], {radius: radius}).addTo(RESULT_MAP);
}

function applyThreshold(score) {
    for (const [index, value] of SCORE_THRESHOLDS.entries()) {
        if (score > value) {
            return index;
        }
    }
}

function getIcon(matchScore) {
    const scoreIndex = applyThreshold(matchScore);
    const scoreDescription = SCORE_DESCRIPTIONS[`score_${scoreIndex}`];
    const iconClass = scoreDescription.toLowerCase().replaceAll(" ", "");

    return L.divIcon({
        className: "trustyou-marker",
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [-6, -30],
        html: `<span class="map-marker marker-${iconClass}" />`
    });
}

function buildMap(lat, lon, zoom) {
    const mapConfig = {
        minZoom: 10,
        maxZoom: 16,
    }
    if (RESULT_MAP) {
        RESULT_MAP.remove();
        RESULT_MAP_MARKERS = [];
    }
    var map = L.map('search-map', mapConfig).setView([lat, lon], zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    RESULT_MAP = map;

    return map;
}

function markerOnClickHandler(e) {
    scrollTo(e.target.tyId);
}

function addMarker(tyId, matchScore, lat, lon, popupText) {
    if (!RESULT_MAP) {
        return;
    }
    cleanMarker(tyId);

    var marker = L.marker([lat, lon], {icon: getIcon(matchScore)})
        .bindPopup(popupText);
    marker.tyId = tyId;

    RESULT_MAP_MARKERS[tyId] = marker
        .addTo(RESULT_MAP)
        .on('click', markerOnClickHandler);
}

function cleanMarkers() {
    for (var tyId in RESULT_MAP_MARKERS) {
        if (RESULT_MAP_MARKERS.hasOwnProperty(tyId)) {
            cleanMarker(tyId);
        }
    }
}

function cleanMarker(tyId) {
    if (RESULT_MAP && RESULT_MAP_MARKERS && RESULT_MAP_MARKERS.hasOwnProperty(tyId)) {
        // remove the marker
        RESULT_MAP.removeLayer(RESULT_MAP_MARKERS[tyId]);
    }
}

function zoomToRadius(zoomLevel) {
    // 13 => 4000
    // 14 => 2000
    // 15 => 1000
    // 16 => 500
    const baseLevel = 13;
    const baseRadius = 4000;
    const radiusStep = 2;

    if (zoomLevel && !isNaN(parseInt(zoomLevel))) {
      const intLevel = parseInt(zoomLevel);
      if (intLevel == baseLevel) {
        return baseRadius;
      }
      if (intLevel > baseLevel) {
        return baseRadius/Math.pow(radiusStep, intLevel - baseLevel);
      }
    }
    return null;
  }