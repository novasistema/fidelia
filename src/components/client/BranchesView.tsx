import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { branches, storeSettings } = useLoyalty();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Nuestras Sucursales</h1>
          <p className="text-xs text-slate-500 mt-1">
            Encontrá la sucursal de {storeSettings.name} más cercana para sumar puntos y retirar tus canjes.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <MapPin className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  {branch.isMain ? 'Sucursal Central' : 'Sucursal Local'}
                </span>
                <h3 className="font-extrabold text-slate-800 text-lg mt-1">
                  {branch.name}
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>{branch.address}, {branch.city}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>{branch.hours}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(branch.address + ', ' + branch.city)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>Cómo llegar con Google Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
