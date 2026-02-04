export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface VerifyPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}
