import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ruler, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatArea = (area) => {
    if (area.ropani) {
      return `${area.ropani} Ropani ${area.aana || 0} Anna`;
    }
    if (area.bigha) {
      return `${area.bigha} Bigha ${area.katha || 0} Katha`;
    }
    return `${area.sqMeters || 0} sq.m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Map Preview */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow">
          Kitta: {property.plotNumber}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <MapPin className="inline h-4 w-4" />
          <span className="ml-1 text-sm">{property.location.municipality}</span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {property.location.tole || 'Property'} 
            <span className="block text-sm text-gray-500">Ward {property.location.ward}</span>
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Ruler className="h-4 w-4 mr-2" />
            <span>Area: {formatArea(property.area)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            <span>Documents: {property.documents?.length || 0} uploaded</span>
          </div>
          {property.riskScore > 50 && (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Risk Score: {property.riskScore}%</span>
            </div>
          )}
        </div>

        {/* Document Verification Status */}
        {property.documents?.some(d => d.verified) && (
          <div className="mb-4 p-2 bg-green-50 rounded-lg flex items-center text-sm text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>{property.documents.filter(d => d.verified).length} documents verified</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/properties/${property._id}`}
            className="flex-1 bg-yellow-500 text-white text-center px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
          >
            View Details
          </Link>
          {property.status === 'active' && (
            <button
              onClick={() => {/* Handle dispute filing */}}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
            >
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
