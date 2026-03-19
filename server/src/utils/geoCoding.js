const axios = require('axios');

// Nominatim geocoding (OpenStreetMap)
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'np'
      },
      headers: {
        'User-Agent': 'Bhuichakka/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocoding
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'Bhuichakka/1.0'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Calculate area from polygon coordinates
const calculateArea = (coordinates) => {
  // Shoelace formula for polygon area
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  area = Math.abs(area) / 2;
  
  // Convert to square meters (approximate)
  const sqMeters = area * 111319.9 * 111319.9; // Rough conversion
  
  // Convert to Nepali units
  const ropani = sqMeters * 0.001987;
  const bigha = sqMeters * 0.000747;
  
  return {
    sqMeters,
    ropani: Math.floor(ropani),
    aana: Math.floor((ropani % 1) * 16),
    dam: Math.floor(((ropani * 16) % 1) * 4),
    bigha: Math.floor(bigha),
    katha: Math.floor((bigha % 1) * 20),
    dhur: Math.floor(((bigha * 20) % 1) * 20)
  };
};

// Detect boundary overlaps
const detectOverlaps = async (property1, property2) => {
  // Implement polygon intersection detection
  // This would use turf.js or similar library
  return {
    overlap: false,
    area: 0,
    percentage: 0
  };
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateArea,
  detectOverlaps
};