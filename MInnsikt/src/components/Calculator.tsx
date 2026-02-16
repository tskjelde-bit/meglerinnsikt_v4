
"use client";

import React, { useState } from 'react';
import { DistrictData, BoligType, Standard } from '@/types';
import { DISTRICTS, BOLIGTYPE_FACTORS, STANDARD_FACTORS } from '@/constants';
import { X, Loader2, Sparkles, Home, Building2, Warehouse, DoorOpen, ArrowRight, TrendingUp, ChevronLeft } from 'lucide-react';

interface CalculatorProps {
  district: DistrictData;
  onDistrictChange: (id: string) => void;
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ district, onDistrictChange, onClose }) => {
  const [type, setType] = useState<BoligType>(BoligType.LEILIGHET);
  const [area, setArea] = useState<number>(85);
  const [standard, setStandard] = useState<Standard>(Standard.STANDARD);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const getIconForType = (t: BoligType) => {
    switch (t) {
      case BoligType.LEILIGHET: return <Building2 className="w-5 h-5" />;
      case BoligType.REKKEHUS: return <Warehouse className="w-5 h-5" />;
      case BoligType.TOMANNSBOLIG: return <DoorOpen className="w-5 h-5" />;
      case BoligType.ENEBOLIG: return <Home className="w-5 h-5" />;
    }
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setEstimatedValue(null);
    
    setTimeout(() => {
      const boligtypeFaktor = BOLIGTYPE_FACTORS[type];
      const effektivPrisPerKvm = district.avgSqmPrice * boligtypeFaktor;
      const basisverdi = area * effektivPrisPerKvm;
      const standardFaktor = STANDARD_FACTORS[standard];
      const finalValue = basisverdi * (1 + standardFaktor);
      setEstimatedValue(Math.round(finalValue));
      setIsCalculating(false);
    }, 1000);
  };

  const handleReset = () => {
    setEstimatedValue(null);
  };

  // Mobil-visning: Enten Form eller Resultat
  const showResultOnMobile = estimatedValue !== null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0f1d] flex flex-col md:relative md:inset-auto md:bg-transparent md:h-full md:max-w-6xl md:mx-auto md:px-10 md:py-10 animate-in fade-in duration-300 overflow-hidden">
      {/* Header med Lukk-knapp */}
      <div className="flex items-center justify-between p-6 md:p-0 md:mb-8 border-b border-white/5 md:border-none">
        <div className="flex flex-col">
          <h2 className="text-[18px] md:text-[22px] font-bold text-slate-100 tracking-tight">Verdikalkulator</h2>
          <p className="text-slate-400 font-medium text-xs md:text-[17px]">
            Boligestimat for <span className="text-blue-500 font-bold">{district.name}</span>
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-white transition-all group"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-6 md:p-0">
          
          {/* VENSTRE SIDE / FORM (Vises alltid på desktop, skjules på mobil ved resultat) */}
          <div className={`lg:col-span-7 bg-[#0f172a]/40 rounded-[2rem] border border-white/5 p-6 md:p-8 flex flex-col h-full ${showResultOnMobile ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 space-y-6 overflow-hidden flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bydel</label>
                  <select 
                    value={district.id}
                    onChange={(e) => onDistrictChange(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-3 text-blue-500 font-bold appearance-none text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  >
                    {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Areal</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                      className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-3 text-blue-500 font-bold text-sm outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs pointer-events-none">m²</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Boligtype</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(BoligType).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        type === t ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-[#0a0f1d] border-slate-800 text-slate-500'
                      }`}
                    >
                      {getIconForType(t)}
                      <span className="text-[8px] font-bold uppercase mt-1.5">{t.slice(0, 3)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Standard</label>
                <div className="grid grid-cols-3 gap-1 bg-[#0a0f1d] p-1 rounded-xl border border-slate-800">
                  {Object.values(Standard).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStandard(s)}
                      className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        standard === s ? 'bg-slate-800 text-blue-400' : 'text-slate-500'
                      }`}
                    >
                      {s === Standard.RENOVERINGSBEHOV ? 'Behov' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-xl mt-8 flex items-center justify-center gap-3 uppercase tracking-widest text-xs transition-all active:scale-95"
            >
              {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isCalculating ? 'Analyserer...' : 'Beregn verdi'}
            </button>
          </div>

          {/* HØYRE SIDE / RESULTAT (Bytter ut innholdet på mobil) */}
          <div className={`lg:col-span-5 bg-slate-900/40 rounded-[2rem] border border-slate-800 p-8 flex flex-col justify-center text-center relative h-full transition-all duration-500 ${showResultOnMobile ? 'flex' : 'hidden lg:flex'}`}>
            {estimatedValue ? (
              <div className="animate-in fade-in zoom-in-95 flex flex-col h-full justify-between py-4">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 mx-auto">
                    Beregning klar
                  </div>
                  
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Ditt verdiestimat</h3>
                    <div className="text-4xl md:text-5xl font-black text-slate-100 tracking-tighter">
                      {estimatedValue.toLocaleString('no-NO')}
                      <span className="text-2xl ml-1">kr</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-slate-500 text-[8px] font-bold uppercase mb-1">Pris/m²</div>
                        <div className="text-white font-black text-sm">{Math.round(estimatedValue / area).toLocaleString('no-NO')}</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-slate-500 text-[8px] font-bold uppercase mb-1">Trend</div>
                        <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{district.priceTrend}%
                        </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-3 mt-10">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                    Få verdivurdering
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleReset}
                    className="w-full text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 py-2"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Endre detaljer
                  </button>
                </div>
              </div>
            ) : (
              // Skjules på mobil før beregning etter brukerens ønske
              <div className="hidden lg:flex flex-col items-center max-w-[250px] mx-auto">
                <div className="w-16 h-16 bg-slate-800/40 rounded-3xl flex items-center justify-center border border-slate-800/60 mb-6">
                  <CalcIcon className="w-8 h-8 text-slate-700" />
                </div>
                <h4 className="text-slate-400 font-bold text-lg tracking-tight mb-2">Resultat</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Verdiestimatet ditt dukker opp her når du har fylt ut detaljene.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hjelpe-ikon for Calc
const CalcIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <line x1="8" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="16" y2="14"/>
    <line x1="8" y1="18" x2="16" y2="18"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
  </svg>
);

export default Calculator;
