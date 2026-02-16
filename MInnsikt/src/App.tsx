import React, { useState, useEffect } from 'react';
import { DISTRICTS } from '@/constants';
import { DistrictData } from '@/types';
import Map from '@/components/Map';
import DistrictStats from '@/components/DistrictStats';
import Calculator from '@/components/Calculator';
import { ChevronDown, ChevronUp, MapIcon } from 'lucide-react';

const App: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDistrictSelect = (district: DistrictData) => {
    setSelectedDistrict(district);
    setIsExpanded(true);
    setShowCalculator(false);
  };

  const handleDistrictClick = (id: string) => {
    const found = DISTRICTS.find(d => d.id === id);
    if (found) {
      handleDistrictSelect(found);
    }
  };

  const handleDistrictChangeById = (id: string) => {
    const found = DISTRICTS.find(d => d.id === id);
    if (found) setSelectedDistrict(found);
  };

  const toggleExpand = () => {
    if (selectedDistrict) {
      setIsExpanded(!isExpanded);
    }
  };

  const getPanelHeightClass = () => {
    if (showCalculator) return 'h-full md:h-[640px]';
    return 'h-auto';
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0f172a] overflow-hidden text-slate-100 font-sans">
      {/* Main Map View */}
      <main className="flex-1 min-h-0 relative bg-[#f1f5f9]">
        <Map
          districts={DISTRICTS}
          selectedDistrict={selectedDistrict?.id || null}
          onSelect={handleDistrictSelect}
          onDistrictClick={handleDistrictClick}
        />

        {/* Zoom Controls */}
        <div className="absolute right-4 top-4 md:right-6 md:top-6 flex flex-col gap-2 z-10">
          <button className="w-10 h-10 bg-white/95 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-lg shadow-black/5 group">
            <span className="text-xl font-bold text-slate-600 group-hover:text-blue-600 transition-colors">+</span>
          </button>
          <button className="w-10 h-10 bg-white/95 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-lg shadow-black/5 group">
            <span className="text-xl font-bold text-slate-600 group-hover:text-blue-600 transition-colors">−</span>
          </button>
        </div>

        {/* Liten logo-vannmerke nede til venstre */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10 opacity-30 flex items-center gap-2 pointer-events-none text-slate-900">
          <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Oslo Boligverdi</span>
        </div>
      </main>

      {/* Dynamic Bottom Panel */}
      <div className={`flex-none relative z-20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${getPanelHeightClass()}`}>
        {selectedDistrict && !showCalculator && (
          <div className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={toggleExpand}
              className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 border-4 border-[#0a0f1d] rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-2xl active:scale-90 group"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-0.5 transition-transform" /> : <ChevronUp className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-y-0.5 transition-transform" />}
            </button>
          </div>
        )}

        <div className="bg-[#0a0f1d] border-t border-white/5 overflow-hidden h-full">
          {showCalculator && selectedDistrict ? (
            <Calculator
              district={selectedDistrict}
              onDistrictChange={handleDistrictChangeById}
              onClose={() => setShowCalculator(false)}
            />
          ) : (
            <DistrictStats
              district={selectedDistrict}
              isExpanded={isExpanded}
              onOpenCalculator={() => setShowCalculator(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
