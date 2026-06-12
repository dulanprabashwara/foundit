export interface Report {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  latitude: number;
  longitude: number;
  hasImage: boolean;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email?: string;
  };
  _count?: {
    comments: number;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  reportId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
  };
}

export type Category = 'PETS' | 'ELECTRONICS' | 'KEYS' | 'WALLET' | 'BAG' | 'OTHER';
export type Status = 'ACTIVE' | 'RESOLVED';

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'PETS', label: 'Pets', emoji: '🐾', color: '#f59e0b' },
  { value: 'ELECTRONICS', label: 'Electronics', emoji: '📱', color: '#3b82f6' },
  { value: 'KEYS', label: 'Keys', emoji: '🔑', color: '#8b5cf6' },
  { value: 'WALLET', label: 'Wallet', emoji: '👛', color: '#10b981' },
  { value: 'BAG', label: 'Bag', emoji: '🎒', color: '#f43f5e' },
  { value: 'OTHER', label: 'Other', emoji: '📦', color: '#6b7280' },
];

export function getCategoryInfo(category: Category) {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[5];
}
