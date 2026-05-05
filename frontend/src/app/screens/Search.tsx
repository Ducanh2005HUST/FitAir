import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Navigation, MapPin, X, List, SlidersHorizontal, ChevronDown, Search as SearchIcon, Star, Wind, TrendingUp, Filter } from 'lucide-react';
import type { Location } from '../data/mockData';
import { http } from '../api/http';
import { spotToLocation } from '../mappers/location';
import type { SpotDto } from '../api/types';

const districts = [
  { id: 'all', label: 'すべての地区 / Tất cả quận', labelShort: 'すべて / Tất cả' },
  { id: 'ホアンキエム区', label: 'ホアンキエム区 / Hoàn Kiếm', labelShort: 'ホアンキエム' },
  { id: 'バーディン区', label: 'バーディン区 / Ba Đình', labelShort: 'バーディン' },
  { id: 'タイホー区', label: 'タイホー区 / Tây Hồ', labelShort: 'タイホー' },
  { id: 'ドンダー区', label: 'ドンダー区 / Đống Đa', labelShort: 'ドンダー' },
];

const sportTypes = [
  { id: 'all', label: 'すべて / Tất cả' },
  { id: '武術', label: '武術 / Võ thuật (武道・格闘技)' },
  { id: 'ヨガ', label: 'ヨガ / Yoga' },
  { id: '水泳', label: '水泳 / Bơi lội' },
  { id: 'ランニング', label: 'ランニング / Chạy bộ' },
  { id: '筋トレ', label: '筋トレ / Tập gym' },
  { id: 'テニス', label: 'テニス / Tennis' },
  { id: 'バスケットボール', label: 'バスケットボール / Bóng rổ' },
  { id: 'ボルダリング', label: 'ボルダリング / Bouldering' },
];

