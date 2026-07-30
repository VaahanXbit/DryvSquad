// src/components/tools/usedCarValuation/InputsPanel.jsx
/*
================================================================================
File Name : InputsPanel.jsx
Description : Left column — "Vehicle Details". Registration Year comes
              FIRST (per the product review), Brand/Model/Variant are
              disabled until it's set, and City/Kilometers/Owner follow —
              exactly the 7 required fields, nothing more. Advanced
              Details (Optional) is a separate collapsed section below,
              never required to submit.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { Lock, ShieldCheck } from 'lucide-react';
import BrandSelector from './BrandSelector';
import ModelSelector from './ModelSelector';
import VariantSelector from './VariantSelector';
import RegistrationYearInput from './RegistrationYearInput';
import CitySelector from './CitySelector';
import KilometerInput from './KilometerInput';
import OwnerSelector from './OwnerSelector';
import AdvancedDetailsSection from './AdvancedDetailsSection';

const InputsPanel = ({
  formValues,
  advancedDetails,
  location,
  brands,
  models,
  variants,
  brandsLoading,
  modelsLoading,
  variantsLoading,
  onUpdateRegistrationYear,
  onSelectBrand,
  onSelectModel,
  onSelectCity,
  onUpdateField,
  onUpdateAdvancedDetail,
  onValuate,
  isValuating,
  canValuate,
}) => {
  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-yellow-500 text-brand-navy dark:text-black flex-shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </span>
          <h2 className="font-bold text-theme-primary">Vehicle Details</h2>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RegistrationYearInput
              value={formValues.registrationYear}
              onChange={onUpdateRegistrationYear}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BrandSelector
              value={formValues.brandId}
              options={brands}
              isLoading={brandsLoading}
              disabled={!formValues.registrationYear}
              onChange={onSelectBrand}
            />

            <ModelSelector
              value={formValues.modelId}
              options={models}
              isLoading={modelsLoading}
              disabled={!formValues.brandId}
              onChange={onSelectModel}
            />

            <VariantSelector
              value={formValues.variantId}
              options={variants}
              isLoading={variantsLoading}
              disabled={!formValues.modelId}
              onChange={(v) => onUpdateField('variantId', v)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CitySelector value={location} onSelect={onSelectCity} />

            <KilometerInput
              value={formValues.kilometersDriven}
              onChange={(v) => onUpdateField('kilometersDriven', v)}
            />

            <OwnerSelector
              value={formValues.ownerNumber}
              onChange={(v) => onUpdateField('ownerNumber', v)}
            />
          </div>
        </div>
      </div>

      <AdvancedDetailsSection values={advancedDetails} onChange={onUpdateAdvancedDetail} />

      <div className="card p-5 sm:p-6">
        <button
          type="button"
          onClick={onValuate}
          disabled={isValuating || !canValuate}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isValuating ? 'Calculating your valuation...' : 'Get My Valuation'}
        </button>
        {!canValuate && !isValuating && (
          <p className="text-xs text-center text-theme-tertiary mt-3">
            Select registration year, brand, model, variant, city and enter the remaining details to continue.
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-theme-tertiary">✓ 100% Free</span>
          <span className="flex items-center gap-1 text-xs text-theme-tertiary">✓ No Sign-up Required</span>
          <span className="flex items-center gap-1 text-xs text-theme-tertiary">✓ Instant Result</span>
        </div>
      </div>

      <div className="flex items-start gap-2 px-1">
        <ShieldCheck className="w-4 h-4 text-theme-tertiary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-theme-tertiary">
          Your data is safe and secure. We never share your information with anyone.
        </p>
      </div>
    </div>
  );
};

export default InputsPanel;