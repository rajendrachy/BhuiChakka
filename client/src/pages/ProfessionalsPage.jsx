import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import axios from 'axios';
import ProfessionalCard from '../components/professionals/ProfessionalCard';
import BookingModal from '../components/professionals/BookingModal';
import toast from 'react-hot-toast';

const ProfessionalsPage = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [filters, setFilters] = useState({
    type: 'surveyor',
    district: '',
    specialization: '',
    minRating: 0
  });

  const professionalTypes = [
    { value: 'surveyor', label: 'Surveyors', icon: '🔍' },
    { value: 'lawyer', label: 'Lawyers', icon: '⚖️' },
    { value: 'mediator', label: 'Mediators', icon: '🤝' }
  ];

  useEffect(() => {
    fetchProfessionals();
  }, [filters]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/professionals', { params: filters });
      setProfessionals(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch professionals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-4">Professional Network</h1>
          <p className="text-xl opacity-90">
            Connect with verified surveyors, lawyers, and mediators
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Type
              </label>
              <div className="flex gap-2">
                {professionalTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFilters({...filters, type: type.value})}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      filters.type === type.value
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'border-gray-300 hover:border-yellow-500'
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                value={filters.district}
                onChange={(e) => setFilters({...filters, district: e.target.value})}
              >
                <option value="">All Districts</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                placeholder="e.g., Boundary, Inheritance"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                value={filters.specialization}
                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: parseInt(e.target.value)})}
              >
                <option value="0">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map(professional => (
              <ProfessionalCard
                key={professional._id}
                professional={professional}
                onBook={() => setSelectedProfessional(professional)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedProfessional && (
        <BookingModal
          professional={selectedProfessional}
          onClose={() => setSelectedProfessional(null)}
          onBooked={() => {
            toast.success('Booking request sent!');
            setSelectedProfessional(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfessionalsPage;

