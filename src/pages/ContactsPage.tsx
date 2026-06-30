import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { RelationType } from '../types';
import { RiUserAddLine, RiSendPlaneLine } from 'react-icons/ri';

const relations: { value: RelationType; label: string; emoji: string }[] = [
  { value: 'friend', label: 'Друг', emoji: '🧑‍🤝‍🧑' },
  { value: 'partner', label: 'Муж/Жена', emoji: '💑' },
  { value: 'family', label: 'Семья', emoji: '👨‍👩‍👧' },
  { value: 'colleague', label: 'Коллега', emoji: '💼' },
];

export default function ContactsPage() {
  const currentUser = useStore(s => s.currentUser);
  const contacts = useStore(s => s.contacts);
  const addContact = useStore(s => s.addContact);
  const loadContacts = useStore(s => s.loadContacts);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [relation, setRelation] = useState<RelationType>('friend');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  if (!currentUser) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username) { setError('Укажи никнейм'); return; }
    setLoading(true);
    const result = await addContact(username, relation);
    setLoading(false);
    if (result.ok) {
      setSuccess(`${username} добавлен в контакты`);
      setUsername('');
    } else {
      setError(result.error || 'Ошибка');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Контакты</h1>
        <p className="text-gray-500 text-sm mt-1">Друзья, семья и близкие люди в Sendly</p>
      </div>

      {/* Add contact form */}
      <form onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <RiUserAddLine size={18} className="text-brand-500" /> Добавить контакт
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-3 py-2 rounded-lg">{success}</div>
        )}

        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value.replace('@', ''))}
          placeholder="никнейм пользователя"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
        />

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? 'Добавляем...' : 'Добавить'}
        </button>
      </form>

      {/* Contacts list */}
      <h2 className="text-sm font-semibold text-white mb-3">Мои контакты ({contacts.length})</h2>

      {contacts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-gray-400 text-sm">Пока нет контактов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => {
            const relInfo = relations.find(r => r.value === c.relation);
            return (
              <div key={c.userId} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {c.displayName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">@{c.username} · {relInfo?.emoji} {relInfo?.label}</p>
                </div>
                <button
                  onClick={() => navigate(`/send?to=${c.username}`)}
                  className="shrink-0 w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-500 hover:bg-brand-500/25 transition-colors"
                >
                  <RiSendPlaneLine size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
