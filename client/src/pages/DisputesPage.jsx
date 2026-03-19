import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import DisputeCard from '../components/disputes/DisputeCard';
import FileDisputeModal from '../components/disputes/FileDisputeModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DisputesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFileModal, setShowFileModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    path: ''
  });

  useEffect(() => {
    fetchDisputes();
  }, [filters]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/disputes?${queryParams}`);
      setDisputes(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: disputes.length,
    active: disputes.filter(d => d.status === 'active').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    urgent: disputes.filter(d => d.priority === 'urgent').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
            <button
              onClick={() => setShowFileModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              + File New Dispute
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Scale className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Cases</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="boundary">Boundary</option>
              <option value="encroachment">Encroachment</option>
              <option value="inheritance">Inheritance</option>
              <option value="ownership">Ownership</option>
            </select>

            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.path}
              onChange={(e) => setFilters({...filters, path: e.target.value})}
            >
              <option value="">All Resolution Paths</option>
              <option value="negotiation">Negotiation</option>
              <option value="mediation">Mediation</option>
              <option value="administrative">Administrative</option>
              <option value="court">Court</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No disputes</h3>
            <p className="mt-1 text-sm text-gray-500">No active disputes found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <DisputeCard 
                key={dispute._id} 
                dispute={dispute}
                onClick={() => navigate(`/disputes/${dispute._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* File Dispute Modal */}
      {showFileModal && (
        <FileDisputeModal
          onClose={() => setShowFileModal(false)}
          onSuccess={() => {
            fetchDisputes();
            setShowFileModal(false);
          }}
        />
      )}
    </div>
  );
};

export default DisputesPage;

