export type RelationType = 'friend' | 'partner' | 'family' | 'colleague';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  balance: number;
  createdAt: string;
}

export interface Contact {
  userId: string;
  username: string;
  displayName: string;
  relation: RelationType;
  addedAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'paid';

export interface PaymentRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  toUserId: string;
  toUsername: string;
  toDisplayName: string;
  amount: number;
  currency: string;
  message: string;
  relation: RelationType;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'request_received' | 'request_accepted' | 'request_declined' | 'payment_received' | 'friend_added';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}
