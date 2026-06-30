import { create } from 'zustand';
import { api, setToken, ApiError } from '../api/client';
import type { User, Contact, PaymentRequest, Notification, RelationType } from '../types';

interface AppState {
  currentUser: User | null;
  contacts: Contact[];
  requests: PaymentRequest[];
  notifications: Notification[];
  authLoading: boolean; // true while checking existing session on app load
  initialized: boolean;

  // Auth
  register: (username: string, displayName: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (login: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  loadSession: () => Promise<void>;

  // Contacts
  loadContacts: () => Promise<void>;
  addContact: (username: string, relation: RelationType) => Promise<{ ok: boolean; error?: string }>;

  // Requests
  loadRequests: () => Promise<void>;
  sendRequest: (toUsername: string, amount: number, message: string, relation: RelationType) => Promise<{ ok: boolean; error?: string }>;
  acceptRequest: (requestId: string) => Promise<{ ok: boolean; error?: string }>;
  declineRequest: (requestId: string) => Promise<{ ok: boolean; error?: string }>;
  payRequest: (requestId: string) => Promise<{ ok: boolean; error?: string }>;

  // Notifications
  loadNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Что-то пошло не так';
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  contacts: [],
  requests: [],
  notifications: [],
  authLoading: true,
  initialized: false,

  register: async (username, displayName, email, password) => {
    try {
      const data = await api<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: { username, displayName, email, password },
      });
      setToken(data.token);
      set({ currentUser: data.user });
      await Promise.all([get().loadContacts(), get().loadRequests(), get().loadNotifications()]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  login: async (login, password) => {
    try {
      const data = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { login, password },
      });
      setToken(data.token);
      set({ currentUser: data.user });
      await Promise.all([get().loadContacts(), get().loadRequests(), get().loadNotifications()]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  logout: () => {
    setToken(null);
    set({ currentUser: null, contacts: [], requests: [], notifications: [] });
  },

  loadSession: async () => {
    try {
      const data = await api<{ user: User }>('/auth/me');
      set({ currentUser: data.user });
      await Promise.all([get().loadContacts(), get().loadRequests(), get().loadNotifications()]);
    } catch {
      setToken(null);
      set({ currentUser: null });
    } finally {
      set({ authLoading: false, initialized: true });
    }
  },

  loadContacts: async () => {
    try {
      const data = await api<{ contacts: Contact[] }>('/contacts');
      set({ contacts: data.contacts });
    } catch {
      // silent — page will show empty state
    }
  },

  addContact: async (username, relation) => {
    try {
      await api('/contacts', { method: 'POST', body: { username, relation } });
      await get().loadContacts();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  loadRequests: async () => {
    try {
      const data = await api<{ requests: PaymentRequest[] }>('/requests');
      set({ requests: data.requests });
    } catch {
      // silent
    }
  },

  sendRequest: async (toUsername, amount, message, relation) => {
    try {
      await api('/requests', {
        method: 'POST',
        body: { username: toUsername, amount, message, relation },
      });
      await get().loadRequests();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  acceptRequest: async (requestId) => {
    try {
      await api(`/requests/${requestId}/accept`, { method: 'PATCH' });
      await get().loadRequests();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  declineRequest: async (requestId) => {
    try {
      await api(`/requests/${requestId}/decline`, { method: 'PATCH' });
      await get().loadRequests();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  payRequest: async (requestId) => {
    try {
      await api(`/requests/${requestId}/pay`, { method: 'PATCH' });
      await get().loadRequests();
      // refresh balance
      const me = await api<{ user: User }>('/auth/me');
      set({ currentUser: me.user });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  },

  loadNotifications: async () => {
    try {
      const data = await api<{ notifications: Notification[] }>('/notifications');
      set({ notifications: data.notifications });
    } catch {
      // silent
    }
  },

  markAllRead: async () => {
    try {
      await api('/notifications/read-all', { method: 'PATCH' });
      set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
    } catch {
      // silent
    }
  },
}));
