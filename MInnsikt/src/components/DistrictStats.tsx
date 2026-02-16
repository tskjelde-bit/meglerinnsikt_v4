
"use client";

import React from 'react';
import { DistrictData } from '@/types';
import { CITY_AVERAGE } from '@/constants';
import { TrendingUp, Clock, BarChart3, Coins } from 'lucide-react';

interface DistrictStatsProps {
  district: DistrictData | null;
  isExpanded: boolean;
  onOpenCalculator: () => void;
}

// Hjelpefunksjon for å sikre stor forbokstav
const capitalizeFirst = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Hjelpefunksjoner for fargekoding
const getTrendColor = (val: number) => {
  if (val >= 2.5) return 'text-emerald-400';
  if (val >= 1.5) return 'text-amber-400';
  return 'text-rose-400';
};

const getDaysColor = (val: number) => {
  if (val <= 18) return 'text-emerald-400';
  if (val <= 24) return 'text-amber-400';
  return 'text-rose-400';
};

const getSqmColor = (val: number) => {
  if (val >= 110000) return 'text-emerald-400';
  if (val >= 75000) return 'text-amber-400';
  return 'text-rose-400';
};

const getMedianColor = (val: number) => {
  if (val >= 7.0) return 'text-emerald-400';
  if (val >= 4.5) return 'text-amber-400';
  return 'text-rose-400';
};

// Logikk for generering av sammenligningstekster
const getComparisonTexts = (district: DistrictData) => {
  const trendDiff = Number((district.priceTrend - CITY_AVERAGE.priceTrend).toFixed(1));
  const trendPrep = trendDiff > 0.1 ? "over" : trendDiff < -0.1 ? "under" : "på nivå med";
  const trendInterp = trendDiff > 0.1 ? "Sterkere vekst." : trendDiff < -0.1 ? "Svakere vekst." : "Normal vekst.";
  const trendValStr = trendDiff > 0.1 ? `+${trendDiff}` : trendDiff < -0.1 ? `${trendDiff}` : "";
  
  const daysDiff = district.daysOnMarket - CITY_AVERAGE.daysOnMarket;
  const daysPrep = daysDiff < -2 ? "raskere enn" : daysDiff > 2 ? "tregere enn" : "på nivå med";
  const daysInterp = daysDiff < -2 ? "Høy likviditet." : daysDiff > 2 ? "Lavere nivå." : "Normalt.";
  
  const medianDiff = Number((district.medianPrice - CITY_AVERAGE.medianPrice).toFixed(1));
  const medianPrep = medianDiff > 0.2 ? "over" : medianDiff < -0.2 ? "under" : "på nivå med";
  const medianInterp = medianDiff > 0.2 ? "Høyere nivå." : medianDiff < -0.2 ? "Lavere nivå." : "Normalt.";
  
  const sqmDiff = district.avgSqmPrice - CITY_AVERAGE.avgSqmPrice;
  const sqmPrep = Math.abs(sqmDiff) > 1000 ? (sqmDiff > 0 ? "over" : "under") : "på nivå med";
  const sqmInterp = sqmDiff > 1000 ? "Høyere priser." : sqmDiff < -1000 ? "Rimeligere." : "Normalt.";

  return {
    trend: { 
      desktop: capitalizeFirst(`${trendValStr ? trendValStr + 'pp ' : ''}${trendPrep} Oslo-snittet (${CITY_AVERAGE.priceTrend}%). ${trendInterp}`), 
      mobile: capitalizeFirst(`${trendValStr ? trendValStr + 'pp ' : ''}${trendPrep} snittet. ${trendInterp}`) 
    },
    days: { 
      desktop: capitalizeFirst(`${Math.abs(daysDiff) > 2 ? Math.abs(daysDiff) + ' dager ' : ''}${daysPrep} snittet (${CITY_AVERAGE.daysOnMarket} d). ${daysInterp}`), 
      mobile: capitalizeFirst(`${daysPrep} snittet. ${daysInterp}`) 
    },
    median: { 
      desktop: capitalizeFirst(`${Math.abs(medianDiff) > 0.2 ? Math.abs(medianDiff) + 'M ' : ''}${medianPrep} snittet. ${medianInterp}`), 
      mobile: capitalizeFirst(`${medianPrep} snittet. ${medianInterp}`) 
    },
    sqm: { 
      desktop: capitalizeFirst(`${Math.abs(sqmDiff) > 1000 ? (Math.abs(sqmDiff)/1000).toFixed(0) + 'k ' : ''}${sqmPrep} snittet. ${sqmInterp}`), 
      mobile: capitalizeFirst(`${sqmPrep} snittet. ${sqmInterp}`) 
    }
  };
};

