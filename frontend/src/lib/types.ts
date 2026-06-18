export interface Report {
  id: string;
  title: string;
  description: string;
  contactInfo?: string;
  category: Category;
  type: ReportType;
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
  parentId?: string | null;
  author: {
    id: string;
    name: string;
  };
}

export type Category = 'PETS' | 'ELECTRONICS' | 'KEYS' | 'WALLET' | 'BAG' | 'OTHER';
export type ReportType = 'LOST' | 'FOUND';
export type Status = 'ACTIVE' | 'RESOLVED';

export const CATEGORIES: { value: Category; label: string; icon: string; color: string }[] = [
  { value: 'PETS', label: 'Pets', icon: '/pet.png', color: '#f59e0b' },
  { value: 'ELECTRONICS', label: 'Electronics', icon: '/electronic.png', color: '#3b82f6' },
  { value: 'KEYS', label: 'Keys', icon: '/key.png', color: '#8b5cf6' },
  { value: 'WALLET', label: 'Wallet', icon: '/wallet.png', color: '#10b981' },
  { value: 'BAG', label: 'Bag', icon: '/bag.png', color: '#f43f5e' },
  { value: 'OTHER', label: 'Other', icon: '/other.png', color: '#6b7280' },
];

export function getCategoryInfo(category: Category) {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[5];
}
