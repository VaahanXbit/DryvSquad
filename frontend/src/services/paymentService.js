/*
================================================================================
File: frontend/src/services/paymentService.js
Responsibility: Frontend API client for the Payment Module.

                Your existing `api.js` is NOT an axios instance — it's a
                plain object of named async functions that each call the
                browser's native fetch() directly (see api.submitLead,
                api.getAllLeads, etc.), and it takes the JWT as an explicit
                `token` argument per call rather than via a shared
                interceptor. This file follows that exact same pattern —
                same API_URL resolution, same fetch/JSON style — so it's
                consistent with the rest of your codebase, not a foreign
                axios-based file bolted on.

                Auth: every function below accepts an optional `token` as
                its LAST argument, matching your convention (e.g.
                `getCurrentUser: async (token)`). If you don't pass one,
                it falls back to auto-detecting a token already sitting in
                localStorage under a few common key names. If your login
                flow (AuthModal.jsx) stores the JWT under a different key,
                either add it to TOKEN_KEYS below, or pass the token in
                explicitly from the calling component — one line either way.
================================================================================
*/

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

// Common localStorage key names apps use for the JWT. First match wins.
// If your AuthModal.jsx stores it under something else, add that key here.
const TOKEN_KEYS = ['token', 'authToken', 'ds_token', 'jwtToken', 'accessToken'];

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

async function handleResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    console.error('❌ Payment response parsing error:', error);
    return { success: false, message: 'Server error. Please try again.' };
  }
}

async function paymentFetch(path, { method = 'GET', body, token } = {}) {
  const authToken = token || getStoredToken();

  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${API_URL}/payment${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error('❌ Payment network error:', error);
    throw new Error('Network error. Please check your connection.');
  }

  const data = await handleResponse(response);

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Payment request failed (${response.status})`);
  }

  return data;
}

export async function createOrder(
  { resourceType, resourceId, resourceName, amount, currency = 'INR', metadata = {} },
  token
) {
  return paymentFetch('/create-order', {
    method: 'POST',
    body: { resourceType, resourceId, resourceName, amount, currency, metadata },
    token,
  }); // { success, order, paymentId }
}

export async function verifyPayment(
  { paymentId, providerOrderId, providerPaymentId, providerSignature },
  token
) {
  return paymentFetch('/verify', {
    method: 'POST',
    body: { paymentId, providerOrderId, providerPaymentId, providerSignature },
    token,
  }); // { success, payment }
}

export async function getPaymentStatus(paymentId, token) {
  return paymentFetch(`/status/${paymentId}`, { token }); // { success, payment }
}

export async function getPaymentHistory({ page = 1, limit = 20, resourceType } = {}, token) {
  const params = new URLSearchParams({ page, limit, ...(resourceType ? { resourceType } : {}) });
  return paymentFetch(`/history?${params.toString()}`, { token }); // { success, items, pagination }
}