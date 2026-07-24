// src/components/tools/evRangeCalculator/TripPlanner.jsx
import { useState } from 'react';
import { ArrowLeftRight, Route, Car, Clock, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

const CIRCLE_RADIUS = 32;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * Small circular gauge showing battery percentage remaining at destination.
 */
const BatteryGauge = ({ percent }) => {
  const offset = CIRCLE_CIRCUMFERENCE * (1 - percent / 100);
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={CIRCLE_RADIUS} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#16a34a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-theme-primary">{percent}%</span>
      </div>
    </div>
  );
};

/**
 * "Trip Planner" — From/To fields resolve a distance via planTrip(), and
 * the Charging Recommendation reflects whether the current estimated
 * range can cover that trip.
 */
const TripPlanner = ({ vehicleName, result, tripPlannerState, onPlanTrip }) => {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Jaipur');
  const [showChargingStops, setShowChargingStops] = useState(false);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePlan = () => {
    if (from.trim() && to.trim()) onPlanTrip(from.trim(), to.trim());
  };

  const tripPlan = result?.tripPlanner;

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-semibold text-theme-primary mb-4">Trip Planner</h3>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end mb-5">
        <div>
          <label className="block text-xs text-theme-tertiary mb-1.5">From</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onBlur={handlePlan}
            className="input-field w-full"
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap from and to"
          className="w-9 h-9 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <ArrowLeftRight className="w-4 h-4 text-theme-tertiary" />
        </button>
        <div>
          <label className="block text-xs text-theme-tertiary mb-1.5">To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onBlur={handlePlan}
            className="input-field w-full"
          />
        </div>
      </div>

      {tripPlannerState.status === 'error' && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">{tripPlannerState.message}</p>
      )}

      {tripPlan && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <span className="flex items-center gap-1.5 text-xs text-theme-tertiary mb-1">
                <Route className="w-3.5 h-3.5" />
                Distance
              </span>
              <p className="font-bold text-theme-primary">{tripPlan.tripDistanceKm} km</p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs text-theme-tertiary mb-1">
                <Car className="w-3.5 h-3.5" />
                Vehicle
              </span>
              <p className="font-bold text-theme-primary truncate">{vehicleName}</p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs text-theme-tertiary mb-1">
                <Clock className="w-3.5 h-3.5" />
                Est. Range (Today)
              </span>
              <p className="font-bold text-theme-primary">{result.estimatedRealWorldRangeKm} km</p>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: tripPlan.tripPossible ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.1)',
            }}
          >
            <div className="flex items-start gap-3 flex-1">
              {tripPlan.tripPossible ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold ${tripPlan.tripPossible ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {tripPlan.tripPossible ? 'No Charging Required' : 'Charging Required'}
                </p>
                <p className="text-sm text-theme-tertiary mt-0.5">
                  {tripPlan.tripPossible
                    ? 'You can reach your destination without any charging stop.'
                    : 'You will need to charge along the way to complete this trip.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryGauge percent={tripPlan.remainingBatteryPercent} />
              <span className="text-xs text-theme-tertiary">Battery at Destination</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-theme-tertiary">Want to see charging stops just in case?</span>
            <button
              type="button"
              onClick={() => setShowChargingStops((prev) => !prev)}
              className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Zap className="w-4 h-4" />
              Show Charging Stops
            </button>
          </div>

          {showChargingStops && (
            <p className="text-sm text-theme-tertiary mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              Charging station lookup is coming soon for this route.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TripPlanner;
