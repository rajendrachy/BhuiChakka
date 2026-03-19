import React, { useState, useRef } from 'react';
import { Camera, MapPin, Check, X } from 'lucide-react';

const BoundaryMarker = ({ onMarkerAdd, onComplete }) => {
  const [markers, setMarkers] = useState([]);
  const [currentMarker, setCurrentMarker] = useState({
    type: 'concrete',
    coordinates: null,
    photo: null,
    description: ''
  });
  const [showForm, setShowForm] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const markerTypes = [
    { value: 'concrete', label: 'Concrete Pillar', icon: '🏛️' },
    { value: 'stone', label: 'Stone Marker', icon: '🪨' },
    { value: 'iron', label: 'Iron Rod', icon: '⚙️' },
    { value: 'tree', label: 'Boundary Tree', icon: '🌳' }
  ];

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentMarker({
            ...currentMarker,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg');
      setCurrentMarker({ ...currentMarker, photo: photoData });
      
      // Stop video stream
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const addMarker = () => {
    if (currentMarker.coordinates) {
      const newMarker = {
        ...currentMarker,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      setMarkers([...markers, newMarker]);
      onMarkerAdd?.(newMarker);
      setCurrentMarker({
        type: 'concrete',
        coordinates: null,
        photo: null,
        description: ''
      });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Boundary Markers</h3>
      
      {/* Existing markers */}
      {markers.length > 0 && (
        <div className="mb-6 space-y-3">
          {markers.map((marker, index) => (
            <div key={marker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {markerTypes.find(t => t.value === marker.type)?.icon}
                </span>
                <div>
                  <p className="font-medium">Marker {index + 1} - {marker.type}</p>
                  <p className="text-xs text-gray-500">
                    {marker.coordinates.lat.toFixed(6)}, {marker.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              {marker.photo && (
                <img 
                  src={marker.photo} 
                  alt="Marker" 
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new marker form */}
      {showForm ? (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Add Boundary Marker</h4>
          
          {/* Marker Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marker Type
            </label>
            <select
              value={currentMarker.type}
              onChange={(e) => setCurrentMarker({...currentMarker, type: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            >
              {markerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Capture */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {currentMarker.coordinates ? (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm">
                  Lat: {currentMarker.coordinates.lat.toFixed(6)}
                </p>
                <p className="text-sm">
                  Lng: {currentMarker.coordinates.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">
                  Accuracy: ±{currentMarker.coordinates.accuracy}m
                </p>
              </div>
            ) : (
              <button
                onClick={handleLocationCapture}
                className="w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-yellow-500"
              >
                <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Capture Current Location
                </p>
              </button>
            )}
          </div>

          {/* Photo Capture */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            {currentMarker.photo ? (
              <div className="relative">
                <img 
                  src={currentMarker.photo} 
                  alt="Marker" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCurrentMarker({...currentMarker, photo: null})}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <video ref={videoRef} className="hidden" />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={handlePhotoCapture}
                  className="w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-yellow-500"
                >
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">
                    Take Photo
                  </p>
                </button>
                {videoRef.current?.srcObject && (
                  <button
                    onClick={capturePhoto}
                    className="mt-2 w-full bg-yellow-500 text-white py-2 rounded"
                  >
                    Capture
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={currentMarker.description}
              onChange={(e) => setCurrentMarker({...currentMarker, description: e.target.value})}
              rows="2"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Any notes about this marker..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={addMarker}
              disabled={!currentMarker.coordinates}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              <Check className="inline h-4 w-4 mr-1" />
              Add Marker
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-yellow-500 text-yellow-500 py-3 rounded-lg hover:bg-yellow-50"
        >
          + Add Boundary Marker
        </button>
      )}

      {/* Complete button */}
      {markers.length >= 4 && (
        <button
          onClick={onComplete}
          className="mt-4 w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-medium"
        >
          Complete Boundary Marking
        </button>
      )}
      
      <p className="text-xs text-gray-500 mt-4">
        * Minimum 4 markers recommended for accurate boundary
      </p>
    </div>
  );
};

export default BoundaryMarker;
