import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { RiEyeLine, RiEyeOffLine, RiSendPlaneFill, RiCheckLine } from 'react-icons/ri';

export default function RegisterPage() {
  const register = useStore(s => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', displayName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.displayName || !form.email || !form.password) {
      setError('Заполни все поля'); return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setError('Никнейм: только латиница, цифры и _ (3–20 символов)'); return;
    }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }

    setLoading(true);
    const result = await register(form.username, form.displayName, form.email, form.password);
    setLoading(false);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error || 'Ошибка');
    }
  };

  const checks = [
    { label: 'Минимум 6 символов', ok: form.password.length >= 6 },
    { label: 'Пароли совпадают', ok: form.password === form.confirm && form.confirm.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 mb-4">
            <RiSendPlaneFill size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Создать аккаунт</h1>
          <p className="text-gray-500 text-sm mt-1">Присоединяйся к Sendly бесплатно</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Никнейм <span className="text-gray-600">(уникальный)</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                placeholder="username"
                maxLength={20}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Отображаемое имя</label>
            <input
              type="text"
              value={form.displayName}
              onChange={e => set('displayName', e.target.value)}
              placeholder="Алибек Токтосунов"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Повтори пароль</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>

          {form.password.length > 0 && (
            <div className="space-y-1">
              {checks.map(c => (
                <div key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? 'text-green-400' : 'text-gray-500'}`}>
                  <RiCheckLine size={14} className={c.ok ? 'opacity-100' : 'opacity-30'} />
                  {c.label}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
}
