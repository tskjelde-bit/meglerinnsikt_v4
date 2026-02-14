
import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Property, DistrictInfo, BlogPost, BlogPostFull } from './types';
import { OSLO_DISTRICTS, MOCK_BLOG_POSTS } from './constants';
import { blogService } from './services/blogService';
import MapComponent from './components/MapComponent';
import MarketStatsPanel from './components/MarketStatsPanel';
import BlogPostDetail from './components/BlogPostDetail';
import BlogPostPage from './components/BlogPostPage';
import BlogAdmin from './components/admin/BlogAdmin';
import TelegramChatWidget from './components/TelegramChatWidget';
import {
  Building2, Menu, X, ChevronDown, Calendar, Download,
  Plus, Minus, Layers, Target, Zap, Coins,
  ChevronRight, Compass, TrendingUp, TrendingDown, Clock,
  LineChart, ArrowRight,
  MessageSquareMore, Sun, Moon, MessageCircle, Handshake
} from 'lucide-react';

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
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMapHeight = () => {
      if (headerRef.current && window.innerWidth < 768) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setMapHeight(`calc(100dvh - ${headerBottom}px)`);
      }
    };
    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
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
              <span className="hidden md:inline">Eiendomsinnsikt </span><span className="md:hidden"><span className="text-[16px] font-semibold">Boligmarkedet {getPreposition(selectedDistrict.name)}</span><br/><span className="text-[24px] text-blue-500">{selectedDistrict.name.replace(' (Totalt)', '')} nå</span></span><span className="hidden md:inline text-blue-500">{selectedDistrict.name.replace(' (Totalt)', '')}</span>
            </h2>
            <p className={`md:hidden text-[12px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              {isDistrictSelected
                ? <span className="text-white">{getMarketData(selectedDistrict).interpretation}</span>
                : <><span className="text-blue-500">Selger</span> eller <span className="text-blue-500">kjøpers</span> marked akkurat nå?</>
              }
            </p>
            <p className={`hidden md:block font-medium text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Avansert dataanalyse for det norske eiendomsmarkedet
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
          <div style={{ height: mapHeight }} className={`lg:col-span-8 relative rounded-none md:rounded-2xl overflow-hidden shadow-2xl md:!h-[450px] lg:!h-auto flex flex-col transition-colors duration-300 ${
            isDarkMode ? 'md:border md:border-white/5 bg-[#1a2333]/20' : 'md:border md:border-slate-200 bg-white'
          }`}>
            <div className="absolute inset-0 z-0 bg-white">
              <MapComponent
                properties={[]}
                districts={OSLO_DISTRICTS}
                selectedProperty={null}
                selectedDistrict={selectedDistrict}
                onPropertySelect={() => {}}
                onDistrictSelect={(d) => { setSelectedDistrict(d); setIsDistrictSelected(true); setIsAnalysisOpen(true); }}
              />
            </div>

            {/* DISTRICT DROPDOWN */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 md:top-8 md:left-8 md:translate-x-0 z-[500] w-[130px] md:w-72 pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl shadow-2xl overflow-hidden border border-slate-100">
                <button
                  onClick={() => setIsDistrictListOpen(!isDistrictListOpen)}
                  className="w-full flex items-center justify-between p-1.5 md:p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <Target size={18} className="md:hidden text-slate-400 shrink-0" />
                    <Target size={28} className="hidden md:block text-slate-400 shrink-0" />
                    <div>
                      <div className="text-[10px] md:text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none md:mb-1.5">{selectedDistrict.name.replace(' (Totalt)', '')}</div>
                      <div className="hidden md:block text-[12px] font-black uppercase tracking-widest text-slate-400 leading-none">Velg bydel i kartet</div>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform md:w-6 md:h-6 ${isDistrictListOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDistrictListOpen && (
                  <div className="max-h-[200px] md:max-h-[300px] overflow-y-auto py-1 border-t border-slate-50 custom-scrollbar">
                    {OSLO_DISTRICTS.map((district) => (
                      <button
                        key={district.id}
                        onClick={() => { setSelectedDistrict(district); setIsDistrictListOpen(false); setIsDistrictSelected(true); setIsAnalysisOpen(true); }}
                        className="w-full flex items-center justify-between px-4 py-2 md:px-6 md:py-3 text-left hover:bg-blue-50 transition-colors group"
                      >
                        <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-tight ${selectedDistrict.id === district.id ? 'text-blue-600' : 'text-slate-600'}`}>
                          {district.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MAP CONTROLS - CIRCULAR */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[500] flex flex-col gap-2 pointer-events-auto">
              {[
                { icon: <Plus size={14} />, onClick: undefined, extraClass: '' },
                { icon: <Minus size={14} />, onClick: undefined, extraClass: '' },
                { icon: <Layers size={14} />, onClick: undefined, extraClass: 'mt-1 md:mt-2' },
                { icon: <Target size={14} />, onClick: () => { setSelectedDistrict(OSLO_DISTRICTS[0]); setIsDistrictSelected(false); setIsAnalysisOpen(false); }, extraClass: '' },
              ].map((ctrl, i) => (
                <button key={i} onClick={ctrl.onClick} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${ctrl.extraClass} ${
                  isDarkMode ? 'bg-[#0b1120] text-white border border-white/5' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}>{ctrl.icon}</button>
              ))}
            </div>

            {/* CONSOLIDATED INSIGHT BOX */}
            <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 z-[500] pointer-events-none">
              <div className="pointer-events-auto flex flex-col gap-3">
                <div className={`rounded-none md:rounded-xl overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? isAnalysisOpen && isDistrictSelected
                      ? 'bg-[#242c3d] backdrop-blur-md shadow-2xl border border-white/10'
                      : 'bg-[#242c3d]/95 backdrop-blur-md shadow-2xl border border-white/10 md:bg-[#242c3d]/70 md:border-white/5'
                    : isAnalysisOpen && isDistrictSelected
                      ? 'bg-white backdrop-blur-md shadow-2xl border border-slate-200'
                      : 'bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 md:bg-white/70 md:border-slate-100'
                }`}>
                  {/* Chevron at top - toggles open/close */}
                  <div className={`overflow-hidden transition-all duration-300 ${isDistrictSelected ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button
                      onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                      className={`w-full flex items-center justify-center gap-1 py-1 md:py-2 transition-colors text-white md:text-slate-400 md:hover:text-white`}
                    >
                      <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">{isAnalysisOpen ? 'Lukk' : 'Se analyse'}</span>
                      <ChevronDown size={28} className={`md:!w-[10px] md:!h-[10px] transition-transform ${isAnalysisOpen ? '' : 'rotate-180'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4">
                    {(() => {
                      const oslo = OSLO_DISTRICTS[0];
                      const priceDiff = selectedDistrict.priceChange - oslo.priceChange;
                      const daysDiff = selectedDistrict.avgDaysOnMarket - oslo.avgDaysOnMarket;
                      const sqmDiff = selectedDistrict.pricePerSqm - oslo.pricePerSqm;
                      const getColor = (diff: number, invert = false) => {
                        const d = invert ? -diff : diff;
                        if (d > 0.3 || (!invert && d > 1) || (invert && diff < -1)) return 'text-emerald-400';
                        if (d < -0.3 || (!invert && d < -1) || (invert && diff > 1)) return 'text-red-400';
                        return 'text-amber-400';
                      };
                      const priceColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (priceDiff > 0.3 ? 'text-emerald-400' : priceDiff < -0.3 ? 'text-red-400' : 'text-amber-400');
                      const daysColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (daysDiff < -1 ? 'text-emerald-400' : daysDiff > 1 ? 'text-red-400' : 'text-amber-400');
                      const sqmColor = selectedDistrict.id === 'oslo' ? 'text-blue-400' : (sqmDiff > 0 ? 'text-emerald-400' : sqmDiff < 0 ? 'text-red-400' : 'text-amber-400');
                      return [
                        { icon: <TrendingUp size={18} className="md:w-7 md:h-7" />, label: "PRISENDRING", mobileLabel: "Prisendring", value: `+${selectedDistrict.priceChange}%`, mobileValue: `+${selectedDistrict.priceChange}%`, iconColor: priceColor, hideOnMobile: false },
                        { icon: <Clock size={18} className="md:w-7 md:h-7" />, label: "SALGSTID", mobileLabel: "Salgstid", value: `${selectedDistrict.avgDaysOnMarket}`, mobileValue: `${selectedDistrict.avgDaysOnMarket} dager`, iconColor: daysColor, hideOnMobile: false },
                        { icon: <Building2 size={18} className="md:w-7 md:h-7" />, label: "MEDIANPRIS", mobileLabel: "MEDIAN", value: `${(selectedDistrict.medianPrice / 1000000).toFixed(1)}M`, mobileValue: `${(selectedDistrict.medianPrice / 1000000).toFixed(1)}M`, iconColor: 'text-blue-400', hideOnMobile: true },
                        { icon: <Coins size={18} className="md:w-7 md:h-7" />, label: "KR/M²", mobileLabel: "per M2", value: `${Math.round(selectedDistrict.pricePerSqm / 1000)}k`, mobileValue: `${Math.round(selectedDistrict.pricePerSqm / 1000)} K`, iconColor: sqmColor, hideOnMobile: false }
                      ];
                    })().map((stat, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center pt-2 pb-4 px-2 gap-1 md:flex-row md:gap-4 md:py-5 md:px-4
                          ${stat.hideOnMobile ? 'hidden md:flex' : ''}
                          ${i !== 0 ? `border-l ${isDarkMode ? 'border-white/5' : 'border-slate-100'}` : ''}
                        `}
                      >
                        <div className={`hidden md:block ${stat.iconColor}`}>
                          {stat.icon}
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <div className="text-[15px] md:text-[24px] lg:text-[28px] font-black leading-tight">
                            <span className={`md:hidden ${selectedDistrict.id === 'oslo' ? 'text-white' : stat.iconColor}`}>{stat.mobileValue}</span>
                            <span className={`hidden md:inline ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                          </div>
                          <div className="text-[10px] md:text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">
                            <span className={`md:hidden ${selectedDistrict.id === 'oslo' ? 'text-white/60' : stat.iconColor}`}>{stat.mobileLabel}</span>
                            <span className={`hidden md:inline ${isDarkMode ? 'text-white' : 'text-slate-400'}`}>{stat.label}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded district analysis */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDistrictSelected && isAnalysisOpen ? 'max-h-[650px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>

                      {/* Tolkningslinje - desktop only (mobile shows in subheading) */}
                      <div className="hidden md:block px-5 pb-2">
                        <p className={`text-[14px] font-bold italic text-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {getMarketData(selectedDistrict).interpretation}
                        </p>
                        {getMarketData(selectedDistrict).trigger && (
                          <p className={`text-[12px] font-bold text-center mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Dette er et gunstig tidspunkt å vurdere salg.
                          </p>
                        )}
                      </div>

                      {/* Desktop: 3-column grid with boxes */}
                      <div className="hidden md:grid grid-cols-3 gap-4 p-5 pt-2">
                        <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Kvadratmeterpris
                            </span>
                          </div>
                          <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].pricePerSqm;
                              const diff = selectedDistrict.pricePerSqm - osloSnitt;
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på ${osloSnitt.toLocaleString('nb-NO')} kr/m² i snitt.`;
                              if (diff > 0) return `${diff.toLocaleString('nb-NO')} kr/m² over Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²). Høyere prisnivå enn byen for øvrig.`;
                              if (diff < 0) return `${Math.abs(diff).toLocaleString('nb-NO')} kr/m² under Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²). Lavere prisnivå enn byen for øvrig.`;
                              return `I takt med Oslo-snittet på ${osloSnitt.toLocaleString('nb-NO')} kr/m².`;
                            })()}
                          </p>
                        </div>

                        <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              Prisutvikling
                            </span>
                          </div>
                          <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].priceChange;
                              const diff = +(selectedDistrict.priceChange - osloSnitt).toFixed(1);
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på +${osloSnitt}% prisvekst siste 12 måneder.`;
                              if (diff > 0) return `+${diff} prosentpoeng over Oslo-snittet (${osloSnitt}%). Sterkere prisvekst enn byen for øvrig.`;
                              if (diff < 0) return `${diff} prosentpoeng under Oslo-snittet (${osloSnitt}%). Svakere prisvekst enn byen for øvrig.`;
                              return `I takt med Oslo-snittet på +${osloSnitt}% prisvekst.`;
                            })()}
                          </p>
                        </div>

                        <div className={`col-span-1 rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                              Omløpshastighet
                            </span>
                          </div>
                          <p className={`text-[14px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].avgDaysOnMarket;
                              const diff = selectedDistrict.avgDaysOnMarket - osloSnitt;
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på ${osloSnitt} dager omløpstid.`;
                              if (diff < 0) return `${Math.abs(diff)} dager raskere enn Oslo-snittet (${osloSnitt} dager). Svært likvid marked.`;
                              if (diff > 0) return `${diff} dager tregere enn Oslo-snittet (${osloSnitt} dager). Lavere likviditet.`;
                              return `I takt med Oslo-snittet på ${osloSnitt} dager omløpstid.`;
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Mobile: vertical list with divider lines */}
                      <div className="md:hidden flex flex-col px-4 py-3">
                        {/* Kvadratmeterpris */}
                        <div className="py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Kvadratmeterpris
                            </span>
                          </div>
                          <p className={`text-[12px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].pricePerSqm;
                              const diff = selectedDistrict.pricePerSqm - osloSnitt;
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på ${osloSnitt.toLocaleString('nb-NO')} kr/m².`;
                              if (diff > 0) return `${diff.toLocaleString('nb-NO')} kr/m² over Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²).`;
                              if (diff < 0) return `${Math.abs(diff).toLocaleString('nb-NO')} kr/m² under Oslo-snittet (${osloSnitt.toLocaleString('nb-NO')} kr/m²).`;
                              return `I takt med Oslo-snittet på ${osloSnitt.toLocaleString('nb-NO')} kr/m².`;
                            })()}
                          </p>
                        </div>

                        <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>

                        {/* Prisutvikling */}
                        <div className="py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              Prisutvikling
                            </span>
                          </div>
                          <p className={`text-[12px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].priceChange;
                              const diff = +(selectedDistrict.priceChange - osloSnitt).toFixed(1);
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på +${osloSnitt}% prisvekst siste 12 mnd.`;
                              if (diff > 0) return `+${diff} prosentpoeng over Oslo-snittet (${osloSnitt}%).`;
                              if (diff < 0) return `${diff} prosentpoeng under Oslo-snittet (${osloSnitt}%).`;
                              return `I takt med Oslo-snittet på +${osloSnitt}% prisvekst.`;
                            })()}
                          </p>
                        </div>

                        <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>

                        {/* Omløpshastighet */}
                        <div className="py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                              Omløpshastighet
                            </span>
                          </div>
                          <p className={`text-[12px] font-medium leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                            {(() => {
                              const osloSnitt = OSLO_DISTRICTS[0].avgDaysOnMarket;
                              const diff = selectedDistrict.avgDaysOnMarket - osloSnitt;
                              if (selectedDistrict.id === 'oslo') return `Oslo-snittet ligger på ${osloSnitt} dager omløpstid.`;
                              if (diff < 0) return `${Math.abs(diff)} dager raskere enn Oslo-snittet (${osloSnitt} dager).`;
                              if (diff > 0) return `${diff} dager tregere enn Oslo-snittet (${osloSnitt} dager).`;
                              return `I takt med Oslo-snittet på ${osloSnitt} dager omløpstid.`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle open button + CTA */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDistrictSelected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 md:py-4 md:rounded-b-xl transition-all uppercase tracking-widest text-[12px] md:text-[11px]"
                    >
                      <span className="animate-[pulse-scale_2s_ease-in-out_infinite]">{(() => {
                        const { cta } = getMarketData(selectedDistrict);
                        const name = selectedDistrict.name.replace(' (Totalt)', '');
                        if (cta === 'strong_seller') return 'Få gratis verdivurdering nå';
                        if (cta === 'mod_seller') return 'Sjekk hva boligen din kan være verdt';
                        if (cta === 'buyer') return 'Snakk med meg om markedet her';
                        return `Få verdivurdering ${getPreposition(selectedDistrict.name)} ${name}`;
                      })()}</span> <ArrowRight size={16} />
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
            Boligmarkedet {getPreposition(selectedDistrict.name)} <br/> <span className="text-blue-500">{selectedDistrict.name.replace(' (Totalt)', '')} nå</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
            <span className="md:hidden">Er det smart å selge her nå?</span>
            <span className="hidden md:inline">Få en gratis og uforpliktende verdivurdering basert på ferske salgsdata fra ditt nærområde. Tar under ett minutt.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all">
              Få gratis verdivurdering
            </button>
            <button className="bg-[#1a2333] text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-[#252f44] border border-white/5 transition-all">
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
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-all"
            >
              <MessageCircle size={18} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-all"
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
            </button>
            <button className="bg-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-blue-600 transition-all">
              Selge bolig?
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

      {/* Telegram Chat Widget */}
      <TelegramChatWidget isDarkMode={isDarkMode} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default App;
