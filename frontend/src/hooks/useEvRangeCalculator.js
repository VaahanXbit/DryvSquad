// src/hooks/useEvRangeCalculator.js
/*
================================================================================
File Name : useEvRangeCalculator.js
Description : Single entry point every EV Range Calculator component uses.
              Owns form state, the vehicle list/search, the calculation
              call, and the Trip Planner's from/to -> distance resolution.
              No component talks to evRangeCalculatorService directly, and
              no calculation happens in the UI — this hook only sends
              inputs and renders whatever the backend returns.
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

  // Load the initial EV list (queried live from the existing Variant
  // database, filtered to fuelType: Electric — see the backend service).
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

  // Dynamic validation: Calculate stays disabled until a vehicle is
  // selected, battery level is entered, and trip distance is entered.
  const canCalculate = Boolean(
    formValues.vehicleId &&
    formValues.batteryPercent !== '' && formValues.batteryPercent !== null && formValues.batteryPercent !== undefined &&
    formValues.tripDistanceKm !== '' && formValues.tripDistanceKm !== null && formValues.tripDistanceKm !== undefined && Number(formValues.tripDistanceKm) > 0
  );

  const calculate = useCallback(async () => {
    if (!canCalculate) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, canCalculate]);

  // Trip Planner: resolves a from/to route to a distance, then updates the
  // single shared Trip Distance field — everything downstream (Cost
  // Estimate, Charging Recommendation, Battery at Destination) reads from
  // that one value, so it can never disagree with the Trip Planner.
  const planTrip = useCallback(async (from, to) => {
    setTripPlanner({ from, to, status: 'loading', message: null });
    const response = await evRangeCalculatorService.getTripDistance(from, to);

    if (response.success && response.data) {
      setFormValues((prev) => ({ ...prev, tripDistanceKm: response.data.distanceKm }));
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

  // Recalculate whenever trip distance changes (either typed directly or
  // resolved via the Trip Planner), so every card stays in sync.
  useEffect(() => {
    if (status === 'success') {
      calculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.tripDistanceKm]);

  return {
    formValues,
    selectedVehicle,
    vehicleOptions,
    vehicleSearchLoading,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    canCalculate,
    result,
    error,
    tripPlanner,
    searchVehicles,
    selectVehicle,
    updateField,
    calculate,
    planTrip,
  };
};

export default useEvRangeCalculator;
