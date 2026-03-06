'use client';

import { useAuthStore } from '../../../stores/authStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="text-gray-900">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
