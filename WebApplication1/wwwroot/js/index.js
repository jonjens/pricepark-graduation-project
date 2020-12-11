﻿// Kjører initMap med en gang siden blir lastet
window.onload = function () {
    initMap();
};
// "Globale" variabler
var map, infoWindow, marker, priceSlider, markerCluster, radiusCircle;
var markers = [];
var price = 100;
var loc = 0.5;
var hour = 1;
// "Main"
function initMap() {
    setMap(mapStyle);
    getCurrentLocation();
    // Oppdaterer markers på kartet på "idle". Kan endres, dokumentasjon: https://developers.google.com/maps/documentation/javascript/events
    google.maps.event.addListener(map, "tilt_changed", function () {
        addMarkers();
    });
    google.maps.event.addListener(map, "dragend", function () {
        addMarkers();
    });
    google.maps.event.addListener(map, "bounds_changed", function () {
        drawCircle(getLocationMiddleMap());
    });
    searchField();
    currentLocationButton();
    logoOnMap();
    sliderCurrentValue();
    filterOnMap();
}
// fetches the value of the sliders
function sliderCurrentValue() {
    var priceSlider = document.getElementById("price-range");
    var radiusSlider = document.getElementById("radius-range");
    var hourSlider = document.getElementById("hour-range");
    var priceOutput = document.getElementById("current-price");
    var radiusOutput = document.getElementById("current-radius");
    var hourOutput = document.getElementById("current-hour");

    priceOutput.innerHTML = priceSlider.value;
    radiusOutput.innerHTML = radiusSlider.value;
    hourOutput.innerHTML = hourSlider.value;

    priceSlider.oninput = function () {
        priceOutput.innerHTML = this.value;
        price = priceSlider.value;
        addMarkers();
    }
    radiusSlider.oninput = function () {
        radiusOutput.innerHTML = this.value;
        loc = radiusSlider.value;
        addMarkers();
        drawCircle(getLocationMiddleMap());
    }
    hourSlider.oninput = function () {
        hourOutput.innerHTML = this.value;
        hour = hourSlider.value;
        addMarkers();
    }

}
// Draws a circle around the radiusfiltering
function drawCircle(middle) {
    if (radiusCircle) {
        radiusCircle.setMap(null);
    }
    radiusCircle = new google.maps.Circle({
        strokeColor: "#9FC68E",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#9FC68E",
        fillOpacity: 0.35,
        map,
        center: middle,
        radius: loc * 1000
    });
}
// Gets the lat and lng from the center of the map
function getLocationMiddleMap() {
    var currentMiddleLat = map.getCenter().lat();
    var currentMiddleLng = map.getCenter().lng();
    var markerCenterMap = { lat: currentMiddleLat, lng: currentMiddleLng };
    return markerCenterMap;
}
// calculates the distance between markers and the center of the map
function findLengthToMarker(marker) {
    markerCenterMap = getLocationMiddleMap();
    var R = 6371.0710; // Radius of the Earth in miles
    var rlat1 = marker.lat * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = markerCenterMap.lat * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (markerCenterMap.lng - marker.lng) * (Math.PI / 180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) *
        Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}
// places the filter on the map
function filterOnMap() {
    var filter = document.getElementById("filter");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filter);
}
// Lager kartet
function setMap(mapStyle) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 59.948612, lng: 10.766726 },
        zoom: 15, //Setter Default Zoom når kartet åpnes
        disableDefaultUI: true, //Fjerner alt av UI (zoom, streetview etc.)
        styles: mapStyle
    });


}
// Gjør at pinnene "clustrer" i antall i nærheten av hverandre. Dokumentasjon: https://developers.google.com/maps/documentation/javascript/marker-clustering
function addMarkerCluster() {

    markerCluster = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });

}
// Sletter alle markers i markersArray og fjerner de fra kartet
function removeMarkers() {

    if (markerCluster) {
        markerCluster.clearMarkers();
    }
    markers = [];
}
// Legger til søkefelt i kartet
function searchField() {
    var input = document.getElementById("pac-input");
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input); //BOTTOM_CENTER kan endres utifra hvor vi vil ha søkefeltet på kartet. Dokumentasjon: https://developers.google.com/maps/documentation/javascript/controls

    map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener("places_changed", function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {


            if (place.geometry.viewport) {

                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}
// Legger til knappen for å gå til nåværende posisjon
function currentLocationButton() {
    const centerControlDiv = document.createElement("div");
    currentLocationStyle(centerControlDiv);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
}
// Style på currentLocationButton
function currentLocationStyle(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "rgba(0, 0, 0, 0)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginBottom = "22px";
    controlDiv.appendChild(controlUI);
    // Set CSS for the control interior.
    const controlText = document.createElement("div");
    controlText.innerHTML = "<img src=\"/lib/img/CurrentLocation.png\" style=\"height: auto !important; width:10vw !important; max-width: 75px;\" alt=\"gå til nåværende posisjon\">";
    controlUI.appendChild(controlText);
    // OnClick gå til nåværende posisjon
    controlUI.addEventListener("click", () => {
        getCurrentLocation();
    });
}
// Legger til logo i kart
function logoOnMap() {
    const logoDiv = document.createElement("div");
    logoOnMapStyle(logoDiv);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(logoDiv);
}
// Style på logoOnMap
function logoOnMapStyle(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "rgba(0, 0, 0, 0)";
    controlDiv.appendChild(controlUI);
    // Set CSS for the control interior.
    const controlText = document.createElement("div");
    controlText.innerHTML = "<img src=\"/lib/img/Logo.png\" style=\"height: auto !important; width: 15vw !important; max-width: 100px;\" alt=\"gå til nåværende posisjon\">";
    controlUI.appendChild(controlText);
}
// Finner din lokasjon og setter startlokasjonen på kartet til din posisjon
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}
// Åpner mer informasjon når en marker klikkes på
function attachSecretMessage(marker, secretMessage) {
    var infowindow = new google.maps.InfoWindow({
        content: secretMessage
    });

    //Ajax function for å legge til favoritter
    google.maps.event.addListener(infowindow, 'domready', function () {
        $(".add-to-favorites").click(function (e) {
            // if e.target.id -> do requst
            // else find parent of e.target, get id -> do request
            $.post('/api/favoritesapi/' + e.currentTarget.id);
        });
    });

    marker.addListener("click", function () {
        infowindow.open(marker.get("map"), marker);
    });
}
// Feilhåndtering hvis browser ikke gir din nåværende posisjon.
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn\'t support geolocation.");
    infoWindow.open(map);
}
// Fjerner alle default ikoner på kartet (skoler, kollektivt etc.) og gir kartet "retro-look". Kan endres her: https://mapstyle.withgoogle.com/
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
]
