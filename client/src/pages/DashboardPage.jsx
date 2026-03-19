import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Scale, 
  FileText, 
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PropertyMap from '../components/properties/PropertyMap';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import StatsCard from '../components/dashboard/StatsCard';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    disputes: 0,
    documents: 0,
    professionals: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, eventsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/activities'),
        axios.get('/api/dashboard/upcoming')
      ]);

      setStats(statsRes.data.data);
      setRecentActivities(activitiesRes.data.data);
      setUpcomingEvents(eventsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.properties,
      icon: Home,
      color: 'blue',
      link: '/properties'
    },
    {
      title: 'Active Disputes',
      value: stats.disputes,
      icon: Scale,
      color: 'red',
      link: '/disputes'
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: FileText,
      color: 'green',
      link: '/documents'
    },
    {
      title: 'Professionals',
      value: stats.professionals,
      icon: Users,
      color: 'purple',
      link: '/professionals'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="opacity-90">
            Here's what's happening with your properties today.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Preview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Property Map</h2>
              <Link to="/properties" className="text-sm text-yellow-500 hover:text-yellow-600">
                View All
              </Link>
            </div>
            <div className="h-64 rounded-lg overflow-hidden">
              <PropertyMap readOnly={true} />
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.type === 'hearing' ? 'bg-red-100' :
                      event.type === 'survey' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {event.type === 'hearing' ? '⚖️' :
                       event.type === 'survey' ? '🗺️' : '📅'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('ne-NP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <ActivityTimeline activities={recentActivities} />
        </div>

        {/* Dispute Alert */}
        {stats.disputes > 0 && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You have {stats.disputes} active dispute{stats.disputes > 1 ? 's' : ''}.
                  <Link to="/disputes" className="ml-2 font-medium underline">
                    View details →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
