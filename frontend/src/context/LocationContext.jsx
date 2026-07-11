// src/context/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load location from localStorage on mount
  useEffect(() => {
    const loadSavedLocation = () => {
      try {
        const saved = localStorage.getItem('userLocation');
        if (saved) {
          const parsed = JSON.parse(saved);
          setLocation(parsed);
          setIsLoading(false);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error loading location from localStorage:', err);
        return false;
      }
    };

    const loadUserLocation = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getUserLocation(token);
          if (response.success && response.data) {
            setLocation(response.data);
            localStorage.setItem('userLocation', JSON.stringify(response.data));
            setIsLoading(false);
            return true;
          }
        } catch (err) {
          console.error('Error loading user location:', err);
        }
      }
      return false;
    };

    const initLocation = async () => {
      setIsLoading(true);
      
      // Try localStorage first
      const saved = loadSavedLocation();
      
      // If not in localStorage, try user profile
      if (!saved) {
        await loadUserLocation();
      }
      
      setIsLoading(false);
    };

    initLocation();
  }, []);

  const setUserLocation = useCallback((newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    
    // Save to user profile if logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.saveUserLocation(token, newLocation).catch(err => {
        console.error('Error saving location to profile:', err);
      });
    }
  }, []);

  const openLocationModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation: setUserLocation,
        isLoading,
        error,
        isModalOpen,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};