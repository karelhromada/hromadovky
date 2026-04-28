export type InvoiceType = 'invoice' | 'credit_note';

export type InvoiceStatus = 'unpaid' | 'paid' | 'cancelled' | 'refunded';

export type PaymentMethod = 'transfer' | 'cod';

export interface InvoiceCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  delivery?: string;
  payment?: string;
  isB2B?: boolean;
  companyName?: string;
  ico?: string;
  dic?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  backName?: string;
  size?: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  original_invoice_id: string | null;
  order_id: string | null;
  variable_symbol: string;
  issued_at: string;
  taxable_supply_at: string;
  due_at: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  shipping_fee: number;
  cod_fee: number;
  total: number;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  paid_at: string | null;
  cancelled_at: string | null;
  credit_reason: string | null;
  pdf_path: string | null;
  pdf_generated_at: string | null;
  created_at: string;
}

export interface CreditNoteRequest {
  original_invoice_id: string;
  reason: string;
  amount: number;
}
