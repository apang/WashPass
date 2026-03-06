'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Dispute {
  id: string;
  status: string;
  type: string;
  description: string;
  createdAt: string;
  member: { fullName: string };
  redemption: { location: { name: string } };
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/disputes')
      .then((res) => setDisputes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading disputes...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Disputes</h1>
      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{d.type}</p>
                <p className="text-sm text-gray-500 mt-1">By {d.member?.fullName} at {d.redemption?.location?.name}</p>
                <p className="text-sm text-gray-700 mt-3">{d.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {d.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3">{new Date(d.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {disputes.length === 0 && <p className="text-gray-500">No disputes</p>}
      </div>
    </div>
  );
}
