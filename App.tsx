
import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Property, DistrictInfo, BlogPost, BlogPostFull } from './types';
import { OSLO_DISTRICTS, MOCK_BLOG_POSTS } from './constants';
import { blogService } from './services/blogService';
import MapComponent, { MapComponentHandle, TileLayerKey, TILE_LAYERS } from './components/MapComponent';
import MarketStatsPanel from './components/MarketStatsPanel';
import BlogPostDetail from './components/BlogPostDetail';
import BlogPostPage from './components/BlogPostPage';
import BlogAdmin from './components/admin/BlogAdmin';
import {
  Building2, Menu, X, ChevronDown, Calendar, Download,
  Plus, Minus, Layers, Target, Zap, Coins,
  ChevronRight, Compass, TrendingUp, TrendingDown, Clock,
  LineChart, ArrowRight, Ruler,
  MessageSquareMore, Sun, Moon, MessageCircle, Handshake
} from 'lucide-react';
import TelegramChatWidget from './components/TelegramChatWidget';

const LOGO_URL = "https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/692a5a3fb0a7a66a7673d639_Azure-stacked-c.png";

const HomePage: React.FC<{
  displayPosts: (BlogPost | BlogPostFull)[];
  blogPosts: BlogPostFull[];
  onPostsChange: (posts: BlogPostFull[]) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
}> = ({ displayPosts, blogPosts, onPostsChange, isAdminOpen, setIsAdminOpen, isDarkMode, setIsDarkMode, setIsChatOpen }) => {
  const navigate = useNavigate();

  const getPreposition = (name: string): string => {
    const paaDistricts = ['Grünerløkka', 'Sagene', 'St. Hanshaugen', 'Frogner', 'Ullern', 'Bjerke', 'Grorud', 'Stovner', 'Østensjø', 'Nordstrand'];
    const iDistricts = ['Gamle Oslo', 'Vestre Aker', 'Nordre Aker', 'Alna', 'Søndre Nordstrand'];
    const cleanName = name.replace(' (Totalt)', '');
    if (paaDistricts.includes(cleanName)) return 'på';
    if (iDistricts.includes(cleanName)) return 'i';
    return 'i';
  };

  const getMarketData = (district: DistrictInfo) => {
    const oslo = OSLO_DISTRICTS[0];
    if (district.id === 'oslo') return { interpretation: 'Markedet følger Oslo-snittet både på pris og tempo.', trigger: false, cta: 'standard' as const };
    const priceDiff = district.priceChange - oslo.priceChange;
    const daysDiff = district.avgDaysOnMarket - oslo.avgDaysOnMarket;

    // Styrkegrad prisvekst
    const priceLevel = priceDiff > 0.7 ? 'strong_pos' : priceDiff > 0.3 ? 'mod_pos' : priceDiff >= -0.3 ? 'neutral' : priceDiff >= -0.7 ? 'mod_neg' : 'strong_neg';
    // Styrkegrad omsetningstid
    const speedLevel = daysDiff < -6 ? 'strong_fast' : daysDiff < -3 ? 'mod_fast' : daysDiff <= 2 ? 'neutral' : daysDiff <= 6 ? 'mod_slow' : 'strong_slow';

    const matrix: Record<string, Record<string, string>> = {
      strong_pos: {
        strong_fast: 'Svært sterk etterspørsel og tydelig høyere prisvekst enn snittet.',
        mod_fast: 'Høy prisvekst og rask omsetning sammenlignet med Oslo.',
        neutral: 'Prisene stiger tydelig mer enn snittet.',
      },
      mod_pos: {
        mod_fast: 'Noe sterkere prisvekst og raskere salg enn snittet.',
        neutral: 'Prisveksten ligger over Oslo-snittet.',
      },
      neutral: {
        mod_fast: 'Boliger selges raskere enn snittet, med stabil prisutvikling.',
        neutral: 'Markedet følger Oslo-snittet både på pris og tempo.',
        mod_slow: 'Salget tar noe lengre tid enn snittet.',
      },
      mod_neg: {
        mod_fast: 'Rask omsetning, men svakere prisvekst enn snittet.',
        neutral: 'Prisveksten ligger noe under Oslo-snittet.',
        mod_slow: 'Svakere prisutvikling og tregere salg enn snittet.',
      },
      strong_neg: {
        strong_slow: 'Tydelig svakere marked enn Oslo-snittet akkurat nå.',
      },
    };

    // Fallback-regel
    let interpretation: string;
    if (matrix[priceLevel]?.[speedLevel]) {
      interpretation = matrix[priceLevel][speedLevel];
    } else if (priceDiff > 0 && daysDiff < 0) {
      interpretation = 'Høy prisvekst og rask omsetning sammenlignet med Oslo.';
    } else if (priceDiff < 0 && daysDiff > 0) {
      interpretation = 'Svakere prisutvikling og tregere salg enn snittet.';
    } else {
      interpretation = 'Markedet følger Oslo-snittet både på pris og tempo.';
    }

    // Selger-trigger: price_diff > +0.7 og days_diff < -3
    const trigger = priceDiff > 0.7 && daysDiff < -3;

    // CTA-logikk
    let cta: 'strong_seller' | 'mod_seller' | 'buyer' | 'standard';
    if (priceDiff > 0.7 && daysDiff < -3) {
      cta = 'strong_seller';
    } else if (priceLevel === 'mod_pos' || priceLevel === 'strong_pos') {
      cta = 'mod_seller';
    } else if ((priceLevel === 'mod_neg' || priceLevel === 'strong_neg') && (speedLevel === 'mod_slow' || speedLevel === 'strong_slow')) {
      cta = 'buyer';
    } else {
      cta = 'standard';
    }

    return { interpretation, trigger, cta };
  };

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(OSLO_DISTRICTS[0]);
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [newsletterName, setNewsletterName] = useState('');
  const [isDistrictSelected, setIsDistrictSelected] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [mapHeight, setMapHeight] = useState('100dvh');
  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerKey>('blue');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mapComponentRef = useRef<MapComponentHandle>(null);

  useEffect(() => {
    const updateMapHeight = () => {
      if (window.innerWidth >= 768) {
        setMapHeight('auto');
      } else if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setMapHeight(`calc(100dvh - ${headerBottom}px - 4px)`);
      }
    };
    updateMapHeight();
    // Re-measure after fonts/layout settle on load
    const raf = requestAnimationFrame(() => updateMapHeight());
    const timeout = setTimeout(() => updateMapHeight(), 200);
    window.addEventListener('resize', updateMapHeight);
    return () => {
      window.removeEventListener('resize', updateMapHeight);
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [selectedDistrict, isDistrictSelected]);

  const handlePostClick = (post: BlogPost | BlogPostFull) => {
    if ('slug' in post && (post as BlogPostFull).slug) {
      navigate(`/blog/${(post as BlogPostFull).slug}`);
    }
  };

  return (
    <>
      {/* DASHBOARD SECTION */}
      <section className={`max-w-[1700px] mx-auto w-full pt-4 pb-0 md:py-8 transition-colors duration-300 ${isDarkMode ? '' : ''}`}>
        <div ref={headerRef} className="px-3 md:px-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2 md:mb-8">
          <div className="space-y-1 md:space-y-3">
            <div className={`hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Hjem</span> <ChevronRight size={10} className={isDarkMode ? 'text-slate-700' : 'text-slate-300'} /> <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Eiendomsinnsikt</span>
            </div>
            <h2 className={`text-[20px] md:text-[32px] lg:text-[40px] font-black leading-tight tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-[18px] md:text-[32px] lg:text-[40px]">Boligmarkedet {getPreposition(selectedDistrict.name)} </span><span className="text-[18px] md:text-[32px] lg:text-[40px] text-blue-500">{selectedDistrict.name.replace(' (Totalt)', '')}</span>
            </h2>
            <p className={`text-[12px] md:text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white/70' : 'text-slate-500'}`}>
              {isDistrictSelected
                ? <span>{getMarketData(selectedDistrict).interpretation}</span>
                : <><span className="text-blue-500">Selger</span> eller <span className="text-blue-500">kjøpers</span> marked akkurat nå?</>
              }
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              isDarkMode
                ? 'bg-[#1a2333] border border-white/5 text-white hover:bg-[#252f44]'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}>
              <Calendar size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-400'} />
              Siste 30 dager
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all">
              <Download size={14} />
              Eksporter data
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch mb-0 md:mb-12 md:px-14">
          {/* MAP COLUMN */}
          <div style={{ minHeight: mapHeight }} className={`lg:col-span-8 relative rounded-none md:rounded-2xl overflow-hidden shadow-2xl md:!h-[450px] lg:!h-auto flex flex-col transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1a2333]/20' : 'md:border md:border-slate-200 bg-white'
          }`}>
            <div className="absolute inset-0 z-0 bg-white">
              <MapComponent
                ref={mapComponentRef}
                properties={[]}
                districts={OSLO_DISTRICTS}
                selectedProperty={null}
                selectedDistrict={selectedDistrict}
                onPropertySelect={() => {}}
                onDistrictSelect={(d) => { setSelectedDistrict(d); setIsDistrictSelected(true); setIsAnalysisOpen(true); }}
              />
            </div>


            {/* MAP CONTROLS - CIRCULAR */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[500] flex flex-col gap-2 pointer-events-auto">
              {/* Zoom in */}
              <button onClick={() => mapComponentRef.current?.zoomIn()} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${
                isDarkMode ? 'bg-[#0b1120] text-white border border-white/5' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
              }`}><Plus size={14} /></button>
              {/* Zoom out */}
              <button onClick={() => mapComponentRef.current?.zoomOut()} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${
                isDarkMode ? 'bg-[#0b1120] text-white border border-white/5' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
              }`}><Minus size={14} /></button>
              {/* Layers toggle */}
              <div className="relative mt-1 md:mt-2">
                <button onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${
                  isLayerMenuOpen ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-[#0b1120] text-white border border-white/5' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}><Layers size={14} /></button>
                {/* Layer menu popup */}
                {isLayerMenuOpen && (
                  <div className={`absolute right-full mr-2 top-0 rounded-lg shadow-xl overflow-hidden border ${isDarkMode ? 'bg-[#0b1120] border-white/10' : 'bg-white border-slate-200'}`} style={{ minWidth: '120px' }}>
                    {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { mapComponentRef.current?.setTileLayer(key); setActiveTileLayer(key); setIsLayerMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          activeTileLayer === key
                            ? 'bg-blue-600 text-white'
                            : isDarkMode ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {TILE_LAYERS[key].name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Reset / center */}
              <button onClick={() => { mapComponentRef.current?.resetView(); setSelectedDistrict(OSLO_DISTRICTS[0]); setIsDistrictSelected(false); setIsAnalysisOpen(false); }} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${
                isDarkMode ? 'bg-[#0b1120] text-white border border-white/5' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
              }`}><Target size={14} /></button>
            </div>

            {/* CONSOLIDATED INSIGHT BOX */}
            <div className="absolute bottom-0 left-0 right-0 z-[500] pointer-events-none">
              <div className="pointer-events-auto flex flex-col gap-3">
                <div className={`rounded-none overflow-hidden transition-all duration-300 ${
                  isDistrictSelected
                    ? isDarkMode ? 'bg-[#242c3d] shadow-2xl' : 'bg-white shadow-2xl'
                    : 'bg-white/50'
                }`}>
                  {/* Mobile chevron: outside grid, like original */}
                  <div className={`md:hidden overflow-hidden transition-all duration-300 ${isDistrictSelected ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button
                      onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                      className="w-full flex items-center justify-center py-1 transition-colors text-white"
                    >
                      <ChevronDown size={28} className={`transition-transform ${isAnalysisOpen ? '' : 'rotate-180'}`} />
                    </button>
                  </div>
                  <div className="relative grid grid-cols-3 md:grid-cols-4">
                    {/* Desktop chevron: overlaid, no extra row */}
                    <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 -top-[3px] z-10 transition-all duration-300 ${isDistrictSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <button
                        onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                        className="flex items-center justify-center text-white hover:text-white transition-colors drop-shadow-lg"
                      >
                        <ChevronDown size={44} className={`transition-transform ${isAnalysisOpen ? '' : 'rotate-180'}`} />
                      </button>
                    </div>
                    {(() => {
                      const oslo = OSLO_DISTRICTS[0];
                      const priceDiff = selectedDistrict.priceChange - oslo.priceChange;
                      const daysDiff = selectedDistrict.avgDaysOnMarket - oslo.avgDaysOnMarket;
                      const sqmDiff = selectedDistrict.pricePerSqm - oslo.pricePerSqm;
                      const priceColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (priceDiff > 0.3 ? 'text-[#03d392]' : priceDiff < -0.3 ? 'text-[#e05a5a]' : 'text-[#F8B324]');
                      const daysColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (daysDiff < -1 ? 'text-[#03d392]' : daysDiff > 1 ? 'text-[#e05a5a]' : 'text-[#F8B324]');
                      const sqmColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (sqmDiff > 0 ? 'text-[#03d392]' : sqmDiff < 0 ? 'text-[#e05a5a]' : 'text-[#F8B324]');
                      return [
                        { label: "Prisendring", value: `+${selectedDistrict.priceChange}%`, iconColor: priceColor, hideOnMobile: false },
                        { label: "Salgstid", value: `${selectedDistrict.avgDaysOnMarket} dager`, iconColor: daysColor, hideOnMobile: false },
                        { label: "Medianpris", value: `${(selectedDistrict.medianPrice / 1000000).toFixed(1)}M`, iconColor: 'text-blue-400', hideOnMobile: true },
                        { label: "per M2", value: `${Math.round(selectedDistrict.pricePerSqm / 1000)} K`, iconColor: sqmColor, hideOnMobile: false }
                      ];
                    })().map((stat, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center py-4 px-2
                          ${stat.hideOnMobile ? 'hidden md:flex' : ''}
                          ${i !== 0 && isDistrictSelected ? `border-l ${isDarkMode ? 'border-white/5' : 'border-slate-100'}` : ''}
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`text-[15px] md:text-[24px] lg:text-[28px] font-black leading-tight ${selectedDistrict.id === 'oslo' ? 'text-[#242c3d]' : stat.iconColor}`}>
                            {stat.value}
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-widest leading-none mt-0.5 ${selectedDistrict.id === 'oslo' ? 'text-[#242c3d]/60' : stat.iconColor}`}>
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded district analysis */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDistrictSelected && isAnalysisOpen ? 'max-h-[650px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div>

                      {/* Desktop: 4-column grid matching stats: Prisendring, Salgstid, Medianpris, per M2 */}
                      <div className="hidden md:grid grid-cols-4 gap-4 p-5 pt-2">
                        {(() => {
                          const oslo = OSLO_DISTRICTS[0];
                          const pDiff = +(selectedDistrict.priceChange - oslo.priceChange).toFixed(1);
                          const sDiff = selectedDistrict.pricePerSqm - oslo.pricePerSqm;
                          const dDiff = selectedDistrict.avgDaysOnMarket - oslo.avgDaysOnMarket;
                          const mDiff = selectedDistrict.medianPrice - oslo.medianPrice;
                          const isOslo = selectedDistrict.id === 'oslo';
                          const getHex = (good: boolean, bad: boolean) => good ? '#03d392' : bad ? '#e05a5a' : '#F8B324';
                          const priceHex = isOslo ? '#60a5fa' : getHex(pDiff > 0.3, pDiff < -0.3);
                          const daysHex = isOslo ? '#60a5fa' : getHex(dDiff < -1, dDiff > 1);
                          const medianHex = '#60a5fa';
                          const sqmHex = isOslo ? '#60a5fa' : getHex(sDiff > 0, sDiff < 0);
                          return <>
                            {/* 1: Prisutvikling — under Prisendring */}
                            <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priceHex }}></div>
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: priceHex }}>
                                  Prisutvikling
                                </span>
                              </div>
                              <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {(() => {
                                  const osloSnitt = oslo.priceChange;
                                  if (isOslo) return `Oslo-snittet ligger på +${osloSnitt}% prisvekst siste 12 måneder.`;
                                  if (pDiff > 0) return `+${pDiff} prosentpoeng over Oslo-snittet (${osloSnitt}%). Sterkere prisvekst enn byen for øvrig.`;
                                  if (pDiff < 0) return `${pDiff} prosentpoeng under Oslo-snittet (${osloSnitt}%). Svakere prisvekst enn byen for øvrig.`;
                                  return `I takt med Oslo-snittet på +${osloSnitt}% prisvekst.`;
                                })()}
                              </p>
                            </div>

                            {/* 2: Omløpshastighet — under Salgstid */}
                            <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: daysHex }}></div>
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: daysHex }}>
                                  Omløpshastighet
                                </span>
                              </div>
                              <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {(() => {
                                  const osloSnitt = oslo.avgDaysOnMarket;
                                  const diff = selectedDistrict.avgDaysOnMarket - osloSnitt;
                                  if (isOslo) return `Oslo-snittet ligger på ${osloSnitt} dager omløpstid.`;
                                  if (diff < 0) return `${Math.abs(diff)} dager raskere enn Oslo-snittet (${osloSnitt} dager). Svært likvid marked.`;
                                  if (diff > 0) return `${diff} dager tregere enn Oslo-snittet (${osloSnitt} dager). Lavere likviditet.`;
                                  return `I takt med Oslo-snittet på ${osloSnitt} dager omløpstid.`;
                                })()}
                              </p>
                            </div>

                            {/* 3: Medianpris — under Medianpris */}
                            <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: medianHex }}></div>
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: medianHex }}>
                                  Medianpris
                                </span>
                              </div>
                              <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {(() => {
                                  const osloSnitt = oslo.medianPrice;
                                  if (isOslo) return `Oslo-snittet ligger på ${(osloSnitt / 1000000).toFixed(1)} mill. kr i medianpris.`;
                                  if (mDiff > 0) return `${(mDiff / 1000000).toFixed(1)} mill. kr over Oslo-snittet (${(osloSnitt / 1000000).toFixed(1)} mill.). Høyere prisnivå.`;
                                  if (mDiff < 0) return `${(Math.abs(mDiff) / 1000000).toFixed(1)} mill. kr under Oslo-snittet (${(osloSnitt / 1000000).toFixed(1)} mill.). Lavere prisnivå.`;
                                  return `I takt med Oslo-snittet på ${(osloSnitt / 1000000).toFixed(1)} mill. kr.`;
                                })()}
                              </p>
                            </div>

                            {/* 4: Kvadratmeterpris — under per M2 */}
                            <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sqmHex }}></div>
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: sqmHex }}>
                                  Kvadratmeterpris
                                </span>
                              </div>
                              <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {(() => {
                                  const osloSnitt = oslo.pricePerSqm;
                                  const diff = selectedDistrict.pricePerSqm - osloSnitt;
                                  if (isOslo) return `Oslo-snittet ligger på ${osloSnitt.toLocaleString('nb-NO')} kr/m² i snitt.`;
                                  if (diff > 0) return `${diff.toLocaleString('nb-NO')} kr/m² over Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²). Høyere prisnivå enn byen for øvrig.`;
                                  if (diff < 0) return `${Math.abs(diff).toLocaleString('nb-NO')} kr/m² under Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²). Lavere prisnivå enn byen for øvrig.`;
                                  return `I takt med Oslo-snittet på ${osloSnitt.toLocaleString('nb-NO')} kr/m².`;
                                })()}
                              </p>
                            </div>
                          </>;
                        })()}
                      </div>

                      {/* Mobile: vertical list with round icons — colors match stat system */}
                      <div className="md:hidden flex flex-col px-4 pt-1 pb-2">
                        {(() => {
                          const oslo = OSLO_DISTRICTS[0];
                          const pDiff = +(selectedDistrict.priceChange - oslo.priceChange).toFixed(1);
                          const sDiff = selectedDistrict.pricePerSqm - oslo.pricePerSqm;
                          const dDiff = selectedDistrict.avgDaysOnMarket - oslo.avgDaysOnMarket;
                          const getHex = (good: boolean, bad: boolean) => good ? '#03d392' : bad ? '#e05a5a' : '#F8B324';
                          const isOslo = selectedDistrict.id === 'oslo';
                          const priceHex = isOslo ? '#60a5fa' : getHex(pDiff > 0.3, pDiff < -0.3);
                          const sqmHex = isOslo ? '#60a5fa' : getHex(sDiff > 0, sDiff < 0);
                          const daysHex = isOslo ? '#60a5fa' : getHex(dDiff < -1, dDiff > 1);
                          return <>
                            <div className="py-1.5 flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${priceHex}20` }}>
                                <TrendingUp size={12} style={{ color: priceHex }} />
                              </div>
                              <p className={`text-[12px] font-medium leading-snug ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {isOslo ? `Oslo-snittet ligger på +${oslo.priceChange}% prisvekst siste 12 mnd.`
                                  : pDiff > 0 ? `+${pDiff} prosentpoeng over Oslo-snittet (${oslo.priceChange}%).`
                                  : pDiff < 0 ? `${pDiff} prosentpoeng under Oslo-snittet (${oslo.priceChange}%).`
                                  : `I takt med Oslo-snittet på +${oslo.priceChange}% prisvekst.`}
                              </p>
                            </div>
                            <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
                            <div className="py-1.5 flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${sqmHex}20` }}>
                                <Ruler size={12} style={{ color: sqmHex }} />
                              </div>
                              <p className={`text-[12px] font-medium leading-snug ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {isOslo ? `Oslo-snittet ligger på ${oslo.pricePerSqm.toLocaleString('nb-NO')} kr/m².`
                                  : sDiff > 0 ? `${sDiff.toLocaleString('nb-NO')} kr/m² over Oslo-snittet (${oslo.pricePerSqm.toLocaleString('nb-NO')} kr/m²).`
                                  : sDiff < 0 ? `${Math.abs(sDiff).toLocaleString('nb-NO')} kr/m² under Oslo-snittet (${oslo.pricePerSqm.toLocaleString('nb-NO')} kr/m²).`
                                  : `I takt med Oslo-snittet på ${oslo.pricePerSqm.toLocaleString('nb-NO')} kr/m².`}
                              </p>
                            </div>
                            <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
                            <div className="py-1.5 flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${daysHex}20` }}>
                                <Clock size={12} style={{ color: daysHex }} />
                              </div>
                              <p className={`text-[12px] font-medium leading-snug ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                                {isOslo ? `Oslo-snittet ligger på ${oslo.avgDaysOnMarket} dager omløpstid.`
                                  : dDiff < 0 ? `${Math.abs(dDiff)} dager raskere enn Oslo-snittet (${oslo.avgDaysOnMarket} dager).`
                                  : dDiff > 0 ? `${dDiff} dager tregere enn Oslo-snittet (${oslo.avgDaysOnMarket} dager).`
                                  : `I takt med Oslo-snittet på ${oslo.avgDaysOnMarket} dager omløpstid.`}
                              </p>
                            </div>
                          </>;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Toggle open button + CTA */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDistrictSelected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 md:py-5 md:rounded-b-xl transition-all uppercase tracking-widest text-[12px] md:text-[15px]"
                    >
                      <span>{(() => {
                        let name = selectedDistrict.name.replace(' (Totalt)', '');
                        if (name === 'St. Hanshaugen') name = 'St. Hansh.';
                        return `Hva er boligen din ${getPreposition(selectedDistrict.name)} ${name} verdt?`;
                      })()}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN - desktop only */}
          <div className="lg:col-span-4 hidden lg:flex flex-col">
            <div className={`rounded-2xl flex flex-col shadow-xl h-full transition-colors duration-300 ${
              isDarkMode ? 'bg-[#1e293b] border border-white/5' : 'bg-white border border-slate-200'
            }`}>
              <div className="flex justify-between items-center p-8 pb-6 shrink-0">
                <h3 className={`text-[14px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Siste innlegg</h3>
                <button className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] hover:underline">Se alle</button>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-6 overflow-hidden">
                {/* Featured Article with image */}
                {displayPosts.length > 0 && (
                  <div className="group cursor-pointer shrink-0" onClick={() => handlePostClick(displayPosts[0])}>
                    <div className={`relative aspect-[16/10] rounded-xl overflow-hidden mb-4 shadow-lg ${isDarkMode ? 'border border-white/5' : 'border border-slate-100'}`}>
                      <img src={displayPosts[0].image} alt={displayPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">{displayPosts[0].category}</div>
                    </div>
                    <div className={`text-[9px] font-black uppercase mb-1 tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{displayPosts[0].date}</span> <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>&bull;</span> <span>{displayPosts[0].category}</span>
                    </div>
                    <h4 className={`text-[15px] font-black leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {displayPosts[0].title}
                    </h4>
                  </div>
                )}

                {/* List Articles - text only */}
                <div className="space-y-5 shrink-0">
                  {displayPosts.slice(1, 3).map((post) => (
                    <div key={post.id} className={`group cursor-pointer pt-5 ${isDarkMode ? 'border-t border-white/5' : 'border-t border-slate-100'}`} onClick={() => handlePostClick(post)}>
                      <div className={`text-[9px] font-black uppercase mb-1 tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>{post.date}</span> <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>&bull;</span> <span>{post.category}</span>
                      </div>
                      <h4 className={`text-[15px] font-black leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {post.title}
                      </h4>
                    </div>
                  ))}
                </div>

                {/* Premium Box */}
                <div className={`mt-2 p-6 rounded-2xl relative overflow-hidden group shadow-2xl shrink-0 transition-colors duration-300 ${
                  isDarkMode ? 'bg-[#0f172a] border border-blue-500/20' : 'bg-blue-50 border border-blue-100'
                }`}>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-blue-500">
                      <Zap size={14} fill="currentColor" />
                      <h5 className="text-[10px] font-black uppercase tracking-[0.25em]">Premium Innsikt</h5>
                    </div>
                    <p className={`text-[12px] font-medium leading-relaxed mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Få tilgang til dypere data og historiske trender med vår Pro-pakke.
                    </p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                      Oppgrader nå
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE BLOG SECTION - completely outside the dashboard section, no height constraints */}
      <section className={`lg:hidden max-w-[1700px] mx-auto w-full px-3 pt-12 pb-24 transition-colors duration-300`}>
        <div className="flex justify-between items-center pb-4">
          <h3 className={`text-[14px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Siste innlegg</h3>
          <button className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] hover:underline">Se alle</button>
        </div>

        <div className="space-y-4">
          {displayPosts.slice(0, 3).map((post, index) => (
            <div key={post.id} className={`group cursor-pointer ${index > 0 ? (isDarkMode ? 'border-t border-white/10 pt-4' : 'border-t border-slate-200 pt-4') : ''}`} onClick={() => handlePostClick(post)}>
              {index === 0 && (
                <div className={`relative aspect-[16/10] rounded-xl overflow-hidden mb-3 shadow-lg ${isDarkMode ? 'border border-white/5' : 'border border-slate-100'}`}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">{post.category}</div>
                </div>
              )}
              <div className={`text-[10px] font-black uppercase mb-1.5 tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>{post.date}</span> <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>&bull;</span> <span>{post.category}</span>
              </div>
              <h4 className={`text-[20px] font-black leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {post.title}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* 3. White Section Wrapper: Features & Blog Grid */}
      <section className="bg-white py-24">
        <div className="max-w-[1700px] mx-auto px-3 md:px-14">

          {/* Features Section */}
          <div className="text-center">
            <h2 className="text-[32px] md:text-[42px] font-black text-slate-950 uppercase tracking-tighter mb-4">
              Få mer ut av markedet
            </h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-16"></div>

            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <LineChart size={28} />
                </div>
                <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">Markedskontroll i sanntid</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                  Jeg analyserer tilbud, etterspørsel, tempo og prispress i ditt nærområde. Du tar beslutninger basert på faktiske bevegelser – ikke overskrifter.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Target size={28} />
                </div>
                <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">Strategisk prissetting</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                  Riktig pris handler om timing, konkurransebilde og kjøperpsykologi. Jeg optimaliserer for maksimal interesse og sterkest mulig budrunde.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Handshake size={28} />
                </div>
                <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">Aktiv gjennomføring</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                  Fra lansering til budrunde styrer jeg eksponering, dialog og tempo for å sikre best mulig utfall – enten du kjøper eller selger.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Dark Section Wrapper: CTA */}
      <section className={`py-32 transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1120] border-t border-white/5' : 'bg-slate-900 border-t border-slate-200'}`}>
        <div className="max-w-[1700px] mx-auto px-3 md:px-14 text-center">
          <h2 className="text-[42px] md:text-[64px] font-black text-white leading-tight uppercase tracking-tighter mb-6">
            Boligmarkedet {getPreposition(selectedDistrict.name)} <br/> <span className="text-blue-500">{selectedDistrict.name.replace(' (Totalt)', '')}</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
            <span className="md:hidden">Er det smart å selge her nå?</span>
            <span className="hidden md:inline">Få en gratis og uforpliktende verdivurdering basert på ferske salgsdata fra ditt nærområde. Tar under ett minutt.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setIsChatOpen(true)} className="bg-blue-600 text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all">
              Få gratis verdivurdering
            </button>
            <button onClick={() => setIsChatOpen(true)} className="bg-[#1a2333] text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-[#252f44] border border-white/5 transition-all">
              Book en rask prat
            </button>
          </div>
        </div>
      </section>

      {/* 5. Blog Grid Section */}
      <section className="bg-white py-24">
        <div className="max-w-[1700px] mx-auto px-3 md:px-14">
          <div className="mb-8">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[42px] font-black text-slate-950 uppercase tracking-tighter mb-4">
                Utvalgte innlegg
              </h2>
              <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {displayPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden mb-6 shadow-xl border border-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="text-[17px] font-black text-slate-950 leading-tight uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-slate-400">{post.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 md:py-16 border-t border-slate-100">
        <div className="max-w-[1700px] mx-auto px-3 md:px-14">
          {/* Top row: Logo + Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 mb-8 md:mb-12">
            <img
              src={LOGO_URL}
              alt="Meglerinnsikt Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Forsiden</a>
              <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Innsikt</a>
              <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Blog</a>
              <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Kundeomtaler</a>
            </div>
          </div>
          {/* Divider */}
          <div className="border-t border-slate-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest">&copy; 2026 Meglerinnsikt AS &bull; Alle rettigheter reservert</p>
              <div className="flex gap-6 md:gap-10">
                <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Instagram</a>
                <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Facebook</a>
                <a href="#" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {isAdminOpen && (
        <BlogAdmin
          posts={blogPosts}
          onPostsChange={onPostsChange}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'home' | 'innsikt'>('home');
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPostFull[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load blog posts from posts.json
  useEffect(() => {
    blogService.fetchPosts().then(posts => {
      if (posts.length > 0) {
        setBlogPosts(posts);
      }
    });
  }, []);

  // Admin keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveNavDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use CMS posts if available, otherwise fall back to mock data
  const displayPosts: (BlogPost | BlogPostFull)[] = blogPosts.length > 0 ? blogPosts : MOCK_BLOG_POSTS;

  const navigateTo = (page: 'home' | 'innsikt') => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Check if we're on a blog post page
  const isBlogPostPage = location.pathname.startsWith('/blog/');

  return (
    <div className={`flex flex-col min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'} ${isBlogPostPage ? '' : ''}`}>
      {/* 1. Global Header - only show on home page, blog post pages have their own */}
      {!isBlogPostPage && (
        <header className="h-16 md:h-20 bg-white flex items-center justify-between px-3 lg:px-14 z-[1000] sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center gap-10">
            <div onClick={() => navigateTo('home')} className="flex items-center gap-3 cursor-pointer group">
              <img
                src={LOGO_URL}
                alt="Meglerinnsikt Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>

            <nav ref={navRef} className="hidden lg:flex items-center gap-6">
              <button onClick={() => navigateTo('home')} className={`text-[14px] font-bold transition-colors ${activePage === 'home' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}>Forsiden</button>
              <button className="flex items-center gap-1.5 text-[14px] font-bold text-slate-700 hover:text-blue-600">
                Markedsrapporter <ChevronDown size={14} />
              </button>
              <button onClick={() => navigateTo('innsikt')} className="text-[14px] font-bold text-slate-700 hover:text-blue-600">Innsikt</button>
              <button className="flex items-center gap-1.5 text-[14px] font-bold text-slate-700 hover:text-blue-600">
                Blog <ChevronDown size={14} />
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex w-10 h-10 rounded-xl border border-slate-200 bg-white items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-all"
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
            </button>
            <button onClick={() => setIsChatOpen(true)} className="bg-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-blue-600 transition-all">
              Få verdivurdering
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-900">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={
          activePage === 'home' ? (
            <HomePage
              displayPosts={displayPosts}
              blogPosts={blogPosts}
              onPostsChange={(posts) => setBlogPosts(posts)}
              isAdminOpen={isAdminOpen}
              setIsAdminOpen={setIsAdminOpen}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              setIsChatOpen={setIsChatOpen}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-20 text-slate-500 font-black uppercase tracking-widest text-xs">Siden er under utvikling</div>
          )
        } />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>

      {/* Admin overlay - available on all pages */}
      {isAdminOpen && !isBlogPostPage && null}

      <TelegramChatWidget isDarkMode={isDarkMode} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default App;
