import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
}

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...'); // Debug log
      const response = await axios.get('/api/stores');
      console.log('Stores response:', response.data); // Debug log
      setStores(response.data);
      
      // Fetch user ratings for each store
      const ratings: { [key: number]: number } = {};
      for (const store of response.data) {
        try {
          const ratingResponse = await axios.get(`/api/ratings/user/${user?.id}/store/${store.id}`);
          if (ratingResponse.data) {
            ratings[store.id] = ratingResponse.data.rating;
          }
        } catch (error) {
          // User hasn't rated this store yet
          console.log(`No rating found for store ${store.id}`); // Debug log
        }
      }
      setUserRatings(ratings);
      console.log('User ratings:', ratings); // Debug log
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  // Function to handle rating submission
  const handleRating = async (storeId: number, rating: number) => {
    try {
      await axios.patch(`/api/ratings/store/${storeId}`, { rating });
      // Update local state with new rating
      setUserRatings({ ...userRatings, [storeId]: rating });
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // TODO: Show error message to user
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (storeId: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        onClick={() => handleRating(storeId, star)}
        className={`text-2xl ${
          star <= (userRatings[storeId] || 0)
            ? 'text-yellow-400'
            : 'text-gray-300'
        } hover:text-yellow-400`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Store Directory</h1>
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
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search stores by name or address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                <p className="text-sm text-gray-600 mb-4">{store.email}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    Average Rating: {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Rating:</p>
                  <div className="flex space-x-1">
                    {renderStars(store.id)}
                  </div>
                  {userRatings[store.id] && (
                    <p className="text-sm text-gray-600 mt-1">
                      You rated: {userRatings[store.id]} stars
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No stores found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
