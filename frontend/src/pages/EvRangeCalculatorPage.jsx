// src/pages/EvRangeCalculatorPage.jsx
/*
================================================================================
File Name : EvRangeCalculatorPage.jsx
Description : Page-level component for the Real World EV Range Calculator.
              Registered at /tools/ev-range-calculator in App.jsx. Layout
              follows the approved design: a two-column "Your Inputs" /
              "Your Results" layout on desktop, stacking on mobile, with the
              Trip Planner and feature strip below.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { Info, PlayCircle, Share2 } from 'lucide-react';
import useEvRangeCalculator from '../hooks/useEvRangeCalculator';
import {
  InputsPanel,
  ResultsPanel,
  TripPlanner,
  FeatureStrip,
} from '../components/tools/evRangeCalculator';

const EvRangeCalculatorPage = () => {
  const {
    formValues,
    selectedVehicle,
    vehicleOptions,
    vehicleSearchLoading,
    isLoading,
    isSuccess,
    isError,
    result,
    error,
    tripPlanner,
    searchVehicles,
    selectVehicle,
    updateField,
    updateAdvanced,
    calculate,
    planTrip,
  } = useEvRangeCalculator();

  const vehicleName = selectedVehicle ? `${selectedVehicle.manufacturer} ${selectedVehicle.model}` : '';

  return (
    <div className="bg-theme-primary min-h-screen">
      <div className="container-custom pt-8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl">
              Real World EV Range Calculator
              <Info className="w-4 h-4 text-theme-tertiary" />
            </h1>
            <p className="text-theme-tertiary mt-1">Calculate your real world driving range based on real conditions</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
              <PlayCircle className="w-4 h-4" />
              How it works
            </button>
            <button type="button" className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
              <Share2 className="w-4 h-4" />
              Share Result
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <InputsPanel
            formValues={formValues}
            selectedVehicle={selectedVehicle}
            vehicleOptions={vehicleOptions}
            vehicleSearchLoading={vehicleSearchLoading}
            onSearchVehicles={searchVehicles}
            onSelectVehicle={selectVehicle}
            onUpdateField={updateField}
            onUpdateAdvanced={updateAdvanced}
            onCalculate={calculate}
            isCalculating={isLoading}
          />

          {isSuccess && result && <ResultsPanel result={result} batteryPercent={formValues.batteryPercent} />}

          {isError && (
            <div className="card p-6 flex flex-col items-center text-center py-14">
              <p className="font-semibold text-theme-primary mb-1">Couldn't calculate your range</p>
              <p className="text-sm text-theme-tertiary mb-4">{error?.message}</p>
              <button type="button" onClick={calculate} className="btn-secondary py-2 px-5">
                Try Again
              </button>
            </div>
          )}

          {!isSuccess && !isError && (
            <div className="card flex flex-col items-center justify-center text-center px-6 py-20">
              <p className="font-semibold text-theme-primary mb-1">Your results will appear here</p>
              <p className="text-sm text-theme-tertiary max-w-sm">
                Fill in your trip and driving conditions, then tap Calculate Real Range.
              </p>
            </div>
          )}
        </div>

        {isSuccess && result && (
          <div className="mt-6">
            <TripPlanner
              vehicleName={vehicleName}
              result={result}
              tripPlannerState={tripPlanner}
              onPlanTrip={planTrip}
            />
          </div>
        )}
      </div>

      <FeatureStrip />
    </div>
  );
};

export default EvRangeCalculatorPage;
