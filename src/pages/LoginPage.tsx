import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { RiEyeLine, RiEyeOffLine, RiSendPlaneFill } from 'react-icons/ri';

export default function LoginPage() {
  const login = useStore(s => s.login);
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login || !form.password) { setError('Заполни все поля'); return; }
    setLoading(true);
    const result = await login(form.login, form.password);
    setLoading(false);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error || 'Ошибка');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 mb-4">
            <RiSendPlaneFill size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать</h1>
          <p className="text-gray-500 text-sm mt-1">Войди в свой аккаунт Sendly</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Никнейм или email</label>
            <input
              type="text"
              value={form.login}
              onChange={e => { setForm(p => ({ ...p, login: e.target.value })); setError(''); }}
              placeholder="username или email"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-400 font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
