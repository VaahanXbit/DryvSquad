// src/components/CarCardWithPrice.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const CarCardWithPrice = ({ car }) => {
  const { location } = useLocation();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location && car?.id) {
      fetchPricing();
    }
  }, [location, car?.id]);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.calculateOnRoadPrice(
        car.id,
        location.city,
        location.stateCode
      );
      if (response.success) {
        setPricing(response.data.pricing);
      } else {
        setError(response.message || 'Failed to fetch pricing');
      }
    } catch (err) {
      setError('Failed to load pricing');
      console.error('Pricing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(2)}K`;
    }
    return `₹${price.toFixed(0)}`;
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-dark-700">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-dark-700">
        <img
          src={car.image || '/placeholder-car.png'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-contain p-4"
        />
        {car.brandIcon && (
          <span className="absolute top-2 left-2 text-2xl">{car.brandIcon}</span>
        )}
      </div>

      {/* Car Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {car.brand} {car.model}
          </h3>
          {car.overallScore && (
            <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              ★ {car.overallScore.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {car.variant}
        </p>

        {/* Pricing Section */}
        <div className="space-y-2">
          {/* Ex-Showroom Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Ex-Showroom</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {formatPrice(car.exShowroomPrice || car.price)}
            </span>
          </div>

          {/* On-Road Price with Location */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-600">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                On-Road Price
              </span>
              {location && (
                <button
                  onClick={() => {/* Open location modal */}}
                  className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
                >
                  📍 {location.city || location.state}
                </button>
              )}
            </div>
            <div className="text-right">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : error ? (
                <span className="text-sm text-red-500">Try again</span>
              ) : pricing ? (
                <div>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {formatPrice(pricing.total)}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    +{formatPrice(pricing.roadTax)} Tax
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Select location</span>
              )}
            </div>
          </div>

          {/* Price Breakdown (Expandable) */}
          {pricing && (
            <details className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                View price breakdown
              </summary>
              <div className="mt-2 space-y-1 p-2 bg-gray-50 dark:bg-dark-700 rounded">
                <div className="flex justify-between">
                  <span>Ex-Showroom</span>
                  <span>{formatPrice(pricing.exShowroomPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Road Tax</span>
                  <span>{formatPrice(pricing.roadTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee</span>
                  <span>{formatPrice(pricing.registrationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance</span>
                  <span>{formatPrice(pricing.insurance)}</span>
                </div>
                {pricing.greenTax > 0 && (
                  <div className="flex justify-between">
                    <span>Green Tax</span>
                    <span>{formatPrice(pricing.greenTax)}</span>
                  </div>
                )}
                {pricing.evSubsidy > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>EV Subsidy</span>
                    <span>-{formatPrice(pricing.evSubsidy)}</span>
                  </div>
                )}
                {pricing.luxuryTax > 0 && (
                  <div className="flex justify-between">
                    <span>Luxury Tax</span>
                    <span>{formatPrice(pricing.luxuryTax)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Handling Charges</span>
                  <span>{formatPrice(pricing.handlingCharges)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-dark-600 font-bold">
                  <span>Total On-Road</span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-all text-sm">
            Compare
          </button>
          <button className="px-3 py-2 border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCardWithPrice;