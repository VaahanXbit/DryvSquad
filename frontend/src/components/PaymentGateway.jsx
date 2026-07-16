/*
================================================================================
File: frontend/src/components/PaymentGateway.jsx
Responsibility: The ONLY place in the frontend that talks to a provider's
                checkout SDK directly (currently Razorpay). Exposes one
                generic function, openCheckout(), that PaymentButton.jsx
                calls without knowing which provider is behind it. Renders
                nothing itself — intentionally headless, so swapping
                providers later never touches PaymentButton.jsx.
================================================================================
*/

import { loadRazorpayScript } from '../utils/paymentHelper';

/**
 * Opens the provider checkout for a given order and resolves with the
 * provider's callback payload, or rejects on failure/dismissal.
 *
 * @param {Object} params
 * @param {Object} params.order        - order object returned by createOrder() (includes Razorpay's public key)
 * @param {string} params.name         - business/app name shown in the checkout modal
 * @param {string} params.description  - short description shown in the checkout modal
 * @param {Object} [params.prefill]    - { name, email, contact }
 * @param {Object} [params.theme]      - { color } — defaults to brand gold to match the site
 */
export async function openCheckout({ order, name, description, prefill = {}, theme = {} }) {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    throw new Error('Unable to load the payment checkout. Please check your connection and try again.');
  }

  // Brand gold (#C69327) — matches your tailwind.config.js `yellow-500` remap.
  // Razorpay's own checkout iframe can't read your CSS variables, so the
  // color is passed explicitly here. Override via the `theme` prop if a
  // specific feature ever needs a different accent.
  const checkoutTheme = { color: '#C69327', ...theme };

  return new Promise((resolve, reject) => {
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name,
      description,
      prefill,
      theme: checkoutTheme,
      handler: (response) => {
        resolve({
          providerOrderId: response.razorpay_order_id,
          providerPaymentId: response.razorpay_payment_id,
          providerSignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled')),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}