import { Wind } from 'lucide-react';

interface AQIIndicatorProps {
  value: number;
  size?: 'small' | 'large';
}

export function AQIIndicator({ value, size = 'small' }: AQIIndicatorProps) {
  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { status: '良好', statusVi: 'Tốt', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' };
    if (aqi <= 100) return { status: '普通', statusVi: 'TB', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
    if (aqi <= 150) return { status: '悪い', statusVi: 'Xấu', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' };
    return { status: '危険', statusVi: 'Nguy hiểm', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' };
  };

  const aqiInfo = getAQIStatus(value);

  if (size === 'large') {
    return (
      <div className={`rounded-3xl ${aqiInfo.bgLight} p-8 text-center`}>
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 rounded-full ${aqiInfo.color} flex items-center justify-center`}>
            <Wind className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className={`text-5xl mb-2 ${aqiInfo.textColor}`}>{value}</div>
        <div className={`text-xl ${aqiInfo.textColor} mb-1`}>AQI</div>
        <div className="text-sm text-gray-600">
          {aqiInfo.status} <span className="text-xs">({aqiInfo.statusVi})</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${aqiInfo.bgLight}`}>
      <div className={`w-2 h-2 rounded-full ${aqiInfo.color}`}></div>
      <span className={`text-sm ${aqiInfo.textColor}`}>
        AQI {value} • {aqiInfo.status}
      </span>
    </div>
  );
}
