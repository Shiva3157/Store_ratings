import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Rating {
  id: number;
  rating: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DashboardData {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

const StoreOwnerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
  });
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/ratings/dashboard/store-owner');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className={`text-lg ${
          star <= rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Store Owner Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">★</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.averageRating.toFixed(1)} / 5.0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">#</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Ratings</dt>
                      <dd className="text-lg font-medium text-gray-900">{dashboardData.totalRatings}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Ratings</h3>
          
          {dashboardData.ratings.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {dashboardData.ratings.map((rating) => (
                  <li key={rating.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{rating.user.name}</p>
                          <div className="flex items-center">
                            {renderStars(rating.rating)}
                            <span className="ml-2 text-sm text-gray-600">
                              ({rating.rating}/5)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{rating.user.email}</p>
                        <p className="text-xs text-gray-400">
                          Rated on {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <p className="text-gray-500">No ratings yet for your store.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Encourage customers to rate your store to see feedback here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
