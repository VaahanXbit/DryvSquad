// src/components/tools/usedCarValuation/CitySelector.jsx
/*
================================================================================
File Name : CitySelector.jsx
Description : "Registration City" field — a searchable, debounced
              dropdown, NOT the reusable global LocationModal (manager
              decision: this tool should never open the "Use My Current
              Location" / full-screen location picker). Queries the
              EXISTING site-wide location search endpoint
              (usedCarValuationService.searchLocations -> the same
              /api/location/search + Location collection every other
              search-driven location UI in the project uses) — no new
              city dataset, no new API.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search } from 'lucide-react';
import usedCarValuationService from '../../../services/usedCarValuationService';

const DEBOUNCE_MS = 300;

const CitySelector = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value?.city || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the input text in sync if the selected city changes elsewhere
  // (e.g. a Similar Cars click repopulates the form).
  useEffect(() => {
    setQuery(value?.city || '');
  }, [value?.city]);

  const updateMenuRect = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setMenuRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    updateMenuRect();

    const handleReposition = () => updateMenuRect();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedContainer = containerRef.current?.contains(e.target);
      const clickedMenu = e.target.closest?.('[data-city-portal-menu]');
      if (!clickedContainer && !clickedMenu) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = text.trim();
    if (trimmed.length < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      const response = await usedCarValuationService.searchLocations(trimmed);
      setIsLoading(false);
      setResults(response.success ? response.data || [] : []);
    }, DEBOUNCE_MS);
  };

  const handleSelect = (place) => {
    onSelect({
      city: place.city,
      district: place.district,
      state: place.state,
      stateCode: place.stateCode,
      pincode: place.pincode,
      country: place.country || 'India',
    });
    setQuery(place.city);
    setIsOpen(false);
  };

  const showMenu = isOpen && query.trim().length > 0 && menuRect;

  return (
    <div ref={containerRef} className="relative">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary mb-2">
        <MapPin className="w-4 h-4 text-theme-tertiary" />
        Registration City
      </label>
      <div className="relative">
        <Search className="w-4 h-4 text-theme-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city, e.g. Hyderabad"
          className="input-field w-full pl-9"
          autoComplete="off"
        />
      </div>

      {showMenu && createPortal(
        <div
          data-city-portal-menu
          className="fixed z-[200] max-h-56 overflow-y-auto rounded-lg border shadow-lg"
          style={{
            top: menuRect.top,
            left: menuRect.left,
            width: menuRect.width,
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {isLoading && (
            <p className="text-center text-sm text-theme-tertiary py-4">Searching...</p>
          )}
          {!isLoading && results.length === 0 && (
            <p className="text-center text-sm text-theme-tertiary py-4">No matching city found.</p>
          )}
          {!isLoading && results.map((place) => (
            <button
              key={place._id}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-3 py-2.5 hover:bg-theme-tertiary transition-colors flex flex-col"
            >
              <span className="text-sm font-semibold text-theme-primary">{place.city}</span>
              <span className="text-xs text-theme-tertiary">{place.district}, {place.state}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CitySelector;