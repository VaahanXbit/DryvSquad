/*
================================================================================
File: frontend/src/components/PaymentFailureModal.jsx
Responsibility: Generic "payment failed" modal with an optional retry action.
================================================================================
*/

export default function PaymentFailureModal({ open, errorMessage, onRetry, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="card p-6 w-full max-w-sm text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-2xl">
          ✕
        </div>
        <h3 className="text-lg font-semibold mb-1 text-theme-primary">Payment Failed</h3>
        <p className="text-sm text-theme-tertiary mb-4">
          {errorMessage || 'Something went wrong while processing your payment.'}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
          {onRetry && (
            <button onClick={onRetry} className="btn-primary flex-1">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}