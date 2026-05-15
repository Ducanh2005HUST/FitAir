import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Wind } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../api/http';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center p-6 font-sans text-gray-900">
      <div className="mt-12 mb-8 flex flex-col items-center w-full max-w-sm">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Wind className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">パスワード再設定</h1>
        <p className="mt-2 text-sm text-gray-600">メールアドレスにコードを送信します</p>
      </div>

      <div className="w-full max-w-sm">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email) return;
            setIsLoading(true);
            try {
              await http('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
              });
              toast.success('送信しました', { description: 'メールが存在する場合、コードを送信します。' });
              navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : '失敗しました');
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center mt-6 py-4 px-4 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '送信'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
            ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
