
import React from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: (p: Property) => void;
  isSelected: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isSelected }) => {
  return (
    <div 
      onClick={() => onClick(property)}
      className={`group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent'}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-slate-800 shadow-sm">
          {property.type}
        </div>
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg font-bold shadow-lg">
          ${property.price.toLocaleString()}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-800 truncate mb-1">{property.title}</h3>
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>
        
        <div className="flex justify-between items-center text-slate-600 border-t pt-3">
          <div className="flex items-center gap-1">
            <Bed size={16} />
            <span className="text-sm font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span className="text-sm font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize size={16} />
            <span className="text-sm font-medium">{property.sqft} <span className="text-[10px] uppercase text-slate-400">sqft</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
