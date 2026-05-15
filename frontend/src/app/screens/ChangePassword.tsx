import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { http } from '../api/http';

export function ChangePassword() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return checks;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthCount = Object.values(passwordStrength).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('パスワードが一致しません', {
        description: '確認用パスワードが一致しません',
      });
      return;
    }

    if (strengthCount < 4) {
      toast.error('パスワードが弱すぎます', {
        description: 'より強いパスワードを設定してください',
      });
      return;
    }

    if (!token) return;
    try {
      await http('/auth/change-password', {
        method: 'POST',
        token,
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      toast.success('パスワードを変更しました', {
        description: 'パスワードを変更しました',
      });
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '変更に失敗しました');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            パスワード変更
          </h1>
          <p className="text-sm text-gray-500">パスワードを更新します</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-4">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    セキュリティのヒント
                  </p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• 8文字以上のパスワードを使用してください</li>
                    <li>• 大文字、小文字、数字、記号を含めてください</li>
                    <li>• 他のサイトと同じパスワードを使用しないでください</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" />
                <span>現在のパスワード</span>
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  placeholder="現在のパスワードを入力"
                  className="rounded-[12px] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100"></div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" />
                <span>新しいパスワード</span>
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="新しいパスワードを入力"
                  className="rounded-[12px] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strengthCount
                            ? strengthCount <= 2
                              ? 'bg-red-500'
                              : strengthCount <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    強度:{' '}
                    <span
                      className={
                        strengthCount <= 2
                          ? 'text-red-600'
                          : strengthCount <= 3
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }
                    >
                      {strengthCount <= 2 ? '弱い' : strengthCount <= 3 ? '普通' : '強い'}
                    </span>
                  </p>

                  {/* Requirements Checklist */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 ${passwordStrength.length ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <span
                        className={
                          passwordStrength.length ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        8文字以上
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <span
                        className={
                          passwordStrength.uppercase ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        大文字を含む
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <span
                        className={
                          passwordStrength.lowercase ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        小文字を含む
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 ${passwordStrength.number ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <span
                        className={
                          passwordStrength.number ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        数字を含む
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 ${passwordStrength.special ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <span
                        className={
                          passwordStrength.special ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        記号を含む
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" />
                <span>パスワード確認</span>
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="新しいパスワードを再入力"
                  className="rounded-[12px] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-600">パスワードが一致しません</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1 rounded-[16px]"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-[16px] bg-blue-500 hover:bg-blue-600"
            >
              <Lock className="w-4 h-4" />
              変更を保存
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
