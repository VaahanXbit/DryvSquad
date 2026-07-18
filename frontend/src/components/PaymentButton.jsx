/*
================================================================================
File: frontend/src/components/PaymentButton.jsx
Responsibility: THE single entry point every feature uses to accept a
                payment. Fully generic — takes resourceType/resourceId/
                amount as props and knows nothing about PDF, AI Chat,
                Membership, Loan, Insurance, etc.

Usage (from any feature, no other file needed):

  <PaymentButton
    resourceType="AI_CHAT"
    resourceId="chat-question-limit"
    resourceName="Extra AI Questions"
    amount={49}
    onSuccess={(payment) => unlockMoreQuestions()}
  />
================================================================================
*/

import { useState } from 'react';
import * as paymentService from '../services/paymentService';
import { openCheckout } from './PaymentGateway';
import PaymentLoader from './PaymentLoader';
import PaymentSuccessModal from './PaymentSuccessModal';
import PaymentFailureModal from './PaymentFailureModal';

export default function PaymentButton({
  resourceType,
  resourceId = null,
  resourceName = null,
  amount,
  currency = 'INR',
  metadata = {},
  prefill = {},
  label = 'Pay Now',
  className = 'btn-primary disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed',
  onSuccess,
  onFailure,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Processing payment…');
  const [showSuccess, setShowSuccess] = useState(false);
  const [failure, setFailure] = useState(null);

  const handlePay = async () => {
    setFailure(null);
    setLoading(true);

    try {
      setLoaderMessage('Creating order…');
      const { order, paymentId } = await paymentService.createOrder({
        resourceType,
        resourceId,
        resourceName,
        amount,
        currency,
        metadata,
      });

      setLoaderMessage('Waiting for payment…');
      const checkoutResult = await openCheckout({
        order,
        name: 'DryvSquad',
        description: resourceName || resourceType,
        prefill,
      });

      setLoaderMessage('Verifying payment…');
      const { payment } = await paymentService.verifyPayment({ paymentId, ...checkoutResult });

      setLoading(false);
      setShowSuccess(true);
      onSuccess?.(payment);
    } catch (err) {
      setLoading(false);
      setFailure(err.message || 'Payment failed');
      onFailure?.(err);
    }
  };

  return (
    <>
      <button onClick={handlePay} disabled={disabled || loading} className={className}>
        {loading ? 'Processing…' : label}
      </button>

      {loading && <PaymentLoader message={loaderMessage} />}

      <PaymentSuccessModal
        open={showSuccess}
        amount={amount}
        currency={currency}
        resourceName={resourceName}
        onClose={() => setShowSuccess(false)}
      />

      <PaymentFailureModal
        open={!!failure}
        errorMessage={failure}
        onRetry={() => {
          setFailure(null);
          handlePay();
        }}
        onClose={() => setFailure(null)}
      />
    </>
  );
}