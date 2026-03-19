export interface Course {
  id: string | number;
  title: string;
  instructor?: string;
  img?: string;
  price: number | string;
  description?: string;
  expiry?: string;
}


export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export interface CheckoutFormData {
  name: string;
  card: string;
  expiry: string;
  cvc: string;
  terms: boolean;
}

export interface CheckoutErrors {
  name?: string;
  card?: string;
  expiry?: string;
  cvv?: string;
  terms?: string;
}

export type CheckoutStep = 'form' | 'otp' | 'success';

export type CartItem = {
  title: string;
  createdBy?: string;
  price?: number;
  duration?: number;
  description?: string;
  img?: string;
  href?: string;
};

