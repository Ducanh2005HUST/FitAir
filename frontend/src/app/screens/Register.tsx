import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('すべてのフィールドを入力してください');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('パスワードは8文字以上必要です');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('登録が完了しました！');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">FitAir</h1>
          <p className="text-gray-600">フィットエア</p>
          <p className="text-sm text-gray-500 mt-2">
            アカウントを作成 / Tạo tài khoản
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl mb-2">新規登録</h2>
          <p className="text-sm text-gray-600 mb-6">Đăng ký tài khoản mới</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm mb-2">
                お名前 / Tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="山田太郎"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2">
                メールアドレス / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2">
                パスワード / Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="8文字以上"
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm mb-2">
                パスワード確認 / Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="パスワードを再入力"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中…' : '登録する'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                ログイン
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-center text-gray-500">
          登録することで、利用規約とプライバシーポリシーに同意したことになります。
          <br />
          Bằng việc đăng ký, bạn đồng ý với điều khoản và chính sách bảo mật.
        </p>
      </div>
    </div>
  );
}
