// src/hooks/useEvRangeCalculator.js
/*
================================================================================
File Name : useEvRangeCalculator.js
Description : Single entry point every EV Range Calculator component uses.
              Owns form state, the vehicle list/search, the calculation
              call, and the Trip Planner's from/to -> distance resolution.
              No component talks to evRangeCalculatorService directly.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useCallback, useEffect, useState } from 'react';
import evRangeCalculatorService from '../services/evRangeCalculatorService';
import { DEFAULT_FORM_VALUES } from '../constants/evRangeCalculator';

export const useEvRangeCalculator = () => {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [vehicleSearchLoading, setVehicleSearchLoading] = useState(false);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [tripPlanner, setTripPlanner] = useState({ from: '', to: '', status: 'idle', message: null });

  // Load the initial vehicle list (and pre-select the first one, matching
  // the approved design which always shows a vehicle already selected).
  useEffect(() => {
    (async () => {
      setVehicleSearchLoading(true);
      const response = await evRangeCalculatorService.searchVehicles('');
      setVehicleSearchLoading(false);
      if (response.success && response.data?.length) {
        setVehicleOptions(response.data);
        const defaultVehicle = response.data.find((v) => v.model === 'Nexon EV') || response.data[0];
        setSelectedVehicle(defaultVehicle);
        setFormValues((prev) => ({ ...prev, vehicleId: defaultVehicle.id }));
      }
    })();
  }, []);

  const searchVehicles = useCallback(async (query) => {
    setVehicleSearchLoading(true);
    const response = await evRangeCalculatorService.searchVehicles(query);
    setVehicleSearchLoading(false);
    if (response.success) {
      setVehicleOptions(response.data);
    }
  }, []);

  const selectVehicle = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
    setFormValues((prev) => ({ ...prev, vehicleId: vehicle.id }));
  }, []);

  const updateField = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateAdvanced = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, advanced: { ...prev.advanced, [key]: value } }));
  }, []);

  const calculate = useCallback(async () => {
    if (!formValues.vehicleId) return;
    setStatus('loading');
    setError(null);

    const response = await evRangeCalculatorService.calculate(formValues);

    if (response.success && response.data) {
      setStatus('success');
      setResult(response.data);
    } else {
      setStatus('error');
      setError({ message: response.message || 'Something went wrong. Please try again.' });
    }
  }, [formValues]);

  // Trip Planner: resolves a from/to route to a distance, then folds that
  // distance into the shared tripDistanceKm used by the whole calculation
  // (Cost Estimate, Charging Recommendation, Battery at Destination all
  // read from the same value — single source of truth, per the algorithm).
  const planTrip = useCallback(async (from, to) => {
    setTripPlanner({ from, to, status: 'loading', message: null });
    const response = await evRangeCalculatorService.getTripDistance(from, to);

    if (response.success && response.data) {
      setFormValues((prev) => ({
        ...prev,
        advanced: { ...prev.advanced, tripDistanceKm: response.data.distanceKm },
      }));
      setTripPlanner({ from, to, status: 'success', message: null });
    } else {
      setTripPlanner({
        from,
        to,
        status: 'error',
        message: response.message || 'Could not resolve this route. Please enter the distance manually.',
      });
    }
  }, []);

  // Recalculate whenever the trip distance changes via the Trip Planner,
  // so the Charging Recommendation card stays in sync.
  useEffect(() => {
    if (tripPlanner.status === 'success' && status === 'success') {
      calculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.advanced?.tripDistanceKm]);

  return {
    formValues,
    selectedVehicle,
    vehicleOptions,
    vehicleSearchLoading,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    result,
    error,
    tripPlanner,
    searchVehicles,
    selectVehicle,
    updateField,
    updateAdvanced,
    calculate,
    planTrip,
  };
};

export default useEvRangeCalculator;