export function Search() {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [maxDistance, setMaxDistance] = useState(10);
  const [filters, setFilters] = useState({
    indoor: false,
    outdoor: false,
    rating: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'aqi' | 'name'>('distance');

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [aqiValue, setAqiValue] = useState<number>(75);
  const [locationsData, setLocationsData] = useState<Location[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aqiOut = await http<{ aqi: number }>('/environment/aqi');
        const spots = await http<SpotDto[]>('/spots?sort=rating');
        if (cancelled) return;
        setAqiValue(aqiOut.aqi);
        setLocationsData(spots.map((s) => spotToLocation(s, aqiOut.aqi)));
      } catch {
        if (cancelled) return;
        setLocationsData([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLocations = useMemo(() => {
    let filtered = locationsData.filter((location) => {
      const matchesDistrict = selectedDistrict === 'all' || location.district.includes(selectedDistrict);
      const matchesSport = selectedSport === 'all' || location.sportTypes.some(sport => sport.includes(selectedSport));
      const matchesDistance = location.distance <= maxDistance;
      const matchesRating = location.rating >= filters.rating;

      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        location.name.toLowerCase().includes(searchLower) ||
        location.nameVi.toLowerCase().includes(searchLower) ||
        location.district.toLowerCase().includes(searchLower);

      // Note: If both indoor and outdoor are false, we show all.
      const hasTypeFilter = filters.indoor || filters.outdoor;
      const matchesType = !hasTypeFilter || (filters.indoor && location.indoor) || (filters.outdoor && !location.indoor);

      return matchesDistrict && matchesSport && matchesDistance && matchesType && matchesRating && matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'aqi':
          return a.aqi - b.aqi;
        case 'name':
          return a.nameVi.localeCompare(b.nameVi, 'vi');
        default:
          return 0;
      }
    });

    return filtered;
  }, [locationsData, selectedDistrict, selectedSport, maxDistance, filters, searchQuery, sortBy]);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#66BB6A';
    if (aqi <= 100) return '#FDD835';
    if (aqi <= 150) return '#FB8C00';
    return '#E53935';
  };

  const getMarkerPosition = (id: number) => {
    const seed = id * 1234;
    const x = 20 + ((seed * 9301 + 49297) % 233280 / 233280) * 60; 
    const y = 15 + ((seed * 4567 + 12345) % 233280 / 233280) * 70; 
    return { x, y };
  };

  const FilterPanel = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-gradient-to-br from-blue-50 to-white z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">フィルター / Bộ lọc</h2>
          </div>
          <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* District Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">地区 / Khu vực</label>
            <div className="relative">
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {districts.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Sport Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">スポーツ / Môn thể thao</label>
            <div className="relative">
              <select 
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sportTypes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Distance Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">距離 / Bán kính (từ vị trí bạn)</label>
              <span className="text-sm font-bold text-blue-600">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">場所 / Loại địa điểm</label>
            <div className="flex gap-4">
              <label className="flex flex-1 items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700">
                <input
                  type="checkbox"
                  checked={filters.indoor}
                  onChange={(e) => setFilters({ ...filters, indoor: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">室内 / Trong nhà</span>
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700">
                <input
                  type="checkbox"
                  checked={filters.outdoor}
                  onChange={(e) => setFilters({ ...filters, outdoor: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">屋外 / Ngoài trời</span>
              </label>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価 / Đánh giá tối thiểu</label>
            <div className="relative">
              <select 
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>すべて / Tất cả</option>
                <option value={3}>3.0+ ★</option>
                <option value={4}>4.0+ ★</option>
                <option value={4.5}>4.5+ ★</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedSport('all');
              setMaxDistance(10);
              setFilters({ indoor: false, outdoor: false, rating: 0 });
              setSearchQuery('');
              setSortBy('distance');
            }}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={() => setShowFilterModal(false)}
            className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md transition-colors"
          >
            Hiển thị {filteredLocations.length} kết quả
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-gray-50 flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex md:flex-col w-[400px] bg-white shadow-2xl z-20 transition-all duration-300 ${showSidebar ? 'md:translate-x-0' : 'md:-translate-x-full md:absolute'}`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <SearchIcon className="w-5 h-5 text-blue-600" /> Tìm kiếm / 検索
            </h1>
            <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên địa điểm, khu vực... / 検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSortBy('distance');
                setMaxDistance(5);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Navigation className="w-3 h-3" />
              Gần tôi
            </button>
            <button
              onClick={() => {
                setSortBy('rating');
                setFilters({ ...filters, rating: 4 });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-200"
            >
              <Star className="w-3 h-3" />
              Đánh giá cao
            </button>
            <button
              onClick={() => {
                setSortBy('aqi');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors border border-green-200"
            >
              <Wind className="w-3 h-3" />
              良いAQI / AQI tốt
            </button>
          </div>

          {/* Sort & Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="distance">並び替え: 距離 / Khoảng cách</option>
                <option value="rating">並び替え: 評価 / Đánh giá</option>
                <option value="aqi">並び替え: AQI / AQI</option>
                <option value="name">並び替え: 名前 / Tên A-Z</option>
              </select>
              <TrendingUp className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200 relative"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              {(selectedDistrict !== 'all' || selectedSport !== 'all' || filters.indoor || filters.outdoor || filters.rating > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            <span className="font-bold text-blue-600">{filteredLocations.length}</span> kết quả / 結果
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-3 space-y-2">
            {filteredLocations.map((location) => {
              const isSelected = selectedLocation === location.id.toString();
              return (
                <div
                  key={location.id}
                  id={`location-${location.id}`}
                  className={`bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-200 ${isSelected ? 'shadow-xl ring-2 ring-blue-500/20 border-blue-200' : 'shadow-sm'}`}
                  onMouseEnter={() => setSelectedLocation(location.id.toString())}
                  onMouseLeave={() => setSelectedLocation(null)}
                >
                  <div className="p-3.5">
                    <div className="flex gap-3.5">
                      <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                        <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                        {/* Indoor/Outdoor badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-white text-[10px] font-medium">
                          {location.indoor ? '室内' : '屋外'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-0.5 truncate leading-tight">{location.nameVi}</h3>
                        <p className="text-[12px] text-gray-500 mb-2.5 truncate">{location.name}</p>

                        {/* Sport types */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {location.sportTypes.slice(0, 2).map((sport, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium border border-blue-100">
                              {sport}
                            </span>
                          ))}
                          {location.sportTypes.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium">
                              +{location.sportTypes.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 mt-auto">
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getAQIColor(location.aqi) }}></div>
                            <span className="text-[10px] font-bold text-gray-700">AQI {location.aqi}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <span className="text-[10px] font-bold text-orange-700">{location.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 ml-auto">
                            <MapPin className="w-3 h-3" />
                            <span className="font-medium">{location.distance}km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/location/${location.id}`}
                      className="block mt-3 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all text-[13px] font-semibold shadow-sm hover:shadow-md"
                    >
                      詳細を見る / Xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
            {filteredLocations.length === 0 && (
              <div className="py-16 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl mt-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <SearchIcon className="w-10 h-10 text-blue-400" />
                </div>
                <p className="font-bold text-gray-800 text-lg mb-2">結果が見つかりません</p>
                <p className="text-sm text-gray-500 mb-4 max-w-xs">Không tìm thấy địa điểm nào phù hợp với bộ lọc của bạn.</p>
                <button
                  onClick={() => {
                    setSelectedDistrict('all');
                    setSelectedSport('all');
                    setMaxDistance(10);
                    setFilters({ indoor: false, outdoor: false, rating: 0 });
                    setSearchQuery('');
                    setSortBy('distance');
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button - Desktop */}
      {!showSidebar && (
        <button onClick={() => setShowSidebar(true)} className="hidden md:flex absolute top-5 left-5 z-20 bg-white p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
          <List className="w-5 h-5 text-blue-600" />
        </button>
      )}

      {/* Map Container */}
      <div className="flex-1 relative bg-[#f2ede7]">
        {/* Simulated Map Background */}
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>
          {/* Subtle street lines over simulated map */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M -100 400 Q 200 300 400 500 T 900 400" fill="none" stroke="#fff" strokeWidth="20" />
            <path d="M -100 400 Q 200 300 400 500 T 900 400" fill="none" stroke="#9bc1f9" strokeWidth="8" />
            <path d="M 200 -100 L 300 300 L 600 1000" fill="none" stroke="#fff" strokeWidth="16" />
          </svg>

          {/* Location Markers */}
          {filteredLocations.map((location, index) => {
            const position = getMarkerPosition(location.id);
            const isSelected = selectedLocation === location.id.toString();
            return (
              <div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-300 ${isSelected ? 'scale-[1.35] z-20' : 'hover:scale-110 z-10'}`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  animation: `fadeInBounce 0.4s ease-out ${index * 0.03}s both`,
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
                <div className="relative group">
                  <div
                    className="w-12 h-12 rounded-full border-[3px] border-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-center relative z-10 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)]"
                    style={{ backgroundColor: getAQIColor(location.aqi) }}
                  >
                    <MapPin className="w-5 h-5 text-white fill-white drop-shadow-sm" />
                  </div>

                  {/* Animated pulse ring */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full border-2 animate-ping opacity-75"
                      style={{ borderColor: getAQIColor(location.aqi) }}
                    ></div>
                  )}

                  {/* Pin shadow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-black/25 rounded-full blur-[3px]"></div>

                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 bg-white/98 backdrop-blur-lg rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-4 z-30 pointer-events-none border-2 border-white animate-in fade-in zoom-in duration-200">
                      {/* Arrow pointer */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-white rotate-45"></div>

                      <div className="flex gap-3 relative">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                          <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="text-sm font-bold text-gray-800 mb-1 truncate leading-tight">{location.nameVi}</h3>
                          <p className="text-[11px] text-gray-500 mb-2 truncate">{location.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-lg">
                              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span className="text-[11px] font-bold text-orange-700">{location.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-lg">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-[11px] font-medium text-gray-600">{location.distance}km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile FAB to open filters */}
        <div className="md:hidden absolute top-5 right-5 z-20 flex gap-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center gap-2 bg-white text-blue-600 px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all border border-gray-100 active:scale-95"
          >
            <Filter className="w-5 h-5" />
            <span className="text-[14px] font-bold text-gray-800">Bộ lọc</span>
            {(selectedDistrict !== 'all' || selectedSport !== 'all' || filters.indoor || filters.outdoor || filters.rating > 0) && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1.5 border-2 border-white shadow-md">
                {[selectedDistrict !== 'all', selectedSport !== 'all', filters.indoor, filters.outdoor, filters.rating > 0].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

         {/* Legend Overlay */}
         <div className="hidden lg:block absolute bottom-5 right-5 z-10 bg-white/95 backdrop-blur-lg rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5 border-2 border-white">
           <div className="flex items-center gap-2 mb-4">
             <Wind className="w-4 h-4 text-blue-600" />
             <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-700">空気質 / Chất lượng không khí</h4>
           </div>
           <div className="space-y-3 flex flex-col">
             <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full bg-[#66BB6A] shadow-md group-hover:scale-110 transition-transform"></div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-gray-800">良好 / Tốt</div>
                  <div className="text-[10px] text-gray-500">0-50 AQI</div>
                </div>
             </div>
             <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full bg-[#FDD835] shadow-md group-hover:scale-110 transition-transform"></div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-gray-800">普通 / Trung bình</div>
                  <div className="text-[10px] text-gray-500">51-100 AQI</div>
                </div>
             </div>
             <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full bg-[#FB8C00] shadow-md group-hover:scale-110 transition-transform"></div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-gray-800">悪い / Kém</div>
                  <div className="text-[10px] text-gray-500">101-150 AQI</div>
                </div>
             </div>
             <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full bg-[#E53935] shadow-md group-hover:scale-110 transition-transform"></div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-gray-800">危険 / Nguy hại</div>
                  <div className="text-[10px] text-gray-500">150+ AQI</div>
                </div>
             </div>
           </div>
         </div>

        {/* Current Location Button */}
        <button
          className="group absolute bottom-32 md:bottom-8 right-5 bg-gradient-to-br from-blue-600 to-blue-500 p-4 rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_12px_40px_rgb(59,130,246,0.4)] transition-all hover:scale-110 active:scale-95 z-20"
          title="Vị trí hiện tại / 現在地"
        >
          <Navigation className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>

      {/* Filter Modal */}
      {showFilterModal && <FilterPanel />}

      {/* Mobile Bottom Sheet List */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[32px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] max-h-[50vh] flex flex-col border-t border-gray-100 pb-16">
        <div className="flex-none p-5 pb-4 border-b border-gray-100 flex flex-col sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-[32px] z-10 w-full transition-all">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4 mx-auto"></div>

          {/* Search bar mobile */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">
              <span className="text-blue-600">{filteredLocations.length}</span> cơ sở
            </h2>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 pr-7 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">距離 / Gần</option>
                <option value="rating">評価 / Đánh giá</option>
                <option value="aqi">AQI</option>
                <option value="name">名前 / Tên</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                id={`location-${location.id}`}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-[9px] font-medium">
                      {location.indoor ? '室内' : '屋外'}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-800 mb-0.5 truncate leading-tight">{location.nameVi}</h3>
                      <p className="text-[11px] text-gray-500 mb-2 truncate">{location.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAQIColor(location.aqi) }}></div>
                        <span className="text-[10px] font-bold text-gray-700">AQI {location.aqi}</span>
                      </div>
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 rounded-md">
                        <Star className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        <span className="text-[10px] font-bold text-orange-700">{location.rating}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="font-medium">{location.distance}km</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/location/${location.id}`}
                    className="self-center p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            ))}
            {filteredLocations.length === 0 && (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <SearchIcon className="w-7 h-7 text-blue-400" />
                </div>
                <span className="text-sm font-bold text-gray-700 mb-1">Không có kết quả</span>
                <span className="text-xs text-gray-400 mb-4">Thử thay đổi bộ lọc</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSortBy('distance');
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm shadow-sm"
                >
                  Đặt lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
