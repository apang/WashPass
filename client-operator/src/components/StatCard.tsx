interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({ title, value, subtitle, color = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
