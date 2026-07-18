/*
================================================================================
File: frontend/src/components/PaymentSuccessModal.jsx
Responsibility: Generic "payment succeeded" modal. Takes plain props so any
                feature can customize the copy without this component
                knowing what the feature is.
================================================================================
*/

export default function PaymentSuccessModal({ open, amount, currency = 'INR', resourceName, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="card p-6 w-full max-w-sm text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl">
          ✓
        </div>
        <h3 className="text-lg font-semibold mb-1 text-theme-primary">Payment Successful</h3>
        <p className="text-sm text-theme-tertiary mb-4">
          {resourceName ? `Payment for ${resourceName} completed.` : 'Your payment has been completed.'}
          {amount ? ` (${currency} ${amount})` : ''}
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          Continue
        </button>
      </div>
    </div>
  );
}