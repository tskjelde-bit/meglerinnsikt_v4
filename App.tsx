
import React, { useState, useRef, useEffect } from 'react';
import { Property, DistrictInfo, BlogPost } from './types';
import { MOCK_PROPERTIES, OSLO_DISTRICTS, MOCK_BLOG_POSTS } from './constants';
import MapComponent from './components/MapComponent';
import MarketStatsPanel from './components/MarketStatsPanel';
import ChatInterface from './components/ChatInterface';
import { Building2, Menu, MessageCircle, X, Map as MapIcon, BarChart3, TrendingUp, Clock, Calculator, ChevronDown, Wallet, ChevronUp, Navigation, LayoutGrid, Users, Phone, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'home' | 'innsikt'>('home');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(OSLO_DISTRICTS[0]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'stats'>('map');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveNavDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDistrictSelect = (district: DistrictInfo) => {
    setSelectedDistrict(district);
    setSelectedProperty(null);
    setIsExpanded(true);
    setIsDistrictDropdownOpen(false);
  };

  const onDistrictSelectFromMap = (district: DistrictInfo) => {
    setSelectedDistrict(district);
    setSelectedProperty(null);
    setIsExpanded(true);
  };

  const toggleNavDropdown = (name: string) => {
    setActiveNavDropdown(activeNavDropdown === name ? null : name);
  };

  const navigateTo = (page: 'home' | 'innsikt') => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  const formatMedianPrice = (price: number) => {
    if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M';
    return (price / 1000).toFixed(0) + 'k';
  };

  const ViewSwitcher = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex bg-slate-100/80 backdrop-blur p-1 rounded-full border border-slate-200/50 ${compact ? 'scale-90 origin-left' : ''}`}>
      <button 
        onClick={() => {
          setActivePage('home');
          setMobileView('map');
        }}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black transition-all uppercase tracking-wider ${activePage === 'home' && mobileView === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
      >
        <MapIcon size={12} /> Kart
      </button>
      <button 
        onClick={() => {
          navigateTo('innsikt');
        }}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black transition-all uppercase tracking-wider ${activePage === 'innsikt' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
      >
        <BarChart3 size={12} /> Innsikt
      </button>
    </div>
  );

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-12 z-[1000] sticky top-0 shrink-0">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-blue-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
              <Building2 className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-black text-slate-950 tracking-tighter uppercase">Lumina</h1>
          </div>

          {/* Main Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => navigateTo('home')}
              className={`px-4 py-2 text-[15px] font-bold transition-colors ${activePage === 'home' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
            >
              Forsiden
            </button>
            
            <div className="relative">
              <button 
                onClick={() => toggleNavDropdown('rapporter')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[15px] font-bold transition-all ${activeNavDropdown === 'rapporter' ? 'bg-slate-50 text-slate-950' : 'text-slate-700 hover:text-blue-600'}`}
              >
                Markedsrapporter 
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeNavDropdown === 'rapporter' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeNavDropdown === 'rapporter' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-2xl rounded-[24px] border border-slate-100 py-4 z-[1100] animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-6 py-3 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Markedsrapport januar 2026</button>
                  <button className="w-full px-6 py-3 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Markedsrapport desember 2025</button>
                  <button className="w-full px-6 py-3 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Markedsrapport november 2025</button>
                </div>
              )}
            </div>

            <button 
              onClick={() => navigateTo('innsikt')}
              className={`px-4 py-2 text-[15px] font-bold transition-colors ${activePage === 'innsikt' ? 'text-blue-600 underline decoration-2 underline-offset-8' : 'text-slate-700 hover:text-blue-600'}`}
            >
              Innsikt
            </button>

            <div className="relative">
              <button 
                onClick={() => toggleNavDropdown('blog')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[15px] font-bold transition-all ${activeNavDropdown === 'blog' ? 'bg-slate-50 text-slate-950' : 'text-slate-700 hover:text-blue-600'}`}
              >
                Blog 
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeNavDropdown === 'blog' ? 'rotate-180' : ''}`} />
              </button>

              {activeNavDropdown === 'blog' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-[20px] border border-slate-100 py-3 z-[1100] animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-6 py-2.5 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Topic 1</button>
                  <button className="w-full px-6 py-2.5 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Topic 2</button>
                  <button className="w-full px-6 py-2.5 text-left text-[16px] font-bold text-slate-900 hover:bg-slate-50 transition-colors">Topic 3</button>
                </div>
              )}
            </div>
            <a href="#" className="px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors">Om</a>
            <a href="#" className="px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors">Omtaler</a>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block border border-slate-200 text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all text-[15px]">
            Kontakt
          </button>
          <button className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-sm text-[15px]">
            Selge bolig?
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-[2000] animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-6">
            <button onClick={() => navigateTo('home')} className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Forsiden</button>
            <button onClick={() => navigateTo('innsikt')} className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Innsikt</button>
            <button className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Markedsrapporter</button>
            <button className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Blog</button>
            <button className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Om</button>
            <button className="text-left text-xl font-black uppercase tracking-tight text-slate-900">Kontakt</button>
          </nav>
        </div>
      )}

      {/* Conditional Page Rendering */}
      {activePage === 'home' ? (
        <>
          {/* Main Hero Area (Map + Side Panel) */}
          <section className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col lg:flex-row relative shrink-0 overflow-hidden bg-slate-50 border-b border-slate-100">
            
            {/* Map Area */}
            <div className="flex-1 relative flex flex-col">
              {/* Dropdown Selector */}
              <div className="absolute top-4 left-4 z-[500] w-[calc(100%-32px)] md:w-[320px]" ref={districtDropdownRef}>
                <button 
                  onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                  className="w-full bg-white shadow-xl rounded-2xl border border-slate-100 p-3 md:p-4 flex items-center justify-between text-left transition-all hover:bg-slate-50 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-slate-50 p-2 rounded-xl text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 shrink-0">
                      <Navigation size={16} className="-rotate-90 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-slate-900 leading-tight truncate uppercase">
                        {selectedDistrict.id === 'oslo' ? 'Utforsk Oslo' : selectedDistrict.name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Markedsdata</p>
                    </div>
                  </div>
                  <ChevronDown className={`text-slate-300 transition-transform ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} size={14} />
                </button>

                {isDistrictDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto py-2">
                      {OSLO_DISTRICTS.map(d => (
                        <button
                          key={d.id}
                          onClick={() => handleDistrictSelect(d)}
                          className={`w-full px-5 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 ${selectedDistrict.id === d.id ? 'bg-blue-50/50' : ''}`}
                        >
                          <span className={`text-xs font-bold uppercase tracking-tight ${selectedDistrict.id === d.id ? 'text-blue-600' : 'text-slate-700'}`}>{d.name}</span>
                          {selectedDistrict.id === d.id && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <MapComponent 
                properties={MOCK_PROPERTIES} 
                districts={OSLO_DISTRICTS}
                selectedProperty={selectedProperty}
                selectedDistrict={selectedDistrict}
                onPropertySelect={(p) => setSelectedProperty(p)}
                onDistrictSelect={onDistrictSelectFromMap}
              />

              {/* Floating Controls */}
              <div className="absolute bottom-6 left-4 right-4 z-[500] flex flex-col items-center pointer-events-none">
                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                  <ViewSwitcher />

                  <button 
                    onClick={() => setShowChat(true)}
                    className="bg-white/95 backdrop-blur text-slate-900 w-9 h-9 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center pointer-events-auto hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle size={18} className="text-blue-600" />
                  </button>
                </div>

                {/* Unified Data Box */}
                <div className="w-full max-w-[1000px] bg-white shadow-2xl rounded-[32px] p-1 border border-slate-100 pointer-events-auto overflow-hidden">
                  <div onClick={() => setIsExpanded(!isExpanded)} className="grid grid-cols-4 items-center px-4 py-3 md:py-4 lg:px-6 cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                      <TrendingUp className="text-blue-600 w-4 h-4 md:w-8 md:h-8" />
                      <div>
                        <div className="text-xs md:text-xl font-black text-slate-900 leading-none">+{selectedDistrict.priceChange}%</div>
                        <div className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">Prisendring</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-4 border-l border-slate-100">
                      <Clock className="text-blue-600 w-4 h-4 md:w-8 md:h-8" />
                      <div>
                        <div className="text-xs md:text-xl font-black text-slate-900 leading-none">{selectedDistrict.avgDaysOnMarket}</div>
                        <div className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">Omløp</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-4 border-l border-slate-100">
                      <Wallet className="text-blue-600 w-4 h-4 md:w-8 md:h-8" />
                      <div>
                        <div className="text-xs md:text-xl font-black text-slate-900 leading-none">{formatMedianPrice(selectedDistrict.medianPrice)}</div>
                        <div className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">Median</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-4 border-l border-slate-100">
                      <Calculator className="text-blue-600 w-4 h-4 md:w-8 md:h-8" />
                      <div>
                        <div className="text-xs md:text-xl font-black text-slate-900 leading-none">{Math.round(selectedDistrict.pricePerSqm / 1000)}k</div>
                        <div className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">Kr/m²</div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 py-5 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-6 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-1 flex items-center gap-2 justify-center md:justify-start">
                          Markedsinnsikt ({selectedDistrict.name})
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </h4>
                        <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed italic">"{selectedDistrict.description}"</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
                          Analyser min bolig
                          <ArrowRight size={14} />
                        </button>
                        <button onClick={() => setIsExpanded(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                          <ChevronUp size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Panel - Desktop */}
            <div className="hidden lg:block w-[380px] xl:w-[450px] border-l border-slate-100 shrink-0 bg-white h-full overflow-hidden">
              <MarketStatsPanel district={selectedDistrict} />
            </div>
          </section>

          {/* ADDITIONAL SECTIONS */}
          <div className="flex flex-col w-full">
            {/* Features Section */}
            <section className="bg-white py-32 px-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">Få mer ut av markedet</h2>
                  <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-16">
                  <div className="flex flex-col gap-6 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <LayoutGrid size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Sanntidsanalyse</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Jeg overvåker markedet 24/7 og gir deg oppdaterte tall på alt fra omløpshastighet til prisutvikling i ditt nabolag.</p>
                  </div>
                  <div className="flex flex-col gap-6 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Users size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">AI-Rådgivning</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Lumina AI hjelper deg med å forstå de komplekse faktorene som påvirker verdien av din bolig og det lokale markedet.</p>
                  </div>
                  <div className="flex flex-col gap-6 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Phone size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Personlig Oppfølging</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Kombiner digital presisjon med menneskelig ekspertise. Jeg står klar når du trenger det mest.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Blog Posts Section - FIXED ALIGNMENT */}
            <section className="bg-white py-32 px-8 border-t border-slate-50">
              <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase">Utvalgte innlegg</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {MOCK_BLOG_POSTS.map((post) => (
                    <div key={post.id} className="group cursor-pointer flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 mb-6 relative shrink-0">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="text-[20px] font-bold text-slate-950 leading-[1.2] mb-3 group-hover:text-blue-600 transition-colors line-clamp-3 h-[72px]">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 uppercase mt-auto">
                        <span>{post.date}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-slate-600">{post.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-slate-950 py-32 px-8 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">Klar for å <br/><span className="text-blue-500">ta neste steg?</span></h2>
                <p className="text-slate-400 text-lg mb-12 font-medium">Enten du skal selge nå eller bare er nysgjerrig på verdien, gir jeg deg de verktøyene du trenger.</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20">Vurder min bolig</button>
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10">Snakk med en rådgiver</button>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        /* Blank Insight Page - Fullscreen for all devices */
        <div className="flex-1 bg-white animate-in fade-in duration-500 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
            <h2 className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Innsikt</h2>
            <div className="h-[1px] w-12 bg-slate-100 mb-12"></div>
            {/* Blank page as requested */}
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                <BarChart3 size={24} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Innhold kommer snart</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="text-blue-600" size={28} />
              <span className="text-2xl font-black tracking-tighter uppercase">LUMINA</span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">Norges ledende plattform for datadrevet eiendomsinnsikt. Jeg gjør boligmarkedet gjennomsiktig og forståelig for alle.</p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Selskapet</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Om oss</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Karriere</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Presse</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Ressurser</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Markedsrapporter</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API Dokumentasjon</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Brukervilkår</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full md:max-w-2xl h-full md:h-[80vh] bg-white md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-xs uppercase tracking-wider">Lumina AI Assistent</h3>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <ChatInterface selectedProperty={selectedProperty} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Stats View Overlay */}
      {mobileView === 'stats' && activePage === 'home' && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 bg-white z-[1500] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
            <ViewSwitcher compact />
            <button 
              onClick={() => setMobileView('map')} 
              className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:opacity-70 active:scale-95 transition-all"
            >
              Lukk
            </button>
          </div>
          <div className="pb-20">
            <MarketStatsPanel district={selectedDistrict} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
