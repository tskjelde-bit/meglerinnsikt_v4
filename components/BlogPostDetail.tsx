
import React, { useState } from 'react';
import { BlogPost, BlogPostFull } from '../types';
import { MOCK_BLOG_POSTS } from '../constants';
import BlogContentRenderer from './BlogContentRenderer';
import {
  X, Linkedin, Phone, ChevronDown, Clock, Share2, Bookmark,
  Target, Layout, Search, Mail, ArrowRight, User, Sparkles,
  Zap, Bell, Calendar, TrendingUp, ChevronRight, MessageSquare,
  Facebook, Twitter, MoreHorizontal, Download, Map as MapIcon,
  TrendingDown, CheckCircle2, ListOrdered, Tag, ArrowUpRight
} from 'lucide-react';

const LOGO_URL = "https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/692a5a3fb0a7a66a7673d639_Azure-stacked-c.png";

const DEFAULT_AUTHOR = {
  name: 'Torbjørn Skjelde',
  title: 'Markedsanalytiker & Partner',
  image: 'https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/691cdde168737019d77f443a_profil-farger.avif'
};

interface BlogPostDetailProps {
  post: BlogPost | BlogPostFull;
  allPosts?: (BlogPost | BlogPostFull)[];
  onClose: () => void;
  onPostClick?: (post: BlogPost | BlogPostFull) => void;
}

