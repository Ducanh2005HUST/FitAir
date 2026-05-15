import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl mb-2">ページが見つかりません</h1>
        <p className="text-sm text-gray-500 mb-8">
          お探しのページは存在しないか、削除された可能性があります。
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>ホームに戻る</span>
        </Link>
      </div>
    </div>
  );
}
