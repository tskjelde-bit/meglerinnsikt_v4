
import React, { useEffect, useRef, useCallback } from 'react';
import { Property, DistrictInfo } from '../types';
import L from 'leaflet';

// Choropleth color scale based on priceChange (%)
const CHOROPLETH_SCALE: [number, string][] = [
  [0, '#DBEAFE'],
  [2, '#BFDBFE'],
  [3, '#93C5FD'],
  [4, '#60A5FA'],
  [5, '#3B82F6'],
  [6, '#2563EB'],
];
const CHOROPLETH_MAX = '#1D4ED8';
const SELECTED_COLOR = '#2D4B5F';
const DEFAULT_COLOR = '#F1F5F9';

function getChoroplethColor(priceChange: number): string {
  for (let i = CHOROPLETH_SCALE.length - 1; i >= 0; i--) {
    if (priceChange >= CHOROPLETH_SCALE[i][0]) return CHOROPLETH_SCALE[i][1];
  }
  return CHOROPLETH_SCALE[0][1];
}

function getHoverColor(priceChange: number): string {
  const natural = getChoroplethColor(priceChange);
  const idx = CHOROPLETH_SCALE.findIndex(([, c]) => c === natural);
  if (idx < CHOROPLETH_SCALE.length - 1) return CHOROPLETH_SCALE[idx + 1][1];
  return CHOROPLETH_MAX;
}

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
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelMarkersRef = useRef<L.Marker[]>([]);
  const geoJsonDataRef = useRef<any>(null);
  const labelDataRef = useRef<any[]>([]);
  const dataLoadedRef = useRef(false);

  // Stable refs for callbacks
  const districtsRef = useRef(districts);
  districtsRef.current = districts;
  const selectedDistrictRef = useRef(selectedDistrict);
  selectedDistrictRef.current = selectedDistrict;
  const onDistrictSelectRef = useRef(onDistrictSelect);
  onDistrictSelectRef.current = onDistrictSelect;

  const findDistrictByName = useCallback((name: string): DistrictInfo | undefined => {
    return districtsRef.current.find(d => d.name === name);
  }, []);

  const renderGeoJson = useCallback(() => {
    const map = mapRef.current;
    const geoJsonData = geoJsonDataRef.current;
    if (!map || !geoJsonData) return;

    // Remove previous layer
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const selected = selectedDistrictRef.current;

    const layer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const name = feature?.properties?.BYDELSNAVN;
        const district = findDistrictByName(name);
        let fillColor = DEFAULT_COLOR;

        if (district) {
          if (selected && district.name === selected.name) {
            fillColor = SELECTED_COLOR;
          } else {
            fillColor = getChoroplethColor(district.priceChange);
          }
        }

        return {
          fillColor,
          fillOpacity: 0.9,
          weight: 2.5,
          color: '#FFFFFF',
          opacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature?.properties?.BYDELSNAVN;
        const district = findDistrictByName(name);

        if (!district) return;

        layer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            const target = e.target;
            const sel = selectedDistrictRef.current;
            if (!sel || district.name !== sel.name) {
              target.setStyle({
                fillColor: getHoverColor(district.priceChange),
                fillOpacity: 0.95,
              });
              target.bringToFront();
            }
            // Set pointer cursor
            const el = (target as any)._path;
            if (el) el.style.cursor = 'pointer';
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            if (geoJsonLayerRef.current) {
              geoJsonLayerRef.current.resetStyle(e.target);
            }
          },
          click: (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            onDistrictSelectRef.current(district);
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = layer;

    // Add an outer border/outline around all of Oslo for contrast
    if (!map.hasOwnProperty('_osloOutline')) {
      const outline = L.geoJSON(geoJsonData, {
        style: () => ({
          fillColor: 'transparent',
          fillOpacity: 0,
          weight: 4,
          color: '#94A3B8',
          opacity: 0.6,
        }),
        interactive: false,
      }).addTo(map);
      (map as any)._osloOutline = outline;
    }
  }, [findDistrictByName]);

  const renderLabels = useCallback(() => {
    const map = mapRef.current;
    const labels = labelDataRef.current;
    if (!map || labels.length === 0) return;

    // Remove previous labels
    labelMarkersRef.current.forEach(m => m.remove());
    labelMarkersRef.current = [];

    const selected = selectedDistrictRef.current;

    labels.forEach((feature: any) => {
      const name = feature.properties.BYDELSNAVN;
      const district = findDistrictByName(name);
      if (!district) return; // Skip Sentrum etc.

      const coords = feature.geometry.coordinates;
      const isSelected = selected && district.name === selected.name;

      const icon = L.divIcon({
        className: 'district-choropleth-label',
        html: `<div style="
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
          color: ${isSelected ? '#FFFFFF' : '#1E3A50'};
          text-shadow: ${isSelected ? '0 1px 3px rgba(0,0,0,0.4)' : '0 0 4px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.9)'};
          pointer-events: auto;
          cursor: pointer;
          user-select: none;
        ">${district.name === 'Oslo (Totalt)' ? '' : district.name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([coords[1], coords[0]], {
        icon,
        zIndexOffset: 1000,
        interactive: true,
      })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onDistrictSelectRef.current(district);
        });

      labelMarkersRef.current.push(marker);
    });
  }, [findDistrictByName]);

  // Initialize map and load data
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([59.913, 10.78], 11);

    // Tile layer for water/land context – visible enough to show fjord & surroundings
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      opacity: 0.45,
    }).addTo(map);

    mapRef.current = map;

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Load GeoJSON data
    const basePath = import.meta.env.BASE_URL || '/';
    Promise.all([
      fetch(`${basePath}oslo_bydeler.geojson`).then(r => r.json()),
      fetch(`${basePath}oslo_label_points.geojson`).then(r => r.json()),
    ]).then(([polygons, labels]) => {
      geoJsonDataRef.current = polygons;
      labelDataRef.current = labels.features;
      dataLoadedRef.current = true;
      renderGeoJson();
      renderLabels();
    }).catch(err => {
      console.error('Failed to load GeoJSON data:', err);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render when selectedDistrict changes
  useEffect(() => {
    if (!dataLoadedRef.current) return;
    renderGeoJson();
    renderLabels();
  }, [selectedDistrict, renderGeoJson, renderLabels]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#F8FAFC' }}
    />
  );
};

export default MapComponent;
