'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '../../../lib/api';
import { MapPin } from 'lucide-react';

const LocationMap = dynamic(() => import('../../../components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />
  ),
});

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: string;
  avgRating: number;
  totalRatings: number;
  latitude: number;
  longitude: number;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/v1/locations')
      .then((res) => setLocations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading locations...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="h-[400px]">
          <LocationMap
            locations={locations}
            selectedLocationId={selectedLocationId}
            onMarkerClick={(id) => setSelectedLocationId(id)}
          />
        </div>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            onClick={() => setSelectedLocationId(loc.id)}
            className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all ${
              selectedLocationId === loc.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{loc.address}, {loc.city}, {loc.state}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${loc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {loc.status}
                  </span>
                  <span className="text-sm text-gray-500">★ {loc.avgRating.toFixed(1)} ({loc.totalRatings})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {locations.length === 0 && <p className="text-gray-500">No locations yet</p>}
      </div>
    </div>
  );
}
