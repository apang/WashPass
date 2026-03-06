'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import StatCard from '../../components/StatCard';

interface DashboardData {
  totalRedemptions: number;
  totalRevenue: number;
  avgRating: number;
  pendingPayoutAmount: number;
  locationCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/analytics/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading dashboard...</p></div>;
  if (!data) return <div className="text-red-500">Failed to load dashboard data</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Redemptions (This Month)" value={data.totalRedemptions} />
        <StatCard title="Revenue" value={`$${(data.totalRevenue / 100).toFixed(2)}`} color="text-green-600" />
        <StatCard title="Average Rating" value={data.avgRating.toFixed(1)} subtitle="out of 5.0" />
        <StatCard title="Pending Payout" value={`$${(data.pendingPayoutAmount / 100).toFixed(2)}`} color="text-blue-600" />
      </div>
    </div>
  );
}
