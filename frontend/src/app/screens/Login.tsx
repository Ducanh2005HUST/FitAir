import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Wind } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('すべてのフィールドを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('ログインしました！');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center p-6 font-sans text-gray-900">
      
      {/* Header & Logo */}
      <div className="mt-12 mb-8 flex flex-col items-center w-full max-w-sm">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Wind className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          おかえりなさい
        </h1>
      </div>

      {/* Main Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <div className="relative group">
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
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <Link 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  toast.message('パスワード再設定', { description: '登録メール宛に送信するフローは後で実装します。' });
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center mt-6 py-4 px-4 border border-transparent rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400 font-medium">または</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            onClick={() => toast.message('OAuth', { description: 'Google OAuth は後で実装します。' })}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Googleでログイン
          </button>

          {/* Apple Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            onClick={() => toast.message('OAuth', { description: 'Apple Sign-In は後で実装します。' })}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.31-.82 3.59-.66 1.5.15 2.65.74 3.35 1.8-3.08 1.77-2.58 5.76.32 6.89-1.01 2.37-2.06 3.41-2.34 4.14zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Appleでログイン
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 pb-6 text-center">
        <p className="text-sm text-gray-500">
          アカウントをお持ちでないですか？{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
            新規登録
          </Link>
        </p>
      </div>

    </div>
  );
}
