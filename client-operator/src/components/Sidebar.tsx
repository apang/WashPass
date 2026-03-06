'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, QrCode, MapPin, DollarSign, Users, AlertTriangle, Settings, LogOut } from 'lucide-react';
import { logoutOperator } from '../lib/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/scan', label: 'Scan Code', icon: QrCode },
  { href: '/dashboard/redemptions', label: 'Redemptions', icon: BarChart3 },
  { href: '/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/dashboard/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/dashboard/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/dashboard/staff', label: 'Staff', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutOperator();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">WashPass</h1>
        <p className="text-xs text-gray-400 mt-1">Operator Dashboard</p>
      </div>
      <nav className="flex-1 px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
