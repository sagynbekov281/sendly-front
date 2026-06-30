import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import RequestsPage from './pages/RequestsPage';
import SendRequestPage from './pages/SendRequestPage';
import NotificationsPage from './pages/NotificationsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser);
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const authLoading = useStore(s => s.authLoading);
  const loadSession = useStore(s => s.loadSession);

  useEffect(() => {
    loadSession();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="send" element={<SendRequestPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
