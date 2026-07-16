/*
================================================================================
File: frontend/src/utils/paymentHelper.js
Responsibility: Small provider-agnostic helpers used by the payment
                components. Currently only the Razorpay checkout script
                loader lives here; a future provider's SDK loader would sit
                alongside it — never inside a feature's own code.
================================================================================
*/

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayScriptPromise = null;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export function formatAmount(amount, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}