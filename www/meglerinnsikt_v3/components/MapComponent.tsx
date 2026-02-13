
import React, { useEffect, useRef } from 'react';
import { Property, DistrictInfo } from '../types';
import L from 'leaflet';

interface MapComponentProps {
  properties: Property[];
  districts: DistrictInfo[];
  selectedProperty: Property | null;
  selectedDistrict: DistrictInfo | null;
  onPropertySelect: (p: Property) => void;
  onDistrictSelect: (d: DistrictInfo) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  properties, 
  districts, 
  selectedProperty, 
  selectedDistrict,
  onPropertySelect, 
  onDistrictSelect 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const districtMarkersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([59.9139, 10.7522], 12);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing property markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    properties.forEach(p => {
      const isSelected = selectedProperty?.id === p.id;
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex items-center justify-center group">
            <div class="transition-all duration-300 transform ${isSelected ? 'scale-125 bg-blue-600' : 'scale-100 bg-slate-900'} 
              text-white font-black px-3 py-1.5 rounded-xl shadow-xl border-2 border-white whitespace-nowrap text-xs">
              ${(p.price / 1000000).toFixed(1)}M
            </div>
          </div>
        `,
        iconSize: [50, 24],
        iconAnchor: [25, 12],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onPropertySelect(p);
        });
      
      markersRef.current[p.id] = marker;
    });

    // Clear and draw district markers
    Object.values(districtMarkersRef.current).forEach(m => m.remove());
    districtMarkersRef.current = {};

    districts.forEach(d => {
      // Don't show marker for the "Oslo Total" overview on the map itself as a point
      if (d.id === 'oslo') return;

      const isSelected = selectedDistrict?.id === d.id;
      const districtIcon = L.divIcon({
        className: 'district-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="px-2 py-1 rounded-full bg-white/80 border border-blue-200 shadow-sm text-[10px] font-black text-blue-600 uppercase tracking-tighter whitespace-nowrap transition-all ${isSelected ? 'scale-110 border-blue-600 ring-2 ring-blue-100' : ''}">
              ${d.name}
            </div>
          </div>
        `,
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });

      const marker = L.marker([d.lat, d.lng], { icon: districtIcon, zIndexOffset: -100 })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onDistrictSelect(d);
        });
      
      districtMarkersRef.current[d.id] = marker;
    });

  }, [properties, districts, selectedProperty, selectedDistrict, onPropertySelect, onDistrictSelect]);

  return <div ref={containerRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />;
};

export default MapComponent;
