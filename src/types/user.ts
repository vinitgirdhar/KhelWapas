// User-related type definitions

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string; // e.g., "Home", "Office"
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderId: string;
  orderNumber?: string;
  date?: string;
  orderDate: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderStatus: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  pickupStatus: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed';
  customer: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
  total?: number;
  amount: number;
  items: Array<{
    id?: string;
    productId?: string;
    productName?: string;
    name?: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

export interface SellRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  fullName: string;
  email: string;
  category: string;
  title: string;
  description: string;
  price: number;
  contactMethod: 'Email' | 'Phone' | 'WhatsApp';
  contactDetail?: string;
  imageUrls: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}
