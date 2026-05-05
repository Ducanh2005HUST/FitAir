import { X, AlertTriangle, Wind } from 'lucide-react';
import { Link } from 'react-router';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDialog({ open, onClose }: NotificationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">通知</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-orange-900 mb-1">
                  空気質が悪化しています
                </h3>
                <p className="text-sm text-orange-700 mb-2">
                  現在のAQIは85です。屋外での運動は避けることをお勧めします。
                </p>
                <p className="text-xs text-orange-600">Chất lượng không khí xấu - Nên tránh tập ngoài trời</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/indoor"
                onClick={onClose}
                className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                室内トレーニングを見る
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">
                  明日の最適な運動時間
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  6:00–8:00が最も良い空気質です
                </p>
                <p className="text-xs text-blue-600">Thời gian tốt nhất để tập: 6:00–8:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
