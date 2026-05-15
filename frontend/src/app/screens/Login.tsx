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
                to="/forgot-password"
                onClick={(e) => {
                  // allow navigation
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
        {/* Social login removed (email/password only) */}
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
