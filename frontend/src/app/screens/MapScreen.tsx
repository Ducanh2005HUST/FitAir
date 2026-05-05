import { Navigation, Droplet, ParkingCircle, Toilet, MapPin, X, List } from 'lucide-react';
import { locations } from '../data/mockData';
import { Link } from 'react-router';
import { AQIIndicator } from '../components/AQIIndicator';
import { useState } from 'react';

// Available districts in Hanoi
const districts = [
  { id: 'all', label: 'すべての地区 / Tất cả quận', labelShort: 'すべて / Tất cả' },
  { id: 'ホアンキエム区', label: 'ホアンキエム区 / Hoàn Kiếm', labelShort: 'ホアンキエム' },
  { id: 'バーディン区', label: 'バーディン区 / Ba Đình', labelShort: 'バーディン' },
  { id: 'タイホー区', label: 'タイホー区 / Tây Hồ', labelShort: 'タイホー' },
  { id: 'ドンダー区', label: 'ドンダー区 / Đống Đa', labelShort: 'ドンダー' },
];

export function MapScreen() {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const filteredLocations = selectedDistrict === 'all' 
    ? locations 
    : locations.filter(location => location.district.includes(selectedDistrict));

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#66BB6A';
    if (aqi <= 100) return '#FDD835';
    if (aqi <= 150) return '#FB8C00';
    return '#E53935';
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return { ja: '良好', vi: 'Tốt', range: '0-50' };
    if (aqi <= 100) return { ja: '普通', vi: 'Trung bình', range: '51-100' };
    if (aqi <= 150) return { ja: '悪い', vi: 'Xấu', range: '101-150' };
    return { ja: '危険', vi: 'Nguy hiểm', range: '151+' };
  };

  // Generate pseudo-random positions for markers based on location id
  const getMarkerPosition = (id: number) => {
    const seed = id * 1234;
    const x = 20 + ((seed * 9301 + 49297) % 233280 / 233280) * 60; // 20-80%
    const y = 15 + ((seed * 4567 + 12345) % 233280 / 233280) * 70; // 15-85%
    return { x, y };
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-gray-50 flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <div 
        className={`
          hidden md:flex md:flex-col
          w-96 bg-white shadow-xl z-20
          transition-all duration-300
          ${showSidebar ? 'md:translate-x-0' : 'md:-translate-x-full md:absolute'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg">地区別マップ / Bản đồ</h1>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-600">
            地区を選んでその地域のスポーツ施設を確認 / Chọn quận để xem cơ sở thể thao
          </p>
        </div>

        {/* District Selector */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs mb-2">地区を選択 / Chọn quận</h3>
          <div className="flex flex-col gap-2">
            {districts.map((district) => (
              <button
                key={district.id}
                onClick={() => setSelectedDistrict(district.id)}
                className={`px-3 py-2 rounded-lg text-xs text-left transition-all ${
                  selectedDistrict === district.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {district.label}
              </button>
            ))}
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-xs text-gray-600">
            {filteredLocations.length}件の施設 / {filteredLocations.length} cơ sở
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-auto">
          {filteredLocations.map((location) => {
            const aqiLabel = getAQILabel(location.aqi);
            const isSelected = selectedLocation === location.id.toString();
            return (
              <div
                key={location.id}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setSelectedLocation(location.id.toString())}
                onMouseLeave={() => setSelectedLocation(null)}
              >
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1 truncate">{location.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 truncate">{location.nameVi}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getAQIColor(location.aqi) }}
                      ></div>
                      <span className="text-xs">AQI: {location.aqi}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{location.district}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/location/${location.id}`}
                  className="block mt-2 text-center bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  詳細 / Chi tiết
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle Sidebar Button - Desktop */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="hidden md:block absolute top-4 left-4 z-30 bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <List className="w-5 h-5 text-blue-600" />
        </button>
      )}

      {/* Map Container */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Simulated Map Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        >
          {/* Streets overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#999" strokeWidth="2" />
            <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="#999" strokeWidth="2" />
            <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#999" strokeWidth="2" />
            <line x1="70%" y1="10%" x2="70%" y2="90%" stroke="#999" strokeWidth="2" />
          </svg>

          {/* Location Markers */}
          {filteredLocations.map((location) => {
            const position = getMarkerPosition(location.id);
            const isSelected = selectedLocation === location.id.toString();
            return (
              <div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all ${
                  isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onMouseEnter={() => setSelectedLocation(location.id.toString())}
                onMouseLeave={() => setSelectedLocation(null)}
                onClick={() => {
                  const element = document.getElementById(`location-${location.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
              >
                {/* Marker Pin */}
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: getAQIColor(location.aqi) }}
                  >
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                  
                  {/* Info Card on Hover */}
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl p-3 z-20">
                      <div className="flex gap-2">
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium mb-1 truncate">{location.name}</h3>
                          <p className="text-xs text-gray-600 mb-1 truncate">{location.nameVi}</p>
                          <div className="flex items-center gap-1 text-xs">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getAQIColor(location.aqi) }}
                            ></div>
                            <span>AQI: {location.aqi}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/location/${location.id}`}
                        className="block mt-2 text-center bg-blue-600 text-white py-1.5 rounded text-xs hover:bg-blue-700"
                      >
                        詳細を見る / Xem chi tiết
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* District Selector Overlay - Mobile */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-20">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <h3 className="text-xs mb-2">地区を選択 / Chọn quận</h3>
            <div className="grid grid-cols-2 gap-2">
              {districts.map((district) => (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(district.id)}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedDistrict === district.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {district.labelShort}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {filteredLocations.length}件 / {filteredLocations.length} cơ sở
            </div>
          </div>
        </div>

        {/* Legend Overlay */}
        {showLegend && (
          <div className="absolute bottom-24 md:bottom-6 left-4 z-20 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium">凡例 / Chú giải</h3>
              <button
                onClick={() => setShowLegend(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* AQI Levels */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">良好 (0-50) / Tốt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">普通 (51-100) / TB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs">悪い (101-150) / Xấu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">危険 (151+) / Nguy hiểm</span>
              </div>
            </div>

            {/* Facility Icons */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs mb-1.5">施設 / Tiện ích</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ParkingCircle className="w-3 h-3" />
                  <span className="text-xs">駐車場 / Bãi đỗ xe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Toilet className="w-3 h-3" />
                  <span className="text-xs">トイレ / WC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-3 h-3" />
                  <span className="text-xs">水 / Nước</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Legend Button */}
        {!showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-24 md:bottom-6 left-4 z-20 bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xs"
          >
            凡例 / Chú giải
          </button>
        )}

        {/* Current Location Button */}
        <button className="absolute bottom-24 md:bottom-6 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow z-20">
          <Navigation className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl max-h-64 overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">
            {filteredLocations.length}件の施設 / {filteredLocations.length} cơ sở
          </h2>
        </div>
        <div className="overflow-auto max-h-48">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              id={`location-${location.id}`}
              className="p-3 border-b border-gray-100"
            >
              <div className="flex gap-3">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium mb-1 truncate">{location.name}</h3>
                  <p className="text-xs text-gray-600 mb-1 truncate">{location.nameVi}</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getAQIColor(location.aqi) }}
                    ></div>
                    <span className="text-xs">AQI: {location.aqi}</span>
                  </div>
                </div>
                <Link
                  to={`/location/${location.id}`}
                  className="self-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}