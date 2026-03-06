'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Redemption {
  id: string;
  code: string;
  numericCode: string;
  status: string;
  createdAt: string;
  validatedAt?: string;
  location: { name: string };
  member: { fullName: string };
}

export default function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/redemptions')
      .then((res) => setRedemptions(res.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p className="text-gray-500">Loading redemptions...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Redemption History</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {redemptions.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{r.member?.fullName}</td>
                <td className="px-4 py-3 text-sm">{r.location?.name}</td>
                <td className="px-4 py-3 text-sm font-mono">{r.numericCode}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {redemptions.length === 0 && (
          <p className="p-8 text-center text-gray-500">No redemptions yet</p>
        )}
      </div>
    </div>
  );
}