const DistrictStats: React.FC<DistrictStatsProps> = ({ district, isExpanded, onOpenCalculator }) => {
  const data = district || {
    name: 'Oslo',
    priceTrend: CITY_AVERAGE.priceTrend,
    daysOnMarket: CITY_AVERAGE.daysOnMarket,
    medianPrice: CITY_AVERAGE.medianPrice,
    avgSqmPrice: CITY_AVERAGE.avgSqmPrice,
    id: 'oslo',
    description: '',
    path: ''
  };

  const compTexts = district ? getComparisonTexts(district) : null;
  const defaultColor = 'text-slate-200';

  if (!district) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 h-full flex items-center py-3.5 md:py-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-4 gap-2 md:gap-4 w-full">
          <StatItem label="Prisendring" value={`+${data.priceTrend}%`} color={defaultColor} center small />
          <StatItem 
            label="Salgstid" 
            value={<>{data.daysOnMarket} <span className="md:inline hidden">dager</span><span className="md:hidden inline">D</span></>} 
            color={defaultColor} 
            center 
            small 
          />
          <StatItem label="Medianpris" value={`${data.medianPrice}M`} color={defaultColor} center small />
          <StatItem label="Per M2" value={`${(data.avgSqmPrice / 1000).toFixed(0)} K`} color={defaultColor} center small />
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className="flex flex-col animate-in fade-in duration-300">
        <div className="flex items-center py-3.5 md:py-4 px-4 md:px-10 border-b border-slate-800/10">
           <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-7xl mx-auto">
              <StatItem label="Prisendring" value={`+${data.priceTrend}%`} color={getTrendColor(data.priceTrend)} small center />
              <StatItem 
                label="Salgstid" 
                value={<>{data.daysOnMarket} <span className="md:inline hidden">dager</span><span className="md:hidden inline">D</span></>} 
                color={getDaysColor(data.daysOnMarket)} 
                small 
                center 
              />
              <StatItem label="Medianpris" value={`${(data.medianPrice).toFixed(1)}M`} color={getMedianColor(data.medianPrice)} small center />
              <StatItem label="Per M2" value={`${(data.avgSqmPrice / 1000).toFixed(0)} K`} color={getSqmColor(data.avgSqmPrice)} small center />
           </div>
        </div>
        <button 
          onClick={onOpenCalculator}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 uppercase tracking-[0.2em] transition-all active:scale-[0.99] shadow-[0_-10px_20px_rgba(37,99,235,0.2)] text-[10px] md:text-sm"
        >
          Hva er boligen din på {data.name} verdt?
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="pt-4 pb-1 px-3 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
          <StatBox 
            title="Prisendring" 
            value={`+${data.priceTrend}%`} 
            colorClass={getTrendColor(data.priceTrend)} 
            icon={<TrendingUp />}
            desktopDesc={compTexts?.trend.desktop || "Gjennomsnittlig vekst."}
            mobileDesc={compTexts?.trend.mobile || "Normal vekst."}
          />

          <StatBox 
            title="Salgstid" 
            value={<>{data.daysOnMarket} <span className="md:inline hidden">dager</span><span className="md:hidden inline">D</span></>} 
            colorClass={getDaysColor(data.daysOnMarket)} 
            icon={<Clock />}
            desktopDesc={compTexts?.days.desktop || "Normal etterspørsel."}
            mobileDesc={compTexts?.days.mobile || "Normal etterspørsel."}
          />

          <StatBox 
            title="Medianpris" 
            value={`${data.medianPrice}M`} 
            colorClass={getMedianColor(data.medianPrice)} 
            icon={<BarChart3 />}
            desktopDesc={compTexts?.median.desktop || "Normalt prisnivå."}
            mobileDesc={compTexts?.median.mobile || "Normalt nivå."}
          />

          <StatBox 
            title="Per m2" 
            value={`${(data.avgSqmPrice / 1000).toFixed(0)} K`} 
            colorClass={getSqmColor(data.avgSqmPrice)} 
            icon={<Coins />}
            desktopDesc={compTexts?.sqm.desktop || "Normalt prisnivå."}
            mobileDesc={compTexts?.sqm.mobile || "Normalt nivå."}
          />
        </div>
      </div>

      <button 
        onClick={onOpenCalculator}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-4 uppercase tracking-[0.2em] transition-all active:scale-[0.99] shadow-[0_-10px_20px_rgba(37,99,235,0.2)] text-[10px] md:text-sm"
      >
        Hva er boligen din på {data.name} verdt?
      </button>
    </div>
  );
};

const StatItem = ({ label, value, color, small, center }: { label: string, value: React.ReactNode, color: string, small?: boolean, center?: boolean }) => (
  <div className={center ? 'text-center' : 'text-left'}>
    <div className={`${color} font-black ${small ? 'text-xl md:text-3xl' : 'text-2xl md:text-5xl'} tracking-tighter mb-0.5 md:mb-1 transition-colors duration-500`}>{value}</div>
    <div className="text-slate-500 text-[8px] md:text-[10px] font-bold tracking-widest leading-tight uppercase">{label}</div>
  </div>
);

const StatBox = ({ title, value, colorClass, icon, desktopDesc, mobileDesc }: { title: string, value: React.ReactNode, colorClass: string, icon: React.ReactElement, desktopDesc: string, mobileDesc: string }) => (
  <div className="bg-slate-900/40 rounded-[1rem] p-2 md:p-4 border border-white/5 hover:border-blue-500/20 transition-all group">
    <div className="flex items-start justify-between mb-0 md:mb-3">
      <div className={`${colorClass} font-black text-lg md:text-2xl tracking-tighter transition-colors duration-500`}>{value}</div>
      <div className={`${colorClass} opacity-70`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 14, strokeWidth: 2.5 })}
      </div>
    </div>
    <div className="space-y-0 md:space-y-1">
      <h4 className="text-[8px] md:text-[11px] font-black text-slate-500 tracking-[0.05em]">{title}</h4>
      <p className="hidden md:block text-[12px] text-slate-400 leading-tight font-medium opacity-90 line-clamp-2">
        {desktopDesc}
      </p>
      <p className="block md:hidden text-[9px] text-slate-400 leading-[1.1] font-medium opacity-80 line-clamp-2">
        {mobileDesc}
      </p>
    </div>
  </div>
);

export default DistrictStats;
