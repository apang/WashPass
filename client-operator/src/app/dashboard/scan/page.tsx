'use client';

import { useState } from 'react';
import api from '../../../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  memberName?: string;
  planTier?: string;
  redemptionId?: string;
}

export default function ScanPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const { data } = await api.post('/v1/redemptions/validate', { code: code.trim() });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Validate Wash Code</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Code</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code or scan QR"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg text-center tracking-widest font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Validate Code'}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600" size={28} />
            <span className="text-xl font-bold text-green-800">Valid!</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm"><span className="font-medium">Member:</span> {result.memberName}</p>
            <p className="text-sm"><span className="font-medium">Plan:</span> {result.planTier}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={28} />
            <span className="text-lg font-bold text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