function isFullPost(post: BlogPost | BlogPostFull): post is BlogPostFull {
  return 'content' in post && Array.isArray((post as BlogPostFull).content);
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post, allPosts, onClose, onPostClick }) => {
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const toggleNavDropdown = (name: string) => {
    setActiveNavDropdown(activeNavDropdown === name ? null : name);
  };

  const postsSource = allPosts || MOCK_BLOG_POSTS;
  const relatedPosts = postsSource.filter(p => p.id !== post.id).slice(0, 3);

  const full = isFullPost(post);
  const author = full ? post.author : DEFAULT_AUTHOR;
  const readTime = full ? post.readTime : '12 Min Read';
  const tags = full ? post.tags : ['RealEstate', 'DataAnalysis', 'Economy2026'];
  const excerpt = full ? post.excerpt : '';

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">

      {/* GLOBAL HEADER */}
      <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-14 z-[1001] shrink-0 sticky top-0 shadow-sm">
        <div className="flex items-center gap-10">
          <div onClick={onClose} className="flex items-center gap-3 cursor-pointer group">
            <img src={LOGO_URL} alt="Meglerinnsikt Logo" className="h-10 md:h-12 w-auto object-contain" />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <button onClick={onClose} className="text-[14px] font-bold text-slate-700 hover:text-blue-600 transition-colors">Forsiden</button>
            <div className="relative">
              <button onClick={() => toggleNavDropdown('rapporter')} className={`flex items-center gap-1.5 text-[14px] font-bold transition-all ${activeNavDropdown === 'rapporter' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}>
                Markedsrapporter <ChevronDown size={14} />
              </button>
            </div>
            <button className="text-[14px] font-bold text-slate-700 hover:text-blue-600 transition-colors">Innsikt</button>
            <div className="relative">
              <button onClick={() => toggleNavDropdown('blog')} className="flex items-center gap-1.5 text-[14px] font-bold text-blue-600">
                Blog <ChevronDown size={14} />
              </button>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
            <Search size={14} className="text-slate-400" />
            <input type="text" placeholder="Søk artikler..." className="bg-transparent border-none outline-none text-xs font-medium text-slate-600 w-32" />
          </div>
          <button className="bg-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-blue-600 transition-all">
            Selge bolig?
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover brightness-[0.7] transform scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-14 pb-20 text-white">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> {readTime} • {post.date}, 2026
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black leading-[1.05] tracking-tighter mb-8 max-w-4xl uppercase">
            {post.title}
          </h1>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden shadow-xl">
              <img src={author.image} alt="Author" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-xl uppercase tracking-tight">{author.name}</p>
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">{author.title}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE CONTENT & SIDEBAR */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-14 py-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* MAIN COLUMN */}
          <article className="lg:w-2/3">
            {full && post.content.length > 0 ? (
              <BlogContentRenderer blocks={post.content} />
            ) : (
              <div className="prose prose-slate max-w-none">
                <h2 className="text-[34px] font-black text-slate-950 uppercase tracking-tight mt-0 mb-8 leading-tight">
                  Introduksjon: Et marked i transformasjon
                </h2>

                <p className="text-xl leading-relaxed text-slate-600 font-medium mb-12">
                  Når vi nå beveger oss inn i 2026, fortsetter det norske eiendomsmarkedet å vise en bemerkelsesverdig motstandskraft til tross for svingende renter. Våre nyeste data indikerer et betydelig skifte i urban boligetterspørsel, drevet av en blanding av teknologisk integrasjon og endrede boligpreferanser.
                </p>

                <div className="my-16 rounded-[40px] overflow-hidden shadow-xl border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200"
                    alt="Urban landscape"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
                    Figur 1: Urban fortetting og moderne arkitektur i Bjørvika-området.
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-16 mb-6">
                  Endring i urban boligetterspørsel
                </h3>

                <p className="text-slate-600 leading-relaxed mb-10">
                  Urbane sentre opplever en "ny bølge" av revitalisering. I motsetning til perioden før 2020, er dagens etterspørsel tungt vektet mot blandede utviklingsprosjekter som tilbyr omfattende fasiliteter. Dataene tyder på at prisstabilitet er i ferd med å returnere til de store storbyområdene, med en 4,2% økning i medianverdier sammenlignet med i fjor.
                </p>

                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 mb-12">
                  <h4 className="text-[14px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6">Viktige drivere:</h4>
                  <ul className="space-y-4 m-0 p-0 list-none">
                    {[
                      "Økt fleksibilitet i arbeidslivet gir rom for mer fokus på bokvalitet.",
                      "Høyere krav til energieffektivitet i nybygg (BREEAM-sertifisering).",
                      "Sentralisering mot kollektivknutepunkter fortsetter å eskalere.",
                      "Demografiske skifter: Flere aleneboende søker sosiale bofellesskap."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-start text-slate-700 font-medium">
                        <CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">
                  Analyse av sekundærboligmarkedet
                </h4>

                <p className="mb-10 text-slate-600">
                  Vi ser en markant nedgang i antall sekundærboliger for salg, noe som tyder på at investorer nå sitter på gjerdet i påvente av rentekutt. Dette skaper et vakuum i leiemarkedet som igjen presser leieprisene oppover i de sentrale bydelene.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
                  <div className="rounded-[32px] overflow-hidden shadow-lg">
                    <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover" />
                    <div className="p-3 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Interiør trender 2026</div>
                  </div>
                  <div className="rounded-[32px] overflow-hidden shadow-lg">
                    <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover" />
                    <div className="p-3 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Materialvalg og estetikk</div>
                  </div>
                </div>

                <h5 className="text-[16px] font-black text-slate-900 uppercase tracking-tight mb-4">
                  Presisjon i prissetting
                </h5>

                <p className="text-slate-600 mb-8">
                  I dagens marked er marginene små. En feilpriset bolig kan bli liggende i månedsvis, mens en korrekt priset bolig ofte går etter første visningsrunde. Her er de kritiske stegene vi følger:
                </p>

                <div className="space-y-8 mb-16">
                  {[
                    { t: "Markeds-benchmark", d: "Vi sammenligner med faktiske salgspriser de siste 30 dagene, ikke bare prisantydning." },
                    { t: "Kjøper-persona", d: "Vi identifiserer hvem som er den ideelle kjøperen og tilpasser markedsføringen deretter." },
                    { t: "Algoritmisk synlighet", d: "Våre AI-verktøy sikrer at annonsen din treffer de som faktisk har finansieringsbeviset klart." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0 group-hover:bg-blue-600 transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <h6 className="text-[15px] font-black text-slate-900 uppercase mb-1">{item.t}</h6>
                        <p className="text-[14px] text-slate-500 font-medium leading-relaxed m-0">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-10 border-l-[8px] border-blue-600 bg-blue-50/50 rounded-r-[32px] my-16">
                  <p className="text-2xl font-black text-slate-900 italic leading-snug tracking-tight">
                    "Dataene lyver ikke – vi er vitne til en fundamental restrukturering av hvordan folk verdsetter boareal."
                  </p>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  Oppsummert ser vi at markedet i Oslo er i ferd med å profesjonaliseres ytterligere. Kravene til både selger og megler øker, og det er de som benytter seg av de beste verktøyene som vil stå igjen som vinnere.
                </p>
              </div>
            )}

            {/* ARTICLE TAGS & SHARE */}
            <div className="mt-24 pt-10 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-3">
                {tags.map(tag => (
                  <span key={tag} className="px-5 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                  <Share2 size={20} />
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32 space-y-12">

              {/* MOST READ SECTION */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <TrendingUp size={18} className="text-blue-600" />
                  Mest lest
                </h3>
                <div className="space-y-8">
                  {[
                    { title: "Hvorfor kontorlokaler tilpasses hybridhverdagen", read: "4 min", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200" },
                    { title: "Luksusmarkedet: Strandperler leder an veksten", read: "7 min", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200" },
                    { title: "Rentenivået: Hva kan vi forvente fra Fed i Q4?", read: "6 min", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=200" }
                  ].map((item, i) => (
                    <a key={i} className="group flex gap-5 cursor-pointer" href="#">
                      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border border-slate-100">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 uppercase leading-snug group-hover:text-blue-600 transition-colors tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{item.read} lesing</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              {/* POSTS BY TOPIC SECTION */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <Tag size={18} className="text-blue-600" />
                  Innlegg etter emne
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'Markedsinnsikt', count: 24, color: 'bg-blue-600' },
                    { name: 'Markedsrapporter', count: 12, color: 'bg-emerald-600' },
                    { name: 'Tips & Triks', count: 8, color: 'bg-orange-600' }
                  ].map((topic) => (
                    <button
                      key={topic.name}
                      className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${topic.color}`}></div>
                        <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                          {topic.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-300 group-hover:text-slate-500">{topic.count}</span>
                        <ArrowUpRight size={14} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* INTERACTIVE MAP CTA CARD */}
              <div className="relative bg-slate-950 rounded-[40px] overflow-hidden p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-900/40">
                    <MapIcon size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Interactive Market Explorer</h3>
                  <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
                    Visualiser lokale markedstrender helt ned på bydelsnivå. Se historiske prisendringer og varmekart i sanntid.
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/40"
                  >
                    Utforsk kartet
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="mt-10 relative h-40 rounded-3xl overflow-hidden bg-slate-900 border border-white/5 opacity-50">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                   </div>
                </div>
              </div>

              {/* WEEKLY MARKET PULSE */}
              <div className="bg-blue-50/50 rounded-[40px] p-10 border border-blue-100 text-center shadow-sm">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <Mail size={28} className="text-blue-600" />
                </div>
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3">Weekly Market Pulse</h4>
                <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed">Få kuraterte datainnsikter levert hver mandag morgen.</p>
                <div className="space-y-3">
                  <input
                    className="w-full text-sm rounded-2xl border-slate-200 bg-white px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Din e-postadresse"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button className="w-full text-[11px] font-black bg-slate-950 text-white py-4 rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-xl">
                    Meld deg på
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>

      {/* YOU MIGHT ALSO LIKE SECTION */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight mb-16">Du vil kanskje også like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {relatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.id}
                onClick={() => {
                  if (onPostClick) {
                    onPostClick(relatedPost);
                  } else {
                    onClose();
                  }
                }}
                className="bg-white rounded-[40px] overflow-hidden border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-600 border border-white">
                    {relatedPost.category}
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-xl font-black text-slate-950 uppercase leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-6 line-clamp-2 leading-relaxed">
                    {isFullPost(relatedPost) && relatedPost.excerpt
                      ? relatedPost.excerpt
                      : 'Dykk ned i de nyeste trendene og få innsikten du trenger for å lykkes i det norske boligmarkedet.'}
                  </p>
                  <div className="mt-8 flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Les hele saken <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1120] py-20 px-6 lg:px-14 border-t border-white/5 z-[1002]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
            <div className="max-w-md">
              <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-6">Meld deg på nyhetsbrevet</h2>
              <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-10">
                Motta min månedlige oppdatering på boligmarkedet i Oslo. Faglig og ærlig om fortid, nåtid og fremtid.
              </p>

              <div className="flex items-end gap-6 border-b border-white/10 pb-4 group focus-within:border-white transition-colors">
                <input
                  type="text"
                  placeholder="Ditt navn eller e-post"
                  className="bg-transparent border-none outline-none text-white text-[15px] placeholder:text-slate-600 font-medium py-1 w-full"
                />
                <button className="text-blue-500 text-[13px] font-black whitespace-nowrap hover:text-white transition-colors uppercase tracking-[0.2em]">
                  Meld meg på!
                </button>
              </div>
            </div>

            <div className="shrink-0">
              <img src={LOGO_URL} alt="Meglerinnsikt Logo" className="h-24 w-auto brightness-0 invert opacity-40" />
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Kundeomtaler</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>

            <button className="px-10 py-4 rounded-full border border-white/10 text-white text-[11px] font-black hover:bg-white hover:text-[#0b1120] transition-all uppercase tracking-widest shadow-xl">
              Kontakt meg
            </button>
          </div>

          <div className="mt-16 text-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">
            © 2026 MEGLERINNSIKT AS • ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostDetail;
