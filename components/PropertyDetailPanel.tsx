
import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { geminiService } from '../services/geminiService';
import { X, Bed, Bath, Maximize, MapPin, Sparkles, Loader2, Share2, Heart } from 'lucide-react';

interface PropertyDetailPanelProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetailPanel: React.FC<PropertyDetailPanelProps> = ({ property, onClose }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await geminiService.getPropertyAnalysis(property);
        setAnalysis(res);
      } catch (e) {
        console.error(e);
        setAnalysis("Unable to load AI analysis at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [property]);

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[450px] bg-white shadow-2xl z-[1500] flex flex-col border-r border-slate-200 animate-slide-in">
      {/* Header */}
      <div className="relative h-64 flex-shrink-0">
        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={onClose} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white text-rose-500 transition-colors">
              <Heart size={18} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xl font-bold shadow-xl">
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-black text-slate-800 mb-2">{property.title}</h2>
        <div className="flex items-center text-slate-500 mb-6">
          <MapPin size={16} className="mr-1" />
          <span>{property.address}, {property.city}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
            <Bed className="text-blue-600 mb-1" size={24} />
            <span className="font-bold text-slate-800">{property.bedrooms}</span>
            <span className="text-[10px] uppercase text-slate-400 font-semibold">Beds</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
            <Bath className="text-blue-600 mb-1" size={24} />
            <span className="font-bold text-slate-800">{property.bathrooms}</span>
            <span className="text-[10px] uppercase text-slate-400 font-semibold">Baths</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
            <Maximize className="text-blue-600 mb-1" size={24} />
            <span className="font-bold text-slate-800">{property.sqft}</span>
            <span className="text-[10px] uppercase text-slate-400 font-semibold">Sqft</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
          <p className="text-slate-600 leading-relaxed">
            {property.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {property.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={64} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Lumina AI Insight</h3>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
              <p className="text-sm text-slate-500 italic">Analyzing market data and property details...</p>
            </div>
          ) : (
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {analysis}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95">
          Schedule Tour
        </button>
        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all">
          Contact Agent
        </button>
      </div>
    </div>
  );
};

export default PropertyDetailPanel;
