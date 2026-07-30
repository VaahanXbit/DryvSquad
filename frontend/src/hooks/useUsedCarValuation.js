// src/hooks/useUsedCarValuation.js
/*
================================================================================
File Name : useUsedCarValuation.js
Description : Single entry point every Used Car Valuation component uses.

              Flow order — Registration Year FIRST, then Brand, then
              Model (server-filtered by Model.launchYear/discontinuedYear
              against the selected year), then Variant (not year-filtered
              — every variant of a valid Model loads normally). Changing
              Registration Year clears Brand/Model/Variant AND any
              previous valuation result, then re-fetches Models filtered
              by the new year — an invalid combination can never linger.

              Registration City is now LOCAL state, populated by
              CitySelector's own searchable dropdown (which itself calls
              the existing /api/location/search endpoint) — this hook does
              NOT read from or open the site-wide global LocationModal for
              this tool.

              selectSimilarCar() lets a "Similar Cars in Market" row
              re-drive this exact same form/hook (Brand -> Model ->
              Variant -> revalue) without navigating to another page.

              No valuation math happens in this hook — it only sends
              inputs and renders whatever the backend returns.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useCallback, useEffect, useState } from 'react';
import usedCarValuationService from '../services/usedCarValuationService';
import { DEFAULT_FORM_VALUES, DEFAULT_ADVANCED_DETAILS } from '../constants/usedCarValuation';

export const useUsedCarValuation = () => {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [advancedDetails, setAdvancedDetails] = useState(DEFAULT_ADVANCED_DETAILS);
  const [location, setLocation] = useState(null);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load brands once on mount — never year-filtered, never hardcoded.
  useEffect(() => {
    (async () => {
      setBrandsLoading(true);
      const response = await usedCarValuationService.getBrands();
      setBrandsLoading(false);
      if (response.success) setBrands(response.data);
    })();
  }, []);

  const updateRegistrationYear = useCallback((registrationYear) => {
    // Changing the year invalidates whatever Brand/Model/Variant was
    // already selected, AND any previous valuation result on screen —
    // both are cleared so a stale, possibly impossible combination (or
    // a result computed for the old year) can never linger.
    setFormValues((prev) => ({ ...prev, registrationYear, brandId: null, modelId: null, variantId: null }));
    setModels([]);
    setVariants([]);
    setResult(null);
    setStatus('idle');
  }, []);

  const selectBrand = useCallback(async (brandId) => {
    setFormValues((prev) => ({ ...prev, brandId, modelId: null, variantId: null }));
    setModels([]);
    setVariants([]);
    if (!brandId) return;

    setModelsLoading(true);
    const response = await usedCarValuationService.getModels(brandId, formValues.registrationYear);
    setModelsLoading(false);
    if (response.success) setModels(response.data);
  }, [formValues.registrationYear]);

  const selectModel = useCallback(async (modelId) => {
    setFormValues((prev) => ({ ...prev, modelId, variantId: null }));
    setVariants([]);
    if (!modelId) return;

    setVariantsLoading(true);
    const response = await usedCarValuationService.getVariants(modelId);
    setVariantsLoading(false);
    if (response.success) setVariants(response.data);
  }, []);

  const updateField = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateAdvancedDetail = useCallback((key, value) => {
    setAdvancedDetails((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canValuate = Boolean(
    formValues.registrationYear &&
    formValues.variantId &&
    location?.city &&
    formValues.kilometersDriven !== '' && formValues.kilometersDriven !== null && formValues.kilometersDriven !== undefined &&
    formValues.ownerNumber
  );

  const runValuation = useCallback(async (values, advanced, loc) => {
    if (!loc?.city) return;

    setStatus('loading');
    setError(null);

    const filledAdvancedDetails = Object.fromEntries(
      Object.entries(advanced || {}).filter(([, v]) => v)
    );

    const response = await usedCarValuationService.valuate({
      ...values,
      location: {
        city: loc.city,
        state: loc.state,
        stateCode: loc.stateCode,
        pincode: loc.pincode,
      },
      advancedDetails: filledAdvancedDetails,
    });

    if (response.success && response.data) {
      setStatus('success');
      setResult(response.data);
    } else {
      setStatus('error');
      setError({ message: response.message || 'Something went wrong. Please try again.' });
    }
  }, []);

  const valuate = useCallback(async () => {
    if (!formValues.registrationYear || !formValues.variantId || !formValues.kilometersDriven || !formValues.ownerNumber || !location?.city) return;
    await runValuation(formValues, advancedDetails, location);
  }, [formValues, advancedDetails, location, runValuation]);

  // "Similar Cars in Market" — clicking a model name re-drives this exact
  // form (Brand -> Model -> Variant -> revalue) on the same page, per the
  // product review. Advanced Details are intentionally reset — they were
  // never meaningful for a DIFFERENT vehicle than the one they were
  // filled in for.
  const selectSimilarCar = useCallback(async (car) => {
    if (!car?.brandId || !car?.modelId || !car?.variantId) return;

    // Scroll to the top of the page immediately so the person sees the
    // Estimated Market Value area go into a loading state — reads as
    // "recalculating" rather than a silent, easy-to-miss update further
    // down the page.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setResult(null);
    setStatus('loading');
    setAdvancedDetails(DEFAULT_ADVANCED_DETAILS);

    const nextFormValues = {
      ...formValues,
      registrationYear: car.year || formValues.registrationYear,
      brandId: car.brandId,
      modelId: car.modelId,
      variantId: car.variantId,
    };
    setFormValues(nextFormValues);

    setModelsLoading(true);
    const modelsResponse = await usedCarValuationService.getModels(car.brandId, nextFormValues.registrationYear);
    setModelsLoading(false);
    if (modelsResponse.success) setModels(modelsResponse.data);

    setVariantsLoading(true);
    const variantsResponse = await usedCarValuationService.getVariants(car.modelId);
    setVariantsLoading(false);
    if (variantsResponse.success) setVariants(variantsResponse.data);

    await runValuation(nextFormValues, DEFAULT_ADVANCED_DETAILS, location);
  }, [formValues, location, runValuation]);

  return {
    formValues,
    advancedDetails,
    location,
    brands,
    models,
    variants,
    brandsLoading,
    modelsLoading,
    variantsLoading,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    canValuate,
    result,
    error,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    updateRegistrationYear,
    selectBrand,
    selectModel,
    selectCity: setLocation,
    updateField,
    updateAdvancedDetail,
    valuate,
    selectSimilarCar,
  };
};

export default useUsedCarValuation;