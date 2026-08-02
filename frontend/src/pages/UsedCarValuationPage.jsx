// src/pages/UsedCarValuationPage.jsx
/*
================================================================================
File Name : UsedCarValuationPage.jsx
Description : Page-level component for the Used Car Valuation Tool.
              Register at /used-car-valuation in App.jsx. Layout follows
              the same two-column "Inputs" / "Results" pattern as
              EvRangeCalculatorPage — compact left form, professional
              right-side valuation dashboard, stacking on mobile.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { Info } from 'lucide-react';
import useUsedCarValuation from '../hooks/useUsedCarValuation';
import { InputsPanel, ResultCard } from '../components/tools/usedCarValuation';

const UsedCarValuationPage = () => {
  const {
    formValues,
    advancedDetails,
    location,
    brands,
    models,
    variants,
    brandsLoading,
    modelsLoading,
    variantsLoading,
    isLoading,
    isSuccess,
    isError,
    canValuate,
    result,
    error,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    updateRegistrationYear,
    selectBrand,
    selectModel,
    selectCity,
    updateField,
    updateAdvancedDetail,
    valuate,
    selectSimilarCar,
  } = useUsedCarValuation();

  return (
    <div className="bg-theme-primary min-h-screen">
      {/* Balanced padding: uses CSS variable for header height */}
      <div 
        className="container-custom pb-6"
        style={{ paddingTop: 'calc(var(--header-height, 72px) + 1.5rem)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl">
              Used Car Valuation Tool
              <Info className="w-4 h-4 text-theme-tertiary" />
            </h1>
            <p className="text-theme-tertiary mt-1">Get the most accurate value for your car in just a few minutes.</p>
          </div>
        </div>
      </div>

      <div className="container-custom pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <InputsPanel
            formValues={formValues}
            advancedDetails={advancedDetails}
            location={location}
            brands={brands}
            models={models}
            variants={variants}
            brandsLoading={brandsLoading}
            modelsLoading={modelsLoading}
            variantsLoading={variantsLoading}
            onUpdateRegistrationYear={updateRegistrationYear}
            onSelectBrand={selectBrand}
            onSelectModel={selectModel}
            onSelectCity={selectCity}
            onUpdateField={updateField}
            onUpdateAdvancedDetail={updateAdvancedDetail}
            onValuate={valuate}
            isValuating={isLoading}
            canValuate={canValuate}
          />

          {isSuccess && result && (
            <ResultCard
              result={result}
              isDrawerOpen={isDrawerOpen}
              onOpenDrawer={openDrawer}
              onCloseDrawer={closeDrawer}
              onSelectSimilarCar={selectSimilarCar}
            />
          )}

          {isLoading && (
            <div className="card flex flex-col items-center justify-center text-center px-6 py-20">
              <div
                className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mb-4"
                style={{ borderColor: 'var(--brand-gold)', borderTopColor: 'transparent' }}
              />
              <p className="font-semibold text-theme-primary mb-1">Calculating your valuation...</p>
              <p className="text-sm text-theme-tertiary">This only takes a moment.</p>
            </div>
          )}

          {isError && (
            <div className="card p-6 flex flex-col items-center text-center py-14">
              <p className="font-semibold text-theme-primary mb-1">Couldn&apos;t estimate your car&apos;s value</p>
              <p className="text-sm text-theme-tertiary mb-4">{error?.message}</p>
              <button type="button" onClick={valuate} className="btn-secondary py-2 px-5">
                Try Again
              </button>
            </div>
          )}

          {!isSuccess && !isError && !isLoading && (
            <div className="card flex flex-col items-center justify-center text-center px-6 py-20">
              <p className="font-semibold text-theme-primary mb-1">Your estimated value will appear here</p>
              <p className="text-sm text-theme-tertiary max-w-sm">
                Select your registration year, vehicle and a few details, then tap Get My Valuation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsedCarValuationPage;