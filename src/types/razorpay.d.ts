declare module 'razorpay' {
  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
    headers?: Record<string, string>;
  }

  export interface OrderCreateOptions {
    amount: number; // in paise
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
    partial_payment?: boolean;
  }

  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }

  export interface OrdersAPI {
    create(options: OrderCreateOptions): Promise<RazorpayOrder>;
    fetch(orderId: string): Promise<RazorpayOrder>;
  }

  export interface PaymentsAPI {
    fetch(paymentId: string): Promise<Record<string, unknown>>;
  }

  export default class Razorpay {
    constructor(options: RazorpayOptions);
    orders: OrdersAPI;
    payments: PaymentsAPI;
  }
}

