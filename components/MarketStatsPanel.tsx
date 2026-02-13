
import React from 'react';
import { DistrictInfo } from '../types';
import { ArrowRight } from 'lucide-react';

interface MarketStatsPanelProps {
  district: DistrictInfo;
}

const SmallBlogCard: React.FC<{ 
  category: string; 
  title: string; 
  date: string;
  isBlue?: boolean;
}> = ({ category, title, date, isBlue }) => (
  <div className="group cursor-pointer mb-8 last:mb-0">
    <h4 className={`text-[22px] font-black mb-2 leading-[1.1] tracking-tight transition-colors ${isBlue ? 'text-blue-600' : 'text-slate-950 group-hover:text-blue-600'}`}>
      {title}
    </h4>
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      <span>{date}</span>
      <span className="text-slate-200 text-[14px]">•</span>
      <span className="text-slate-500">{category}</span>
    </div>
    <hr className="mt-6 border-slate-100 border-t-[1px]" />
  </div>
);

const MarketStatsPanel: React.FC<MarketStatsPanelProps> = ({ district }) => {
  return (
    <div className="flex flex-col bg-white px-8 py-10">
      {/* Hero Section */}
      <div className="mb-12">
        <h2 className="text-[34px] font-black text-slate-900 leading-[1.0] tracking-tighter uppercase mb-4">
          #1 INNSIKT I <br/>
          <span className="text-slate-900">BOLIG</span>
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">MARKEDET</span>
        </h2>
        <p className="text-slate-500 text-[14px] leading-[1.5] font-medium max-w-[320px]">
          Motta min månedlige oppdatering på boligmarkedet i Oslo. Faglig og ærlig om fortid, nåtid og fremtid.
        </p>
      </div>

      {/* Blog Posts Section */}
      <div className="flex flex-col mb-10">
        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Siste innlegg</h3>
        
        <SmallBlogCard 
          category="Markedsinnsikt"
          title="Lær deg å 'spå' Boligmarkedet"
          date="JAN 12"
        />
        
        <SmallBlogCard 
          category="Markedsrapporter"
          title="Markedsrapport januar 2026"
          date="JAN 05"
          isBlue={true}
        />

        <SmallBlogCard 
          category="Markedsinnsikt"
          title="Hvilken prisstrategi gir best pris?"
          date="DES 28"
        />
      </div>

      {/* About Broker Section */}
      <div className="mt-8">
        <div className="flex gap-5 items-start pt-8 border-t border-slate-100">
          {/* Column 1: Image */}
          <div className="w-28 h-28 flex-shrink-0">
            <div className="w-full h-full rounded-[20px] overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
              <img 
                src="https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/691cdde168737019d77f443a_profil-farger.avif" 
                alt="Torbjørn Skjelde" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Column 2: Content */}
          <div className="flex-1 flex flex-col justify-between py-1 min-h-[112px]">
            <div>
              <h4 className="text-[18px] font-black text-slate-950 tracking-tight leading-none uppercase mb-1">Torbjørn Skjelde</h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Meglerinnsikt</p>
              
              <p className="text-[13px] font-medium leading-[1.3] text-slate-600 mb-3 line-clamp-2">
                Min jobb er å gjøre usikre boligbeslutninger trygge – med fakta, analyse og råd.
              </p>
            </div>

            <button className="flex items-center gap-2 text-blue-600 text-[12px] font-black uppercase tracking-widest hover:opacity-80 transition-all group">
              Les mer
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketStatsPanel;
