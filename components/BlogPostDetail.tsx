
import React, { useState } from 'react';
import { BlogPost } from '../types';
import { X, ArrowRight, Linkedin, Phone, Mail, Search, Quote, Star, Menu, Building2, ChevronDown } from 'lucide-react';

const LOGO_URL = "https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/692a5a3fb0a7a66a7673d639_Azure-stacked-c.png";

interface BlogPostDetailProps {
  post: BlogPost;
  onClose: () => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post, onClose }) => {
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  const toggleNavDropdown = (name: string) => {
    setActiveNavDropdown(activeNavDropdown === name ? null : name);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* IDENTISK GLOBAL TOPPMENY SOM App.tsx */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-12 z-[1001] shrink-0">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div 
            onClick={onClose}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src={LOGO_URL} 
              alt="Meglerinnsikt Logo" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* Main Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors"
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
            </div>

            <button className="px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors">
              Innsikt
            </button>

            <div className="relative">
              <button 
                onClick={() => toggleNavDropdown('blog')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[15px] font-bold transition-all ${activeNavDropdown === 'blog' ? 'bg-slate-50 text-slate-950' : 'text-blue-600'}`}
              >
                Blog 
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeNavDropdown === 'blog' ? 'rotate-180' : ''}`} />
              </button>
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
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors group border border-slate-100"
          >
            <X size={20} className="text-slate-950 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </header>

      {/* Innholdsområde under menyen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Venstre kolonne - Sticky bilde (Låst) */}
        <div className="lg:w-[45%] h-64 lg:h-full relative shrink-0 overflow-hidden bg-slate-100">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Box (Anbefalt for deg) */}
          <div className="absolute bottom-12 left-12 right-12 hidden xl:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[32px] text-white">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 block opacity-80">Anbefalt for deg</span>
              <h3 className="text-2xl font-black mb-4 leading-tight uppercase tracking-tighter">Få bedre kontroll i boligmarkedet</h3>
              <p className="text-sm font-medium opacity-80 mb-8 max-w-[300px]">
                Jeg deler analyser, strategiske råd og konkrete vurderinger for både kjøpere og selgere.
              </p>
              <div className="flex gap-3">
                <button className="bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Bestill verdivurdering</button>
                <button className="border border-white/30 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Motta månedlig innsikt</button>
              </div>
            </div>
          </div>
        </div>

        {/* Høyre kolonne - Scrolbart blogginnhold */}
        <div className="lg:w-[55%] h-full bg-white overflow-y-auto">
          <article className="max-w-[700px] mx-auto px-8 pt-16 pb-40">
            <div className="mb-16">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 block">Markedsrapporter</span>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-950 leading-[1.05] tracking-tighter uppercase mb-10">
                Rett salgsstrategi gir store utslag i salgspris (Case fra Røa)
              </h1>
              <p className="text-lg font-medium text-slate-600 leading-relaxed mb-12">
                Rett salgsstrategi gir store utslag i salgspris, og for boligselgere i Oslo kan forskjellen ofte være flere hundre tusen kroner – uten at boligen pusset opp, endret standard eller på annen måte blitt «bedre». Det handler om å treffe markedet, forstå tilbud og etterspørsel, bruke riktig salgsfremstilling og velge en megler som faktisk gir deg de riktige rådene.
              </p>

              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-8">Hvorfor rett salgsstrategi gir store utslag i salgspris</h2>
              
              <div className="border-l-[6px] border-blue-600 pl-8 mb-16 py-2">
                <p className="font-black text-slate-950 uppercase tracking-tight mb-6">Når en bolig annonseres i Oslo, skjer det ikke i et vakuum. Prosessen påvirkes blant annet av:</p>
                <ul className="space-y-4 text-slate-600 font-medium">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Hvor mange andre boliger som ligger ute i samme område</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Hvem som er på boligjakt akkurat da</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Hvordan boligen presenteres i markedet</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Og hvordan megleren legger opp løpet</li>
                </ul>
              </div>

              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-6">Stor forskjell i markedsforholdene</h2>
              <p className="text-slate-600 font-bold mb-10">
                <span className="text-blue-600">Salg 1 ble gjennomført i et marked med mye konkurranse,</span> mens <span className="text-green-600">Salg 2 ble gjennomført med lite konkurranse.</span>
              </p>

              {/* Grafområde */}
              <div className="bg-slate-50 rounded-[32px] p-10 mb-20 border border-slate-100">
                <div className="flex justify-between items-end h-[240px] gap-2">
                  {[4, 6, 5, 7, 8, 9, 3, 5, 4, 6, 4, 5, 7, 9, 10].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-2 group relative">
                      {i === 5 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase">Salg 1</span>
                        </div>
                      )}
                      {i === 12 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                          <span className="bg-green-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase">Salg 2</span>
                        </div>
                      )}
                      <div className={`w-full rounded-t-lg transition-all ${i === 5 ? 'bg-red-400' : i === 12 ? 'bg-green-500' : 'bg-slate-300'}`} style={{ height: `${val * 10}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-8">Strategisk blinkskudd</h2>
              <p className="text-slate-600 leading-relaxed mb-12 font-medium">
                Denne artikkelen viser et konkret eksempel fra Røa i Oslo, der den samme leiligheten ble solgt to ganger på tre måneder – med hele 400 000 kroner i prisforskjell. Dette skyldtes i stor grad timing og en forståelse av markedsdynamikken i fellesferien.
              </p>

              {/* Kontaktkort */}
              <div className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden mb-24">
                <div className="p-10 border-b border-slate-200 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Kontakt</span>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-1">Torbjørn Skjelde</h3>
                  <p className="text-slate-500 font-bold text-sm">Eiendomsmegler MNEF, Partner & Siviløkonom</p>
                </div>
                <div className="p-10 bg-white flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-slate-50 shadow-sm">
                    <img src="https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/691cdde168737019d77f443a_profil-farger.avif" alt="Torbjørn" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-slate-900 font-black text-sm uppercase mb-2">Nordvik Bolig Majorstuen</p>
                    <p className="text-slate-500 text-sm font-medium">Telefon: 932 61 665</p>
                    <p className="text-slate-500 text-sm font-medium">E-post: t.skjelde@nordvikbolig.no</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
                      <Linkedin size={18} />
                    </div>
                    <div className="p-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-black transition-colors">
                      <Phone size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Artikler per tema */}
              <div>
                 <h3 className="text-[14px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12">Artikler per tema</h3>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-100 h-48 rounded-[24px] flex items-end p-8 group cursor-pointer hover:bg-blue-600 transition-all duration-500">
                       <h4 className="text-xl font-black uppercase text-slate-950 group-hover:text-white transition-colors">markedsinnsikt</h4>
                    </div>
                    <div className="bg-slate-100 h-48 rounded-[24px] flex items-end p-8 group cursor-pointer hover:bg-blue-600 transition-all duration-500">
                       <h4 className="text-xl font-black uppercase text-slate-950 group-hover:text-white transition-colors">markedsrapporter</h4>
                    </div>
                    <div className="bg-slate-100 h-48 rounded-[24px] flex items-end p-8 group cursor-pointer hover:bg-blue-600 transition-all duration-500">
                       <h4 className="text-xl font-black uppercase text-slate-950 group-hover:text-white transition-colors">tips & triks</h4>
                    </div>
                 </div>
              </div>
              
              {/* Testimonials */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
                  {[
                    { name: 'Sara', text: 'Veldig fornøyd med salget og samarbeidet.' },
                    { name: 'Erik', text: 'Profesjonell, effektiv og utrolig nøye.' },
                    { name: 'Ingeborg', text: 'En megler i toppklasse – leverte alt.' },
                    { name: 'Anna', text: 'Vanvittig god service, alltid tilgjengelig.' }
                  ].map((t, i) => (
                    <div key={i} className="bg-blue-600 p-6 rounded-[24px] text-white">
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-current text-blue-200" />)}
                      </div>
                      <h5 className="font-black text-sm mb-2">{t.name}</h5>
                      <p className="text-[11px] font-medium text-blue-100 leading-snug">{t.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;
