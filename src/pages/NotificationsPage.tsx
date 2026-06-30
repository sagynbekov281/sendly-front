import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { RiSendPlaneFill, RiCheckLine, RiCloseLine, RiMoneyDollarCircleLine, RiUserAddLine } from 'react-icons/ri';

const iconMap: Record<string, { icon: any; cls: string }> = {
  request_received: { icon: RiSendPlaneFill, cls: 'bg-brand-500/15 text-brand-500' },
  request_accepted: { icon: RiCheckLine, cls: 'bg-green-500/15 text-green-400' },
  request_declined: { icon: RiCloseLine, cls: 'bg-red-500/15 text-red-400' },
  payment_received: { icon: RiMoneyDollarCircleLine, cls: 'bg-green-500/15 text-green-400' },
  friend_added: { icon: RiUserAddLine, cls: 'bg-purple-500/15 text-purple-400' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'сейчас';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function NotificationsPage() {
  const currentUser = useStore(s => s.currentUser);
  const notifications = useStore(s => s.notifications);
  const loadNotifications = useStore(s => s.loadNotifications);
  const markAllRead = useStore(s => s.markAllRead);

  useEffect(() => {
    loadNotifications().then(() => markAllRead());
  }, []);

  if (!currentUser) return null;

  const myNotifs = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Уведомления</h1>
        <p className="text-gray-500 text-sm mt-1">Всё, что происходит с твоим аккаунтом</p>
      </div>

      {myNotifs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <p className="text-3xl mb-2">🔔</p>
          <p className="text-gray-400 text-sm">Пока нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myNotifs.map(n => {
            const { icon: Icon, cls } = iconMap[n.type] || iconMap.request_received;
            return (
              <div key={n.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
