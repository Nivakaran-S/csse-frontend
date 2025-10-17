export interface PaymentMethod {
  type: 'Coverage' | 'CreditCard' | 'Cash';
  label: string;
  description: string;
}

export interface PaymentDetails {
  // Credit Card
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardType?: string;
  
  // Coverage
  policyId?: string;
  serviceReference?: string;
  
  // Cash
  depositReference?: string;
  depositSlipUrl?: string;
}

export interface PaymentRequest {
  method: 'Coverage' | 'CreditCard' | 'Cash';
  details: PaymentDetails;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    status: 'Processed' | 'PendingVerification' | 'Failed' | 'CoverageRejected';
    amount: number;
    method: string;
  };
}

export interface PaymentRecord {
  _id: string;
  transactionId: string;
  userId: string;
  amount: number;
  method: 'Coverage' | 'CreditCard' | 'Cash';
  status: 'Processed' | 'PendingVerification' | 'Failed' | 'CoverageRejected';
  date: string;
  details: {
    lastFourDigits?: string;
    policyId?: string;
    serviceReference?: string;
    depositSlipUrl?: string;
    depositReference?: string;
    expiryDate?: string;
    cardType?: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentRecord[];
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'pending' | 'error';
}