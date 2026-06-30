import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { RelationType, User } from '../types';
import { api, ApiError } from '../api/client';
import { RiSendPlaneFill, RiUserSearchLine, RiCheckLine } from 'react-icons/ri';

const relations: { value: RelationType; label: string; emoji: string }[] = [
  { value: 'friend', label: 'Друг', emoji: '🧑‍🤝‍🧑' },
  { value: 'partner', label: 'Муж/Жена', emoji: '💑' },
  { value: 'family', label: 'Семья', emoji: '👨‍👩‍👧' },
  { value: 'colleague', label: 'Коллега', emoji: '💼' },
];

const quickAmounts = [500, 1000, 2000, 5000];

export default function SendRequestPage() {
  const sendRequest = useStore(s => s.sendRequest);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState(searchParams.get('to') || '');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [relation, setRelation] = useState<RelationType>('friend');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!username) { setTargetUser(null); return; }
    const handle = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const data = await api<{ user: User }>(`/users/lookup/${encodeURIComponent(username)}`);
        setTargetUser(data.user);
      } catch {
        setTargetUser(null);
      } finally {
        setLookupLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = Number(amount);
    if (!username) { setError('Укажи никнейм получателя'); return; }
    if (!numAmount || numAmount <= 0) { setError('Укажи корректную сумму'); return; }
    if (!message.trim()) { setError('Напиши сообщение — зачем нужны деньги'); return; }

    setLoading(true);
    const result = await sendRequest(username, numAmount, message.trim(), relation);
    setLoading(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate('/requests'), 1300);
    } else {
      setError(result.error || 'Ошибка');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 mb-4 animate-pulse">
            <RiCheckLine size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Заявка отправлена!</h2>
          <p className="text-gray-500 text-sm">@{username} получит уведомление</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Скинь мне деньги 💸</h1>
        <p className="text-gray-500 text-sm mt-1">Отправь заявку на перевод другу, мужу/жене или коллеге</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Recipient */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Кому отправить заявку</label>
          <div className="relative">
            <RiUserSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace('@', ''))}
              placeholder="никнейм получателя"
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>
          {username && (
            <p className={`text-xs mt-1.5 ${targetUser ? 'text-green-400' : 'text-gray-500'}`}>
              {lookupLoading
                ? 'Ищем...'
                : targetUser
                  ? `✓ Найден: ${targetUser.displayName}`
                  : 'Пользователь не найден'}
            </p>
          )}
        </div>

        {/* Relation */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Кто это для тебя</label>
          <div className="grid grid-cols-2 gap-2">
            {relations.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRelation(r.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  relation === r.value
                    ? 'bg-brand-500/15 border-brand-500 text-brand-500'
                    : 'bg-surface border-border text-gray-400 hover:border-gray-600'
                }`}
              >
                <span>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Сумма (сом)</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-2xl font-bold"
          />
          <div className="flex gap-2 mt-2">
            {quickAmounts.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className="flex-1 bg-surface border border-border rounded-lg py-1.5 text-xs text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                {a.toLocaleString('ru')}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Сообщение</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Например: скинь денег на такси 🚕"
            rows={3}
            maxLength={200}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
          />
          <p className="text-xs text-gray-600 mt-1 text-right">{message.length}/200</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? 'Отправляем...' : (<><RiSendPlaneFill size={18} /> Отправить заявку</>)}
        </button>
      </form>
    </div>
  );
}
