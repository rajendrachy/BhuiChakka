import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const propertyIcon = new L.Icon({
  iconUrl: '/icons/property-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const disputeIcon = new L.Icon({
  iconUrl: '/icons/dispute-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Drawing controls component
const DrawingControls = ({ onDrawComplete }) => {
  const map = useMapEvents({
    click(e) {
      // Handle drawing
    }
  });
  return null;
};

const PropertyMap = ({ 
  properties = [], 
  disputes = [],
  onBoundaryDraw, 
  readOnly = false,
  initialCenter = [27.7172, 85.3240], // Kathmandu
  initialZoom = 12 
}) => {
  const [map, setMap] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const { location: userLocation, error: locationError } = useGeolocation();

  useEffect(() => {
    if (map && userLocation) {
      map.setView(userLocation, 15);
    }
  }, [userLocation, map]);

  const handleMapClick = (e) => {
    if (drawingMode) {
      setBoundaryPoints([...boundaryPoints, [e.latlng.lat, e.latlng.lng]]);
    } else {
      setSelectedLocation(e.latlng);
    }
  };

  const handleDrawComplete = () => {
    if (boundaryPoints.length >= 3) {
      onBoundaryDraw?.({
        type: 'Polygon',
        coordinates: [boundaryPoints]
      });
      setDrawingMode(false);
      setBoundaryPoints([]);
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Nepal Survey Department overlay (if available) */}
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          opacity={0.5}
        />

        {/* Properties markers */}
        {properties.map(property => (
          <Marker
            key={property._id}
            position={property.location.coordinates.coordinates.reverse()}
            icon={propertyIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">Kitta: {property.plotNumber}</h3>
                <p>{property.location.municipality}, Ward {property.location.ward}</p>
                <p>Area: {property.area.ropani} Ropani</p>
                <button className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Dispute markers */}
        {disputes.map(dispute => (
          <Marker
            key={dispute._id}
            position={dispute.property?.location?.coordinates?.coordinates?.reverse() || initialCenter}
            icon={disputeIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-600">Dispute #{dispute.caseNumber}</h3>
                <p>Type: {dispute.disputeType}</p>
                <p>Status: {dispute.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Boundary drawing */}
        {boundaryPoints.length > 0 && (
          <Polygon
            positions={boundaryPoints}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
          />
        )}

        {/* Click handler */}
        <DrawingControls onDrawComplete={handleDrawComplete} />
      </MapContainer>

      {/* Map Controls */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className={`px-4 py-2 rounded ${
              drawingMode 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {drawingMode ? 'Cancel Drawing' : 'Draw Boundary'}
          </button>
          {drawingMode && boundaryPoints.length >= 3 && (
            <button
              onClick={handleDrawComplete}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Complete
            </button>
          )}
        </div>
      )}

      {/* Location info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <p className="text-sm">
            <span className="font-bold">Lat:</span> {selectedLocation.lat.toFixed(6)}
          </p>
          <p className="text-sm">
            <span className="font-bold">Lng:</span> {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;