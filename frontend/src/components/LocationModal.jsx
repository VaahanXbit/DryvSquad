// src/components/LocationModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';

const LocationModal = () => {
  const { isModalOpen, closeLocationModal, setLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [popularLocations, setPopularLocations] = useState([]);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
  const modalRef = useRef(null);

  // Load popular locations on mount
  useEffect(() => {
    if (isModalOpen) {
      fetchPopularLocations();
      // Reset error when modal opens
      setError(null);
    }
  }, [isModalOpen]);

  const fetchPopularLocations = async () => {
    try {
      const response = await api.getPopularLocations();
      if (response.success) {
        setPopularLocations(response.data);
      }
    } catch (err) {
      console.error('Error fetching popular locations:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.searchLocations(searchQuery);
        if (response.success) {
          setSearchResults(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode
      const response = await api.reverseGeocode(latitude, longitude);
      
      if (response.success) {
        const locationData = response.data;
        
        // Validate India
        if (locationData.country !== 'India') {
          setError('This feature is currently available only in India.');
          setIsGeolocating(false);
          return;
        }

        setLocation(locationData);
        closeLocationModal();
      } else {
        setError(response.message || 'Failed to get your location');
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      if (err.code === 1) {
        setError('Please allow location access to use this feature');
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again');
      } else {
        setError('Failed to get your location. Please try searching manually.');
      }
    } finally {
      setIsGeolocating(false);
    }
  };

  const handleLocationSelect = (location) => {
    setLocation(location);
    closeLocationModal();
  };

  const handleClose = () => {
    closeLocationModal();
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop - fixed fullscreen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Modal - centered with max width */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md md:max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-2xl overflow-hidden mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Choose your location
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      We use your location to calculate accurate on-road prices, dealership availability, offers and EMI.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Current Location Button */}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isGeolocating}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 mb-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeolocating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <span>Detecting location...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>📍 Use My Current Location</span>
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative mb-4">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for your city, district or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Search Results */}
                {searchQuery.length > 0 && (
                  <div className="mb-4">
                    {isSearching ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {searchResults.map((location, index) => (
                          <button
                            key={`${location.city}-${location.state}-${index}`}
                            onClick={() => handleLocationSelect(location)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {location.city || location.district || location.state}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  {location.district && location.city !== location.district ? `${location.district}, ` : ''}{location.state}
                                </span>
                              </div>
                              {location.pincode && (
                                <span className="text-xs text-gray-400">{location.pincode}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No locations found. Try a different search.
                      </p>
                    )}
                  </div>
                )}

                {/* Popular Locations */}
                {searchQuery.length === 0 && popularLocations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Popular Locations
                    </p>
                    <div className="space-y-1">
                      {popularLocations.map((location, index) => (
                        <button
                          key={`popular-${location.city}-${location.state}-${index}`}
                          onClick={() => handleLocationSelect(location)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {location.city || location.district || location.state}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                {location.state}
                              </span>
                            </div>
                            {location.pincode && (
                              <span className="text-xs text-gray-400">{location.pincode}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;