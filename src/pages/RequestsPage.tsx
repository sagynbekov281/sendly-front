import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { RiCheckLine, RiCloseLine, RiBankCardLine, RiInboxArchiveLine, RiSendPlane2Line } from 'react-icons/ri';

const relationLabel: Record<string, string> = {
  friend: '🧑‍🤝‍🧑 Друг',
  partner: '💑 Муж/Жена',
  family: '👨‍👩‍👧 Семья',
  colleague: '💼 Коллега',
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ожидает', cls: 'bg-yellow-500/15 text-yellow-400' },
  accepted: { label: 'Принято', cls: 'bg-blue-500/15 text-blue-400' },
  declined: { label: 'Отклонено', cls: 'bg-red-500/15 text-red-400' },
  paid: { label: 'Оплачено', cls: 'bg-green-500/15 text-green-400' },
};

export default function RequestsPage() {
  const currentUser = useStore(s => s.currentUser);
  const requests = useStore(s => s.requests);
  const loadRequests = useStore(s => s.loadRequests);
  const acceptRequest = useStore(s => s.acceptRequest);
  const declineRequest = useStore(s => s.declineRequest);
  const payRequest = useStore(s => s.payRequest);

  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [payError, setPayError] = useState<{ id: string; msg: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  if (!currentUser) return null;

  const incoming = requests.filter(r => r.toUserId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const outgoing = requests.filter(r => r.fromUserId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const list = tab === 'incoming' ? incoming : outgoing;

  const handlePay = async (id: string) => {
    setPayError(null);
    setActionLoading(id);
    const result = await payRequest(id);
    setActionLoading(null);
    if (!result.ok) setPayError({ id, msg: result.error || 'Ошибка оплаты' });
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    await acceptRequest(id);
    setActionLoading(null);
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    await declineRequest(id);
    setActionLoading(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Заявки</h1>
        <p className="text-gray-500 text-sm mt-1">Входящие и исходящие запросы на перевод</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-card border border-border rounded-xl p-1">
        <button
          onClick={() => setTab('incoming')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'incoming' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <RiInboxArchiveLine size={16} /> Входящие
          {incoming.filter(r => r.status === 'pending').length > 0 && (
            <span className="bg-white/20 text-xs rounded-full px-1.5">{incoming.filter(r => r.status === 'pending').length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'outgoing' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <RiSendPlane2Line size={16} /> Исходящие
        </button>
      </div>

      {list.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <p className="text-3xl mb-2">{tab === 'incoming' ? '📭' : '📤'}</p>
          <p className="text-gray-400 text-sm">
            {tab === 'incoming' ? 'Нет входящих заявок' : 'Ты ещё не отправлял заявки'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(req => {
            const isIncoming = tab === 'incoming';
            const otherName = isIncoming ? req.fromDisplayName : req.toDisplayName;
            const otherUsername = isIncoming ? req.fromUsername : req.toUsername;
            const badge = statusBadge[req.status];

            return (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {otherName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{otherName}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">@{otherUsername} · {relationLabel[req.relation]}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 bg-surface rounded-xl px-3 py-2.5 mb-3">"{req.message}"</p>

                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-white">{req.amount.toLocaleString('ru')} <span className="text-sm font-normal text-gray-500">сом</span></p>

                  {isIncoming && req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface border border-border text-gray-400 hover:text-red-400 hover:border-red-500/40 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <RiCloseLine size={16} /> Отклонить
                      </button>
                      <button
                        onClick={() => handlePay(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <RiBankCardLine size={16} /> Оплатить
                      </button>
                    </div>
                  )}

                  {isIncoming && req.status === 'accepted' && (
                    <button
                      onClick={() => handlePay(req.id)}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <RiBankCardLine size={16} /> Оплатить
                    </button>
                  )}
                </div>

                {payError?.id === req.id && (
                  <p className="text-xs text-red-400 mt-2">{payError.msg}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
