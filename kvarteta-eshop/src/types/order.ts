// Tvary dat tabulky order_submissions — plní ji RPC create_order_submission
// z CheckoutPage (viz orderItems tamtéž). Čte je jen admin (RLS).

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  isB2B?: boolean;
  companyName?: string;
  ico?: string;
  dic?: string;
}

export interface OrderCardBackRef {
  name: string;
  publicUrl: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  options?: {
    back?: string;
    size?: string;
    packaging?: string;
    note?: string;
  };
  customPhotos?: Record<string, string>;
  customPhotoPaths?: string[];
  /** sloučené cesty k originálům fotek této položky */
  photoPaths?: string[];
  renderedCardPaths?: string[];
  cardBackRef?: OrderCardBackRef | null;
}

export interface OrderSubmission {
  id: string;
  created_at: string;
  user_id: string | null;
  variable_symbol: string;
  status: string;
  customer: OrderCustomer;
  items: OrderItem[];
  photo_paths: string[];
  rendered_paths: string[];
  subtotal: number;
  delivery_cost: number;
  payment_cost: number;
  total_to_pay: number;
  delivery_method: string | null;
  payment_method: string | null;
  pickup_point: string | null;
  note: string | null;
}
