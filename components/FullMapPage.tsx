import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent, { MapComponentHandle, TileLayerKey, TILE_LAYERS } from './MapComponent';
import { OSLO_DISTRICTS } from '../constants';
import { DistrictInfo } from '../types';
import { Plus, Minus, Layers, Target, Sun, Moon } from 'lucide-react';

const LOGO_URL = "https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/692a5a3fb0a7a66a7673d639_Azure-stacked-c.png";

interface FullMapPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const FullMapPage: React.FC<FullMapPageProps> = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const mapComponentRef = useRef<MapComponentHandle>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(OSLO_DISTRICTS[0]);
  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerKey>('blue');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const handleDistrictSelect = (district: DistrictInfo) => {
    setSelectedDistrict(district);
    if (mapComponentRef.current) {
      mapComponentRef.current.flyToDistrict(district.id);
    }
  };

  const handleZoomIn = () => {
    if (mapComponentRef.current) {
      mapComponentRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapComponentRef.current) {
      mapComponentRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapComponentRef.current) {
      mapComponentRef.current.flyToDistrict(selectedDistrict.id);
    }
  };

  const handleTileLayerChange = (layer: TileLayerKey) => {
    setActiveTileLayer(layer);
    setIsLayerMenuOpen(false);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="h-16 md:h-20 bg-white flex items-center justify-between px-3 lg:px-14 z-[1000] shrink-0 shadow-sm">
        <div className="flex items-center gap-10">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
            <img
              src={LOGO_URL}
              alt="Meglerinnsikt Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-[14px] font-bold text-slate-700 hover:text-blue-600">
              Forsiden
            </button>
            <button className="text-[14px] font-bold text-blue-600">
              Kart
            </button>
          </nav>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} className="text-slate-700" /> : <Moon size={20} className="text-slate-700" />}
        </button>
      </header>

      {/* Full Map Container */}
      <div className="flex-1 relative">
        <MapComponent
          ref={mapComponentRef}
          districts={OSLO_DISTRICTS}
          selectedDistrictId={selectedDistrict.id}
          onDistrictSelect={handleDistrictSelect}
          activeTileLayer={activeTileLayer}
          isDarkMode={isDarkMode}
        />

        {/* Map Controls - positioned absolutely over the map */}
        <div className="absolute top-4 right-4 z-[600] flex flex-col gap-2">
          {/* Zoom Controls */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors border-b border-slate-200"
              aria-label="Zoom inn"
            >
              <Plus size={20} className="text-slate-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
              aria-label="Zoom ut"
            >
              <Minus size={20} className="text-slate-700" />
            </button>
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Sentrer kart"
          >
            <Target size={20} className="text-slate-700" />
          </button>

          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              aria-label="Velg kartlag"
            >
              <Layers size={20} className="text-slate-700" />
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-2xl overflow-hidden min-w-[160px]">
                {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                  <button
                    key={key}
                    onClick={() => handleTileLayerChange(key as TileLayerKey)}
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      activeTileLayer === key
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* District Info Panel - positioned at bottom left */}
        <div className="absolute bottom-4 left-4 z-[600] bg-white rounded-lg shadow-2xl p-4 max-w-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {selectedDistrict.name.replace(' (Totalt)', '')}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Prisvekst (12 mnd):</span>
              <span className="font-semibold text-slate-900">+{selectedDistrict.priceChange}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pris per m²:</span>
              <span className="font-semibold text-slate-900">
                {selectedDistrict.pricePerSqm.toLocaleString('nb-NO')} kr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Salgstid:</span>
              <span className="font-semibold text-slate-900">
                {selectedDistrict.avgDaysOnMarket} dager
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullMapPage;
