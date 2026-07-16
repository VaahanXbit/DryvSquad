/*
================================================================================
File: frontend/src/components/PaymentLoader.jsx
Responsibility: Generic full-screen overlay shown while a payment is being
                created or verified. No feature-specific text — the message
                is passed in as a prop.
================================================================================
*/

export default function PaymentLoader({ message = 'Processing payment…' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="glass-card px-8 py-6 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-theme border-t-yellow-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-theme-secondary">{message}</p>
      </div>
    </div>
  );
}