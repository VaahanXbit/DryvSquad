// src/components/PriceDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const PriceDisplay = ({ variantId, variantName, exShowroomPrice }) => {
  const { location, openLocationModal } = useLocation();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (location && variantId) {
      fetchPricing();
    }
  }, [location, variantId]);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const response = await api.calculateOnRoadPrice(
        variantId,
        location?.city,
        location?.stateCode
      );
      if (response.success) {
        setPricing(response.data.pricing);
      }
    } catch (error) {
      console.error('Pricing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toFixed(0)}`;
  };

  if (!location) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          📍 Please select your location to see the on-road price
        </p>
        <button
          onClick={openLocationModal}
          className="mt-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 underline"
        >
          Select Location
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {location.city}, {location.state}
          </span>
        </div>
        <button
          onClick={openLocationModal}
          className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 underline"
        >
          Change
        </button>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ex-Showroom Price */}
        <div className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ex-Showroom Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(exShowroomPrice)}
          </p>
          <p className="text-xs text-gray-400 mt-1">*Ex-showroom price may vary</p>
        </div>

        {/* On-Road Price */}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated On-Road Price</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Calculating...</span>
            </div>
          ) : pricing ? (
            <>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatPrice(pricing.total)}
              </p>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline flex items-center gap-1"
              >
                {showBreakdown ? 'Hide' : 'View'} price breakdown
                <svg
                  className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          ) : (
            <p className="text-gray-400">Failed to load price</p>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <AnimatePresence>
        {showBreakdown && pricing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Price Breakdown
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ex-Showroom Price</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.exShowroomPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Road Tax</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.roadTax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Registration Fee</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.registrationFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Insurance</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.insurance)}
                  </span>
                </div>
                {pricing.greenTax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Green Tax</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatPrice(pricing.greenTax)}
                    </span>
                  </div>
                )}
                {pricing.evSubsidy > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>EV Subsidy</span>
                    <span>-{formatPrice(pricing.evSubsidy)}</span>
                  </div>
                )}
                {pricing.luxuryTax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Luxury Tax</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatPrice(pricing.luxuryTax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Handling Charges</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.handlingCharges)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">FASTag Charges</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatPrice(pricing.fastagCharges)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-dark-600 font-bold">
                  <span className="text-gray-900 dark:text-white">Total On-Road Price</span>
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceDisplay;