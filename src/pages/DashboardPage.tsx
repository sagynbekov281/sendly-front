import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { RiSendPlaneLine, RiFileListLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

const relationLabel: Record<string, string> = {
  friend: 'Друг',
  partner: '💑 Муж/Жена',
  family: 'Семья',
  colleague: 'Коллега',
};

export default function DashboardPage() {
  const currentUser = useStore(s => s.currentUser);
  const requests = useStore(s => s.requests);
  const loadRequests = useStore(s => s.loadRequests);
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  if (!currentUser) return null;

  const myRequests = requests.filter(r =>
    r.fromUserId === currentUser.id || r.toUserId === currentUser.id
  ).slice(0, 5);

  const pendingIncoming = requests.filter(
    r => r.toUserId === currentUser.id && r.status === 'pending'
  ).length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Привет,</p>
        <h1 className="text-2xl font-bold text-white">{currentUser.displayName} 👋</h1>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">Баланс</p>
          <p className="text-4xl font-bold text-white mb-1">
            {currentUser.balance.toLocaleString('ru')}
            <span className="text-xl font-normal ml-1">сом</span>
          </p>
          <p className="text-blue-200/70 text-xs">@{currentUser.username}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate('/send')}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-brand-500/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
            <RiSendPlaneLine size={20} className="text-brand-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Отправить</p>
            <p className="text-xs text-gray-500">заявку</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/requests')}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-brand-500/50 transition-all group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
            <RiFileListLine size={20} className="text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Заявки</p>
            <p className="text-xs text-gray-500">и переводы</p>
          </div>
          {pendingIncoming > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingIncoming}
            </span>
          )}
        </button>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Последние операции</h2>
          <button onClick={() => navigate('/requests')} className="text-xs text-brand-500 hover:text-brand-400">Все</button>
        </div>

        {myRequests.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-gray-400 text-sm">Пока нет операций</p>
            <p className="text-gray-600 text-xs mt-1">Отправь первую заявку другу</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myRequests.map(req => {
              const isSender = req.fromUserId === currentUser.id;
              const otherName = isSender ? req.toDisplayName : req.fromDisplayName;
              const otherUser = isSender ? req.toUsername : req.fromUsername;

              const statusColor: Record<string, string> = {
                pending: 'text-yellow-400',
                accepted: 'text-blue-400',
                declined: 'text-red-400',
                paid: 'text-green-400',
              };
              const statusLabel: Record<string, string> = {
                pending: 'Ожидает',
                accepted: 'Принято',
                declined: 'Отклонено',
                paid: 'Оплачено',
              };

              return (
                <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isSender ? 'bg-orange-500/15' : 'bg-green-500/15'
                  }`}>
                    {isSender
                      ? <RiArrowUpLine size={18} className="text-orange-400" />
                      : <RiArrowDownLine size={18} className="text-green-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {isSender ? `→ ${otherName}` : `← ${otherName}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{otherUser} · {relationLabel[req.relation]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isSender ? 'text-orange-400' : 'text-green-400'}`}>
                      {isSender ? '-' : '+'}{req.amount.toLocaleString('ru')} с
                    </p>
                    <p className={`text-xs ${statusColor[req.status]}`}>{statusLabel[req.status]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
