/*
================================================================================
File: frontend/src/pages/PaymentTest.jsx
Responsibility: A throwaway page purely for verifying the Payment Module
                works end-to-end (create-order -> Razorpay checkout ->
                verify -> history). Not a real feature — safe to delete
                once you've confirmed everything works, and safe to leave
                since it doesn't touch any other page.
================================================================================
*/

import { useEffect, useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { getPaymentHistory } from '../services/paymentService';

const TEST_RESOURCE_TYPES = ['PDF', 'AI_CHAT', 'MEMBERSHIP', 'REPORT', 'LOAN', 'INSURANCE'];

export default function PaymentTest() {
  const [resourceType, setResourceType] = useState('PDF');
  const [amount, setAmount] = useState(1); // ₹1 — keep test payments cheap
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const addLog = (line) => setLog((prev) => [`${new Date().toLocaleTimeString()} — ${line}`, ...prev]);

  const refreshHistory = async () => {
    setLoadingHistory(true);
    try {
      const { items } = await getPaymentHistory({ limit: 10 });
      setHistory(items);
    } catch (err) {
      addLog(`❌ Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  return (
    <div className="container-custom py-12 max-w-2xl">
      <h1 className="mb-2">Payment Module — Test Page</h1>
      <p className="text-theme-tertiary mb-8">
        Use this page only to verify the Payment Module wiring (auth → create-order → Razorpay
        checkout → verify → history). Requires being logged in, and RAZORPAY_KEY_ID /
        RAZORPAY_KEY_SECRET set on the backend (use Razorpay test-mode keys).
      </p>

      <div className="card p-6 mb-8">
        <h3 className="mb-4">Trigger a test payment</h3>

        <label className="block text-sm font-medium text-theme-secondary mb-1">Resource type</label>
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          className="input-field mb-4"
        >
          {TEST_RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-theme-secondary mb-1">Amount (₹)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="input-field mb-6"
        />

        <PaymentButton
          resourceType={resourceType}
          resourceId="test-run"
          resourceName={`Test payment — ${resourceType}`}
          amount={amount}
          metadata={{ source: 'PaymentTest page' }}
          label={`Pay ₹${amount} to test`}
          onSuccess={(payment) => {
            addLog(`✅ Success — paymentId ${payment._id}, status ${payment.status}`);
            refreshHistory();
          }}
          onFailure={(err) => addLog(`❌ Failed — ${err.message}`)}
        />
      </div>

      <div className="card p-6 mb-8">
        <h3 className="mb-3">Event log</h3>
        {log.length === 0 ? (
          <p className="text-sm text-theme-tertiary">Nothing yet — trigger a payment above.</p>
        ) : (
          <ul className="text-sm font-mono space-y-1 text-theme-secondary">
            {log.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3>Your payment history</h3>
          <button onClick={refreshHistory} className="btn-secondary py-1.5 px-3 text-sm">
            {loadingHistory ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-theme-tertiary">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-theme-tertiary border-b border-theme">
                <th className="py-2">Resource</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p._id} className="border-b border-theme">
                  <td className="py-2 text-theme-primary">{p.resourceType}</td>
                  <td className="py-2 text-theme-primary">{p.currency} {p.amount}</td>
                  <td className="py-2">
                    <span
                      className={
                        p.status === 'SUCCESS'
                          ? 'text-green-600 dark:text-green-400'
                          : p.status === 'FAILED'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-theme-tertiary'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 text-theme-tertiary">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}