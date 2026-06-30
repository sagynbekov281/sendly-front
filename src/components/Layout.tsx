import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  RiHome5Line, RiHome5Fill,
  RiUserLine, RiUserFill,
  RiSendPlaneLine, RiSendPlaneFill,
  RiFileListLine, RiFileListFill,
  RiBellLine, RiBellFill,
  RiLogoutBoxLine,
} from 'react-icons/ri';

export default function Layout() {
  const currentUser = useStore(s => s.currentUser);
  const logout = useStore(s => s.logout);
  const notifications = useStore(s => s.notifications);
  const navigate = useNavigate();
  const unread = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Главная', icon: RiHome5Line, activeIcon: RiHome5Fill },
    { to: '/send', label: 'Отправить', icon: RiSendPlaneLine, activeIcon: RiSendPlaneFill },
    { to: '/requests', label: 'Заявки', icon: RiFileListLine, activeIcon: RiFileListFill },
    { to: '/contacts', label: 'Контакты', icon: RiUserLine, activeIcon: RiUserFill },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen p-4 sticky top-0">
        <div className="mb-8 px-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-400 bg-clip-text text-transparent">
            Sendly
          </span>
          <p className="text-xs text-gray-500 mt-0.5">переводы без лишних слов</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <ActiveIcon size={20} /> : <Icon size={20} />}
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/15 text-brand-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <RiBellFill size={20} /> : <RiBellLine size={20} />}
                <span>Уведомления</span>
                {unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {currentUser?.displayName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser?.displayName}</p>
              <p className="text-xs text-gray-500 truncate">@{currentUser?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <RiLogoutBoxLine size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 z-50">
        {navItems.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all text-xs ${
                isActive ? 'text-brand-500' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <ActiveIcon size={22} /> : <Icon size={22} />}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all text-xs relative ${
              isActive ? 'text-brand-500' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? <RiBellFill size={22} /> : <RiBellLine size={22} />}
              <span>Звонки</span>
              {unread > 0 && (
                <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
