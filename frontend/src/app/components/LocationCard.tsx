import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router';
import { Location } from '../data/mockData';
import { AQIIndicator } from './AQIIndicator';

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="relative h-40">
        {location.image ? (
          <img 
            src={location.image} 
            alt={location.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" aria-label={location.name} />
        )}
        <div className="absolute top-2 right-2">
          <AQIIndicator value={location.aqi} />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{location.name}</h3>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4 fill-current" />
            <span>{Number(location.rating || 0).toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location.distance}km</span>
          </div>
          
          <div className="text-blue-600">
            {location.price}
          </div>
        </div>
        
        {/* Sport Types */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {location.sportTypes.slice(0, 2).map((sport) => (
              <span
                key={sport}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {sport}
              </span>
            ))}
            {location.sportTypes.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{location.sportTypes.length - 2}
              </span>
            )}
          </div>
        </div>
        
        <div className="pb-3 border-b border-gray-100">
          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
            location.indoor 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {location.indoor ? '室内' : '屋外'}
          </span>
        </div>

        {/* View Details Button */}
        <Link
          to={`/location/${location.id}`}
          className="block mt-3 w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
}
