import 'leaflet';

// Bengaluru charging station data
const chargingStations = [
  {
    id: 1,
    name: "BESCOM EV Station - Indiranagar",
    location: { lat: 12.9719, lng: 77.6412 },
    price: 45,
    available: 4,
    total: 6,
    type: "Fast Charging"
  },
  {
    id: 2,
    name: "Ather Grid - Koramangala",
    location: { lat: 12.9347, lng: 77.6205 },
    price: 45,
    available: 3,
    total: 4,
    type: "Super Fast Charging"
  },
  {
    id: 3,
    name: "Tata Power - Whitefield",
    location: { lat: 12.9698, lng: 77.7500 },
    price: 45,
    available: 5,
    total: 8,
    type: "Fast Charging"
  },
  {
    id: 4,
    name: "BESCOM - MG Road",
    location: { lat: 12.9757, lng: 77.6011 },
    price: 45,
    available: 2,
    total: 4,
    type: "Regular Charging"
  },
  {
    id: 5,
    name: "ChargeZone - Electronic City",
    location: { lat: 12.8458, lng: 77.6692 },
    price: 45,
    available: 6,
    total: 8,
    type: "Super Fast Charging"
  },
  {
    id: 6,
    name: "Ather Grid - HSR Layout",
    location: { lat: 12.9116, lng: 77.6474 },
    price: 45,
    available: 3,
    total: 4,
    type: "Fast Charging"
  },
  {
    id: 7,
    name: "BESCOM EV Station - Yelahanka",
    location: { lat: 13.0998, lng: 77.5963 },
    price: 45,
    available: 5,
    total: 6,
    type: "Fast Charging"
  }
];

let map;
let userMarker;
let stationMarkers = [];
const SEARCH_RADIUS = 5; // Search radius in kilometers

// Authentication functions
function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Demo login (in production, this would validate against a backend)
  if (email && password) {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    initMap();
    getCurrentLocation();
  }
  return false;
}

window.login = login;

function logout() {
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('login-form').reset();
}

window.logout = logout;

// Initialize map centered on Bengaluru
function initMap() {
  map = L.map('map').setView([12.9716, 77.5946], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Get user's current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (userMarker) {
          map.removeLayer(userMarker);
        }
        userMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'current-location-marker',
            html: '📍',
            iconSize: [25, 25],
            iconAnchor: [12, 24]
          })
        }).addTo(map);
        map.setView([latitude, longitude], 13);
        findNearbyStations({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Using default Bengaluru center.");
        findNearbyStations({ lat: 12.9716, lng: 77.5946 });
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
    findNearbyStations({ lat: 12.9716, lng: 77.5946 });
  }
}

// Find nearby stations
function findNearbyStations(userLocation) {
  // Clear existing markers
  stationMarkers.forEach(marker => map.removeLayer(marker));
  stationMarkers = [];

  // Filter stations within the search radius
  const nearbyStations = chargingStations.filter(station => {
    const distance = calculateDistance(userLocation, station.location);
    return distance <= SEARCH_RADIUS;
  });

  // Add circle to show search radius
  if (window.searchRadiusCircle) {
    map.removeLayer(window.searchRadiusCircle);
  }
  window.searchRadiusCircle = L.circle(userLocation, {
    radius: SEARCH_RADIUS * 1000, // Convert km to meters
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.1
  }).addTo(map);

  // Add markers for nearby stations
  nearbyStations.forEach(station => {
    const marker = L.marker(station.location, {
      icon: L.divIcon({
        className: 'charging-station-marker',
        html: '⚡',
        iconSize: [25, 25],
        iconAnchor: [12, 24]
      })
    })
      .bindPopup(createPopupContent(station))
      .addTo(map);
    stationMarkers.push(marker);
  });

  // Update station list
  updateStationList(userLocation, nearbyStations);

  // Fit map bounds to show all markers
  if (nearbyStations.length > 0) {
    const bounds = L.latLngBounds([userLocation]);
    nearbyStations.forEach(station => {
      bounds.extend([station.location.lat, station.location.lng]);
    });
    map.fitBounds(bounds.pad(0.1));
  }
}

// Create popup content for markers
function createPopupContent(station) {
  return `
    <div class="popup-content">
      <h3>${station.name}</h3>
      <p>Price: ₹${station.price}/kWh</p>
      <p>Available: ${station.available}/${station.total} stations</p>
      <p>Type: ${station.type}</p>
    </div>
  `;
}

// Update the station list in the sidebar
function updateStationList(userLocation, nearbyStations) {
  const stationsDiv = document.getElementById('stations');
  stationsDiv.innerHTML = '';

  if (nearbyStations.length === 0) {
    stationsDiv.innerHTML = `<p class="no-stations">No charging stations found within ${SEARCH_RADIUS}km radius.</p>`;
    return;
  }

  const sortedStations = [...nearbyStations].sort((a, b) => {
    const distanceA = calculateDistance(userLocation, a.location);
    const distanceB = calculateDistance(userLocation, b.location);
    return distanceA - distanceB;
  });

  sortedStations.forEach(station => {
    const distance = calculateDistance(userLocation, station.location);
    const stationCard = document.createElement('div');
    stationCard.className = 'station-card';
    stationCard.innerHTML = `
      <h3>${station.name}</h3>
      <div class="station-info">Distance: ${distance.toFixed(1)} km</div>
      <div class="station-info">Available: ${station.available}/${station.total} stations</div>
      <div class="station-info">Type: ${station.type}</div>
      <div class="station-price">Price: ₹${station.price}/kWh</div>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}" 
         class="directions-btn" 
         target="_blank">
        Get Directions
      </a>
    `;
    stationsDiv.appendChild(stationCard);
  });
}

// Calculate distance between two points
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find stations button click handler
window.findStations = function() {
  const locationInput = document.getElementById('location').value;
  if (locationInput.trim() === '') {
    getCurrentLocation();
  } else if (locationInput.toLowerCase().includes('yelahanka')) {
    // Special handling for Yelahanka location
    findNearbyStations({ lat: 13.0998, lng: 77.5963 });
  } else {
    // For demo, center on Bengaluru when manual location is entered
    alert("Geocoding service would be implemented here. Using Bengaluru center for demo.");
    findNearbyStations({ lat: 12.9716, lng: 77.5946 });
  }
}