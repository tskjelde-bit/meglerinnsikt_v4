
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
  const districtMarkersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([59.93, 10.78], 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Handle responsiveness: invalidate size when window resizes
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear and redraw district markers (labels)
    (Object.values(districtMarkersRef.current) as L.Marker[]).forEach(m => m.remove());
    districtMarkersRef.current = {};

    districts.forEach(d => {
      if (d.id === 'oslo') return;

      const isSelected = selectedDistrict?.id === d.id;
      const districtIcon = L.divIcon({
        className: 'district-label-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-sm transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500 scale-110 z-[1000]' : 'hover:scale-105'}">
              <div class="text-[8px] font-black text-blue-600 uppercase tracking-tighter whitespace-nowrap">
                ${d.name}
              </div>
            </div>
          </div>
        `,
        iconSize: [50, 16],
        iconAnchor: [25, 8],
      });

      const marker = L.marker([d.lat, d.lng], { icon: districtIcon, zIndexOffset: isSelected ? 1000 : 0 })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onDistrictSelect(d);
        });
      
      districtMarkersRef.current[d.id] = marker;
    });

  }, [districts, selectedDistrict, onDistrictSelect]);

  return <div ref={containerRef} className="w-full h-full grayscale-[0.3] contrast-[1.05]" />;
};

export default MapComponent;
