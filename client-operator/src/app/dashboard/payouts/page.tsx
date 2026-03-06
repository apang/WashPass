'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Payout {
  id: string;
  amount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/payouts')
      .then((res) => setPayouts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading payouts...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payouts</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-sm">{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm font-semibold">${(p.amount / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payouts.length === 0 && <p className="p-8 text-center text-gray-500">No payouts yet</p>}
      </div>
    </div>
  );
}
