
import React, { useState, useRef, useEffect } from 'react';
import { Property, DistrictInfo, BlogPost, BlogPostFull } from './types';
import { OSLO_DISTRICTS, MOCK_BLOG_POSTS } from './constants';
import { blogService } from './services/blogService';
import MapComponent from './components/MapComponent';
import MarketStatsPanel from './components/MarketStatsPanel';
import BlogPostDetail from './components/BlogPostDetail';
import BlogAdmin from './components/admin/BlogAdmin';
import {
  Building2, Menu, X, ChevronDown, Calendar, Download,
  Plus, Minus, Layers, Target, Zap, Coins,
  ChevronRight, Compass, TrendingUp, TrendingDown, Clock,
  LineChart, ArrowRight, LayoutGrid, Users, Phone
} from 'lucide-react';

const LOGO_URL = "https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/692a5a3fb0a7a66a7673d639_Azure-stacked-c.png";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'home' | 'innsikt'>('home');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(OSLO_DISTRICTS[0]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | BlogPostFull | null>(null);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [newsletterName, setNewsletterName] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPostFull[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

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
  };

  return (
    <div className="flex flex-col bg-[#0b1120] min-h-screen text-white font-sans overflow-x-hidden">
      {/* 1. Global Header */}
      <header className="h-16 md:h-20 bg-white flex items-center justify-between px-6 lg:px-14 z-[1000] sticky top-0 shrink-0 shadow-sm">
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
          <button className="bg-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-blue-600 transition-all">
            Selge bolig?
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-900">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {activePage === 'home' ? (
        <>
          <main className="max-w-[1700px] mx-auto w-full px-6 lg:px-14 py-8">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Hjem</span> <ChevronRight size={10} className="text-slate-700" /> <span className="text-slate-300">Eiendomsinnsikt</span>
                </div>
                <h2 className="text-[28px] lg:text-[34px] font-black text-white leading-tight tracking-tight uppercase">
                  Sanntids Eiendomsinnsikt
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  Avansert dataanalyse for det norske eiendomsmarkedet
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 mb-1">
                <button className="flex items-center gap-2 bg-[#1a2333] border border-white/5 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#252f44] transition-all">
                  <Calendar size={14} className="text-slate-500" />
                  Siste 30 dager
                </button>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                  <Download size={14} />
                  Eksporter data
                </button>
              </div>
            </div>

            {/* Grid Layout - Sidebar and Map match in height naturally */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-24">
              
              {/* Left Column: Integrated Map & Stats Visualization */}
              <div className="lg:col-span-8 relative rounded-[40px] overflow-hidden border border-white/5 shadow-2xl bg-[#1a2333]/20 min-h-[500px]">
                {/* Map Layer - Fills container height dictated by sidebar */}
                <div className="absolute inset-0 z-0 bg-white">
                  <MapComponent 
                    properties={[]} 
                    districts={OSLO_DISTRICTS}
                    selectedProperty={null}
                    selectedDistrict={selectedDistrict}
                    onPropertySelect={() => {}}
                    onDistrictSelect={(d) => setSelectedDistrict(d)}
                  />
                </div>

                {/* Top Overlay: Utforsk Oslo */}
                <div className="absolute top-6 left-6 z-[500] w-64 pointer-events-auto">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <button 
                      onClick={() => setIsDistrictListOpen(!isDistrictListOpen)}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                          <Compass size={16} className="transform -rotate-45" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-0.5">Utforsk Oslo</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Klikk på en bydel i kartet</div>
                        </div>
                      </div>
                      <ChevronDown size={14} className={`text-slate-300 transition-transform ${isDistrictListOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDistrictListOpen && (
                      <div className="max-h-[300px] overflow-y-auto py-1 border-t border-slate-50 custom-scrollbar">
                        {OSLO_DISTRICTS.map((district) => (
                          <button
                            key={district.id}
                            onClick={() => { setSelectedDistrict(district); setIsDistrictListOpen(false); }}
                            className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-blue-50 transition-colors group"
                          >
                            <span className={`text-[10px] font-black uppercase tracking-tight ${selectedDistrict.id === district.id ? 'text-blue-600' : 'text-slate-600'}`}>
                              {district.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute bottom-[160px] right-6 z-[500] flex flex-col gap-2 pointer-events-auto">
                  <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg"><Plus size={18}/></button>
                  <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg"><Minus size={18}/></button>
                  <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg mt-2"><Layers size={18}/></button>
                  <button onClick={() => setSelectedDistrict(OSLO_DISTRICTS[0])} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg"><Target size={18}/></button>
                </div>

                {/* Bottom Overlay: Stats Cards - Positioned absolutely at bottom of map container */}
                <div className="absolute bottom-6 left-6 right-6 z-[500] pointer-events-none">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
                    <div className="bg-[#1a2333]/90 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-4 shadow-2xl">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Coins size={18} /></div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 text-nowrap">Pris per m²</div>
                        <div className="text-[16px] font-black text-white text-nowrap">{selectedDistrict.pricePerSqm.toLocaleString()} kr</div>
                      </div>
                    </div>
                    <div className="bg-[#1a2333]/90 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-4 shadow-2xl">
                      <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><Clock size={18} /></div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 text-nowrap">Omsetningstid</div>
                        <div className="text-[16px] font-black text-white text-nowrap">{selectedDistrict.avgDaysOnMarket} dager</div>
                      </div>
                    </div>
                    <div className="bg-[#1a2333]/90 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-4 shadow-2xl">
                      <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-500 shrink-0"><Building2 size={18} /></div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 text-nowrap">Medianpris</div>
                        <div className="text-[16px] font-black text-white text-nowrap">{(selectedDistrict.medianPrice / 1000000).toFixed(1)}M kr</div>
                      </div>
                    </div>
                    <div className="bg-[#1a2333]/90 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-4 shadow-2xl">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-500 shrink-0"><LineChart size={18} /></div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 text-nowrap">Prisvekst 12 mnd</div>
                        <div className="text-[16px] font-black text-white text-nowrap">+{selectedDistrict.priceChange}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar - Defines height of the row */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="bg-[#1a2333]/40 border border-white/5 rounded-[40px] flex flex-col shadow-xl h-full">
                  <div className="flex justify-between items-center px-8 pt-8 pb-5">
                    <h3 className="text-[13px] font-black text-white uppercase tracking-tight">Siste innlegg</h3>
                    <button className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:underline">Se alle</button>
                  </div>
                  
                  <div className="px-8 pb-8 space-y-7">
                    {/* Featured Sidebar Article */}
                    {displayPosts.length > 0 && (
                      <div className="group cursor-pointer" onClick={() => setSelectedBlogPost(displayPosts[0])}>
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5">
                          <img src={displayPosts[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">{displayPosts[0].category}</div>
                        </div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1.5 tracking-tight">{displayPosts[0].date} • {displayPosts[0].category}</div>
                        <h4 className="text-[15px] font-black text-white leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {displayPosts[0].title}
                        </h4>
                      </div>
                    )}

                    {/* List Articles */}
                    <div className="space-y-5">
                      {displayPosts.slice(1, 3).map((post) => (
                        <div key={post.id} className="flex gap-4 group cursor-pointer border-t border-white/5 pt-5" onClick={() => setSelectedBlogPost(post)}>
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5">
                            <img src={post.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-[7px] font-bold text-slate-500 uppercase mb-0.5 tracking-tight">{post.date} • {post.category}</div>
                            <h5 className="text-[12px] font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h5>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Premium Box */}
                    <div className="mt-4 bg-blue-600/10 border border-blue-500/20 p-5 rounded-[24px] relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 relative z-10">
                        <Zap size={12} className="text-blue-500 fill-current" />
                        <h6 className="text-[9px] font-black text-blue-400 uppercase tracking-tight">Premium Innsikt</h6>
                      </div>
                      <p className="text-slate-400 text-[9px] font-medium mb-4 leading-relaxed relative z-10">
                        Få tilgang til dypere data og historiske trender med vår Pro-pakke.
                      </p>
                      <button className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl text-[8px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg relative z-10">
                        Oppgrader nå
                      </button>
                      <Zap size={50} className="absolute -bottom-3 -right-3 opacity-5 text-blue-500 transform rotate-12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* 3. White Section Wrapper: Features & Blog Grid */}
          <section className="bg-white py-24 px-6 lg:px-14">
            <div className="max-w-[1700px] mx-auto">
              
              {/* Features Section */}
              <div className="text-center mb-24">
                <h2 className="text-[32px] md:text-[42px] font-black text-slate-950 uppercase tracking-tighter mb-4">
                  Få mer ut av markedet
                </h2>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-16"></div>
                
                <div className="grid md:grid-cols-3 gap-12 text-left">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                      <LayoutGrid size={28} />
                    </div>
                    <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">Sanntidsanalyse</h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                      Jeg overvåker markedet 24/7 og gir deg oppdaterte tall på alt fra omløpshastighet til prisutvikling i ditt nabolag.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                      <Users size={28} />
                    </div>
                    <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">AI-rådgivning</h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                      Lumina AI hjelper deg med å forstå de komplekse faktorene som påvirker verdien av din bolig og det lokale markedet.
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                      <Phone size={28} />
                    </div>
                    <h3 className="text-[18px] font-black text-slate-950 uppercase tracking-tight mb-4">Personlig oppfølging</h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                      Kombiner digital presisjon med menneskelig ekspertise. Jeg står klar når du trenger det mest.
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Grid Section */}
              <div className="mb-8">
                <h2 className="text-[32px] md:text-[42px] font-black text-slate-950 uppercase tracking-tighter mb-12">
                  Utvalgte innlegg
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {displayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedBlogPost(post)}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-6 shadow-xl border border-slate-100">
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

          {/* 4. Dark Section Wrapper: CTA */}
          <section className="bg-[#0b1120] py-32 px-6 lg:px-14 border-t border-white/5">
            <div className="max-w-[1700px] mx-auto text-center">
              <h2 className="text-[42px] md:text-[64px] font-black text-white leading-tight uppercase tracking-tighter mb-6">
                Klar for å <br/> <span className="text-blue-500">ta neste steg?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
                Enten du skal selge nå eller bare er nysgjerrig på verdien, gir jeg deg de verktøyene du trenger.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all">
                  Vurder min bolig
                </button>
                <button className="bg-[#1a2333] text-white px-10 py-5 rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-[#252f44] border border-white/5 transition-all">
                  Snakk med en rådgiver
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-20 text-slate-500 font-black uppercase tracking-widest text-xs">Siden er under utvikling</div>
      )}

      {/* 5. Enhanced Footer with Matching Blue Background */}
      <footer className="bg-[#0b1120] py-16 px-6 lg:px-14 border-t border-white/5">
        <div className="max-w-[1700px] mx-auto">
          {/* Top Footer Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div className="max-w-md">
              <p className="text-white text-[16px] md:text-[18px] font-medium leading-relaxed mb-10">
                Motta min månedlige oppdatering på boligmarkedet i Oslo. Faglig og ærlig om fortid, nåtid og fremtid.
              </p>
              
              {/* Inline Signup */}
              <div className="flex items-end gap-6 border-b border-white/20 pb-2 group focus-within:border-white transition-colors">
                <input 
                  type="text" 
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  placeholder="Ditt navn" 
                  className="bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40 font-medium py-1 w-48"
                />
                <button className="text-white text-[15px] font-bold whitespace-nowrap hover:opacity-70 transition-opacity uppercase tracking-widest">
                  meld meg på!
                </button>
              </div>
            </div>

            {/* Footer Logo Area */}
            <div className="shrink-0 flex flex-col items-center md:items-end">
              <img 
                src={LOGO_URL} 
                alt="Meglerinnsikt Logo" 
                className="h-24 w-auto object-contain brightness-0 invert"
              />
            </div>
          </div>

          <hr className="border-white/5 mb-10" />

          {/* Bottom Footer Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-10">
              <a href="#" className="text-white text-[13px] font-bold hover:text-blue-400 transition-colors uppercase tracking-widest">Kundeomtaler</a>
              <a href="#" className="text-white text-[13px] font-bold hover:text-blue-400 transition-colors uppercase tracking-widest">Instagram</a>
            </div>

            <button className="px-10 py-3 rounded-full border border-white/20 text-white text-[13px] font-bold hover:bg-white hover:text-[#0b1120] transition-all uppercase tracking-widest">
              Kontakt meg
            </button>
          </div>
        </div>
      </footer>

      {selectedBlogPost && (
        <BlogPostDetail
          post={selectedBlogPost}
          allPosts={displayPosts}
          onClose={() => setSelectedBlogPost(null)}
          onPostClick={(post) => setSelectedBlogPost(post)}
        />
      )}

      {isAdminOpen && (
        <BlogAdmin
          posts={blogPosts}
          onPostsChange={(posts) => setBlogPosts(posts)}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
