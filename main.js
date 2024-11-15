import 'leaflet';
const chargingStations = [
  {
    id: 1,
    name: "BESCOM EV Station - Indiranagar",
    location: { lat: 12.9719, lng: 77.6412 },
    price: 40,
    available: 4,
    total: 6,
    type: "Fast Charging"
  },
  {
    id: 2,
    name: "Ather Grid - Koramangala",
    location: { lat: 12.9347, lng: 77.6205 },
    price: 50,
    available: 3,
    total: 4,
    type: "Super Fast Charging"
  },
  {
    id: 3,
    name: "Tata Power - Whitefield",
    location: { lat: 12.9698, lng: 77.7500 },
    price: 48,
    available: 5,
    total: 8,
    type: "Fast Charging"
  },
  {
    id: 4,
    name: "BESCOM - MG Road",
    location: { lat: 12.9757, lng: 77.6011 },
    price: 38,
    available: 2,
    total: 4,
    type: "Regular Charging"
  },
  {
    id: 5,
    name: "ChargeZone - Electronic City",
    location: { lat: 12.8458, lng: 77.6692 },
    price: 50,
    available: 6,
    total: 8,
    type: "Super Fast Charging"
  },
  {
    id: 6,
    name: "Ather Grid - HSR Layout",
    location: { lat: 12.9116, lng: 77.6474 },
    price: 42,
    available: 3,
    total: 4,
    type: "Fast Charging"
  },
  {
    id: 7,
    name: "BESCOM EV Station - Yelahanka",
    location: { lat: 13.0998, lng: 77.5963 },
    price: 43,
    available: 5,
    total: 6,
    type: "Fast Charging"
  },
  {
    id: 8,
    name: "BESCOM EV Station - Jayanagar",
    location: { lat: 12.9633, lng: 77.5903 },
    price: 45,
    available: 4,
    total: 6,
    type: "Fast Charging"
  },
  {
    id: 9,
    name: "ChargeZone - JP Nagar",
    location: { lat: 12.9141, lng: 77.5947 },
    price: 45,
    available: 3,
    total: 5,
    type: "Fast Charging"
  },
  {
    id: 10,
    name: "BESCOM - Malleshwaram",
    location: { lat: 13.0035, lng: 77.5647 },
    price: 42,
    available: 6,
    total: 8,
    type: "Regular Charging"
  }
];
const locationCoordinates = {
  'indiranagar': { lat: 12.9719, lng: 77.6412 },
  'indira nagar': { lat: 12.9719, lng: 77.6412 },
  'koramangala': { lat: 12.9347, lng: 77.6205 },
  'whitefield': { lat: 12.9698, lng: 77.7500 },
  'white field': { lat: 12.9698, lng: 77.7500 },
  'jp nagar': { lat: 12.9141, lng: 77.5947 },
  'jayanagar': { lat: 12.9633, lng: 77.5903 },
  'jaya nagar': { lat: 12.9633, lng: 77.5903 },
  'malleshwaram': { lat: 13.0035, lng: 77.5647 },
  'malleswaram': { lat: 13.0035, lng: 77.5647 },
  'yelahanka': { lat: 13.0998, lng: 77.5963 },
  'mg road': { lat: 12.9757, lng: 77.6011 },
  'mahatma gandhi road': { lat: 12.9757, lng: 77.6011 },
  'hsr': { lat: 12.9116, lng: 77.6474 },
  'hsr layout': { lat: 12.9116, lng: 77.6474 },
  'electronic city': { lat: 12.8458, lng: 77.6692 },
  'electronics city': { lat: 12.8458, lng: 77.6692 }
};

let map;
let userMarker;
let stationMarkers = [];
const SEARCH_RADIUS = 5;

function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

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

function initMap() {
  map = L.map('map').setView([12.9716, 77.5946], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Using default Bengaluru center.");
        updateUserLocation({ lat: 12.9716, lng: 77.5946 });
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
    updateUserLocation({ lat: 12.9716, lng: 77.5946 });
  }
}

function updateUserLocation(location) {
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  userMarker = L.marker([location.lat, location.lng], {
    icon: L.divIcon({
      className: 'current-location-marker',
      html: '📍',
      iconSize: [25, 25],
      iconAnchor: [12, 24]
    })
  }).addTo(map);
  map.setView([location.lat, location.lng], 13);
  findNearbyStations(location);
}

window.findStations = function () {
  const locationInput = document.getElementById('location').value.toLowerCase().trim();

  if (locationInput === '') {
    getCurrentLocation();
    return;
  }

  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (locationInput.includes(key) || key.includes(locationInput)) {
      updateUserLocation(coords);
      return;
    }
  }

  alert("Location not found in Bangalore. Please try another location or check the spelling.");
}

function findNearbyStations(userLocation) {
  stationMarkers.forEach(marker => map.removeLayer(marker));
  stationMarkers = [];

  const nearbyStations = chargingStations.filter(station => {
    const distance = calculateDistance(userLocation, station.location);
    return distance <= SEARCH_RADIUS;
  });

  if (window.searchRadiusCircle) {
    map.removeLayer(window.searchRadiusCircle);
  }
  window.searchRadiusCircle = L.circle(userLocation, {
    radius: SEARCH_RADIUS * 1000,
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.1
  }).addTo(map);

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

  updateStationList(userLocation, nearbyStations);

  if (nearbyStations.length > 0) {
    const bounds = L.latLngBounds([userLocation]);
    nearbyStations.forEach(station => {
      bounds.extend([station.location.lat, station.location.lng]);
    });
    map.fitBounds(bounds.pad(0.1));
  }
}

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

function calculateDistance(point1, point2) {
  const R = 6371;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function showHelp(helpType) {
  if (helpType === 'charging') {
    document.getElementById('charging-help-modal').classList.remove('hidden');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function showTopic(topic) {
  const helpDetails = document.getElementById('help-details');
  const helpContent = {
    "How to locate charging stations": "To locate charging stations, use the search bar on our app or website and enter your location. A map will show all nearby stations.",
    "Troubleshooting charging issues": "If your vehicle doesn't charge, ensure the connector is secure, the station is powered, and your vehicle's charging port is functional.",
    "Understanding charging speeds": "Charging speeds depend on the station type: Level 1 (slow), Level 2 (moderate), and DC Fast Charging (fast). Check your vehicle's compatibility."
  };
  helpDetails.innerHTML = `<p>${helpContent[topic]}</p>`;
}
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
    star.classList.add('selected');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.rate-us-form button');
  const thankYouMessage = document.querySelector('.thank-you-message');
  const rateUsForm = document.querySelector('.rate-us-form');

  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    rateUsForm.style.display = 'none';
    thankYouMessage.classList.remove('hidden');
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.rate-us-form button');
  const popup = document.getElementById('feedback-popup');
  const closeButton = document.getElementById('close-popup');

  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    popup.classList.remove('hidden');
  });

  closeButton.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.classList.add('hidden');
    }
  });
});
