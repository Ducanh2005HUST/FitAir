import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, Mail, ShieldCheck, Wind } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../api/http';

export function ResetPassword() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const presetEmail = sp.get('email') ?? '';

  const [email, setEmail] = useState(presetEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => email && /^\d{6}$/.test(code) && newPassword.length >= 6, [email, code, newPassword]);

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center p-6 font-sans text-gray-900">
      <div className="mt-12 mb-8 flex flex-col items-center w-full max-w-sm">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Wind className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">コード入力</h1>
        <p className="mt-2 text-sm text-gray-600">6桁コードと新しいパスワードを入力してください</p>
      </div>

      <div className="w-full max-w-sm">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setIsLoading(true);
            try {
              await http('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email, code, newPassword }),
              });
              toast.success('更新しました', { description: '再度ログインしてください' });
              navigate('/login');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : '失敗しました');
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Field icon={<Mail className="h-5 w-5" />} value={email} onChange={setEmail} placeholder="メール" type="email" />
          <Field icon={<ShieldCheck className="h-5 w-5" />} value={code} onChange={setCode} placeholder="6桁コード" inputMode="numeric" />
          <Field icon={<Lock className="h-5 w-5" />} value={newPassword} onChange={setNewPassword} placeholder="新しいパスワード" type="password" />

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full flex items-center justify-center mt-6 py-4 px-4 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '更新'}
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

function Field(props: {
  icon: React.ReactNode;
  value: string;
  onChange(v: string): void;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        {props.icon}
      </div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        type={props.type ?? 'text'}
        inputMode={props.inputMode}
        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
        required
      />
    </div>
  );
}
