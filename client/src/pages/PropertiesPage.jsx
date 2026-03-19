import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ruler, FileText, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import PropertyCard from '../components/properties/PropertyCard';
import AddPropertyModal from '../components/properties/AddPropertyModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/properties?${queryParams}`);
      setProperties(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (propertyData) => {
    try {
      const response = await axios.post('/api/properties', propertyData);
      setProperties([response.data.data, ...properties]);
      setShowAddModal(false);
      toast.success('Property registered successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register property');
    }
  };

  const stats = {
    total: properties.length,
    disputed: properties.filter(p => p.status === 'disputed').length,
    verified: properties.filter(p => p.documents.some(d => d.verified)).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              + Register New Property
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Under Dispute</p>
                <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Verified Documents</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by plot number..."
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
            >
              <option value="">All Districts</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Lalitpur">Lalitpur</option>
              <option value="Bhaktapur">Bhaktapur</option>
            </select>
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disputed">Disputed</option>
              <option value="transferred">Transferred</option>
            </select>
            <button
              onClick={fetchProperties}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by registering your first property.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600"
              >
                + Register Property
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProperty}
        />
      )}
    </div>
  );
};

export default PropertiesPage;
