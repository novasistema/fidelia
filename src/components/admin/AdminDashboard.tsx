import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { PlanUsage } from './PlanUsage';
import {
  Users,
  Zap,
  Gift,
  TrendingUp,
  DollarSign,
  Award,
  ArrowUpRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { customers, movements, vouchers, rewards, tiers, storeSettings } = useLoyalty();

  const totalPointsIssued = movements
    .filter(m => m.points > 0)
    .reduce((sum, m) => sum + m.points, 0);

  const totalPointsRedeemed = movements
    .filter(m => m.points < 0)
    .reduce((sum, m) => sum + Math.abs(m.points), 0);

  const totalRedemptionsCount = vouchers.length;

  const averageTicket = 36497; // Sample matching photo 8 ($36.497)

  // Chart data for customer registrations / growth over time
  const growthData = [
    { month: 'Ago 2025', clientes: 7100, puntos: 12000 },
    { month: 'Sep 2025', clientes: 7600, puntos: 18000 },
    { month: 'Oct 2025', clientes: 8100, puntos: 25000 },
    { month: 'Nov 2025', clientes: 8800, puntos: 34000 },
    { month: 'Dic 2025', clientes: 9300, puntos: 42000 },
    { month: 'Ene 2026', clientes: 9600, puntos: 51000 },
    { month: 'Feb 2026', clientes: 10100, puntos: 69057 }
  ];

  // Loyalty pyramid data matching photo 6
  const pyramidData = [
    { name: 'VIP', value: 125, color: '#eab308' },
    { name: 'Habituales', value: 306, color: '#0284c7' },
    { name: 'Ocasionales', value: 439, color: '#f97316' },
    { name: 'Nuevos', value: 130, color: '#10b981' }
  ];

  // Top 5 customers by points
  const topCustomers = [...customers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      <PlanUsage />
      {/* Header Greeting - Matching photo 8 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase rounded-full border border-indigo-100">
            Panel de Control del Comercio
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            ¡Hola, Administrador!
          </h1>
          <p className="text-xs text-slate-500">
            Resumen en tiempo real del rendimiento de tu programa de fidelización <strong className="text-slate-800">{storeSettings.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema En Línea</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards - Matching photo 7 & 8 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clientes Registrados</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            399 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+78%</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">¡Muy bien! Estás progresando</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Puntos Entregados</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {totalPointsIssued.toLocaleString()} <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+27%</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">¡Muy bien! Estás progresando</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premios Canjeados</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {totalRedemptionsCount} <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+61%</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Frecuencia de canjes en alza</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            ${averageTicket.toLocaleString()} <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+112%</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Aumento sostenido por fidelización</p>
        </div>
      </div>

      {/* Charts Row - Matching photo 6 & 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Cantidad de Clientes & Puntos</h3>
              <p className="text-xs text-slate-400">Información actualizada al día de hoy</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
              Últimos 6 meses
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="puntos" stroke="#0284c7" fillOpacity={1} fill="url(#colorPoints)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Loyalty Pyramid / Tiers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base">Pirámide de Lealtad</h3>
          <p className="text-xs text-slate-400">Distribución de base de clientes por nivel</p>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pyramidData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pyramidData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pyramidData.map(p => (
              <div key={p.name} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-bold text-slate-700">{p.name}: {p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Customers Section - Matching Photo 8 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Mejores Clientes con más puntos acumulados</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">DNI / Email</th>
                <th className="p-3">Nivel</th>
                <th className="p-3 text-right">Puntos Acumulados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-bold text-slate-800 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {cust.name[0]}
                    </div>
                    <span>{cust.name} {cust.lastName}</span>
                  </td>
                  <td className="p-3 text-slate-500">{cust.email}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                      {cust.tierId.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-sky-600 text-sm">
                    ⚡ {cust.points.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
