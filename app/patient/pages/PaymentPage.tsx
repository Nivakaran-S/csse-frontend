'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  processPayment, 
  applyForCoverage,
  getCoverageStatus,
  submitCashPaymentReceipt
} from '../../utils/api';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  userName?: string;
}

interface CoverageStatus {
  status: 'None' | 'Pending' | 'Approved' | 'Declined';
  applicationId?: string;
  adminNotes?: string;
}

const paymentMethods = [
  {
    type: 'Coverage',
    label: 'Healthcare Coverage',
    description: 'Use your insurance to cover the cost.'
  },
  {
    type: 'CreditCard',
    label: 'Credit Card',
    description: 'Pay with your credit or debit card.'
  },
  {
    type: 'Cash',
    label: 'Cash Deposit',
    description: 'Submit cash payment receipt.'
  }
];

const PaymentPage: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActivePaymentTab] = useState<'Coverage' | 'CreditCard' | 'Cash'>('CreditCard');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAuth, setIsFetchingAuth] = useState(true);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'pending' | 'error'
  });

  // Credit Card State
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    cardType: 'Visa'
  });

  const [cardValidationErrors, setCardValidationErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Coverage State
  const [coverageApplication, setCoverageApplication] = useState({
    policyId: '',
    provider: '',
    coverageType: ''
  });

  const [coverageStatus, setCoverageStatus] = useState<CoverageStatus>({ status: 'None' });

  // Cash State
  const [cashDetails, setCashDetails] = useState({
    depositReference: '',
    bankName: '',
    branchName: '',
    depositDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    receiptNumber: '',
    notes: ''
  });

  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/check-cookie', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        
        if (data.role !== 'Patient') {
          router.push('/login');
          return;
        }

        // Fetch patient details
        const patientResponse = await fetch(`http://localhost:8000/api/patient/${data.id}`, {
          credentials: 'include',
        });

        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          const patient = patientData[0];
          
          setUser({
            id: data.id,
            firstName: patient?.firstName,
            lastName: patient?.lastName,
            email: patient?.email,
            phoneNumber: patient?.phoneNumber,
            gender: patient?.gender
          });

          // Set default policy ID
          setCoverageApplication(prev => ({
            ...prev,
            policyId: `POL-${data.id.slice(-6)}`
          }));

          // Set default receipt number
          setCashDetails(prev => ({
            ...prev,
            receiptNumber: `RCP-${data.id.slice(-6)}-${Date.now().toString().slice(-4)}`
          }));

          // Check coverage status
          await checkCoverageStatus(data.id);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setIsFetchingAuth(false);
      }
    };

    fetchUser();
  }, [router]);

  const checkCoverageStatus = async (userId: string) => {
    try {
      const response = await getCoverageStatus(userId);
      if (response.data?.success && response.data.data) {
        setCoverageStatus({
          status: response.data.data.status || 'None',
          applicationId: response.data.data.id,
          adminNotes: response.data.data.adminNotes
        });
      }
    } catch (error) {
      console.error('Error checking coverage status:', error);
      setCoverageStatus({ status: 'None' });
    }
  };

  const applyForCoverageHandler = async () => {
    if (!user?.id) {
      showModal('Error', 'User ID is missing.', 'error');
      return;
    }

    if (!coverageApplication.policyId || !coverageApplication.provider || !coverageApplication.coverageType) {
      showModal('Error', 'Please fill in all coverage fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await applyForCoverage({
        userId: user.id,
        policyId: coverageApplication.policyId,
        provider: coverageApplication.provider,
        coverageType: coverageApplication.coverageType
      });

      if (response.data?.success) {
        setCoverageStatus({
          status: 'Pending',
          applicationId: response.data.data?.id
        });
        showModal('Application Submitted', 'Your healthcare coverage application is pending admin approval.', 'pending');
      } else {
        showModal('Error', response.data?.message || 'Failed to apply for coverage.', 'error');
      }
    } catch (error: any) {
      showModal('Error', error.message || 'Error applying for coverage.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate card number
  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  };

  // Validate expiry date
  const validateExpiryDate = (expiryDate: string) => {
    const [month, year] = expiryDate.split('/');
    if (!month || !year) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    return expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth);
  };

  const validateCardField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'cardNumber':
        if (!value) {
          error = 'Card number is required';
        } else if (!validateCardNumber(value)) {
          error = 'Please enter a valid 13-19 digit card number';
        }
        break;
      case 'expiryDate':
        if (!value) {
          error = 'Expiry date is required';
        } else if (!validateExpiryDate(value)) {
          error = 'Please enter a valid expiry date (MM/YY)';
        }
        break;
      case 'cvv':
        if (!value) {
          error = 'CVV is required';
        } else if (value.length < 3 || value.length > 4) {
          error = 'CVV must be 3-4 digits';
        }
        break;
      case 'cardholderName':
        if (!value.trim()) {
          error = 'Cardholder name is required';
        }
        break;
    }
    
    setCardValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };

  const handlePayment = async () => {
    if (!user?.id) {
      showModal('Error', 'User not authenticated.', 'error');
      return;
    }

    // Validate based on payment method
    if (activeTab === 'Coverage') {
      if (coverageStatus.status !== 'Approved') {
        showModal('Coverage Required', 'Your healthcare coverage must be approved first.', 'error');
        return;
      }
    } else if (activeTab === 'CreditCard') {
      const isValidCard = validateCardNumber(creditCardDetails.cardNumber);
      const isValidExpiry = validateExpiryDate(creditCardDetails.expiryDate);
      const isValidCVV = creditCardDetails.cvv.length >= 3 && creditCardDetails.cvv.length <= 4;
      const hasCardholderName = creditCardDetails.cardholderName.trim().length > 0;

      if (!isValidCard || !isValidExpiry || !isValidCVV || !hasCardholderName) {
        showModal('Invalid Card', 'Please check your credit card details.', 'error');
        return;
      }
    } else if (activeTab === 'Cash') {
      if (!cashDetails.bankName || !cashDetails.transactionId || !cashDetails.depositReference) {
        showModal('Missing Information', 'Please fill in all required cash payment fields.', 'error');
        return;
      }
    }

    setIsLoading(true);

    try {
      let paymentDetails: any = {};

      switch (activeTab) {
        case 'Coverage':
          paymentDetails = {
            policyId: coverageApplication.policyId,
            serviceReference: 'SRV-001'
          };
          break;
        case 'CreditCard':
          paymentDetails = {
            cardNumber: creditCardDetails.cardNumber,
            expiryDate: creditCardDetails.expiryDate,
            cvv: creditCardDetails.cvv,
            cardholderName: creditCardDetails.cardholderName,
            cardType: creditCardDetails.cardType
          };
          break;
        case 'Cash':
          paymentDetails = {
            depositReference: cashDetails.depositReference,
            bankName: cashDetails.bankName,
            branchName: cashDetails.branchName,
            depositDate: cashDetails.depositDate,
            transactionId: cashDetails.transactionId
          };
          break;
      }

      // Process payment
      const response = await processPayment({
        method: activeTab,
        details: paymentDetails
      });

      if (response.data?.success) {
        showModal(
          'Payment Successful',
          `Your payment of $${response.data.data?.amount || 55.00} has been processed.`,
          'success'
        );

        // For cash payments, submit receipt
        if (activeTab === 'Cash') {
          await submitCashPaymentReceipt({
            userId: user.id,
            patientName: `${user.firstName} ${user.lastName}`,
            patientId: user.id,
            patientEmail: user.email || '',
            patientPhone: user.phoneNumber || '',
            amount: 55.00,
            depositReference: cashDetails.depositReference,
            bankName: cashDetails.bankName,
            branchName: cashDetails.branchName,
            depositDate: cashDetails.depositDate,
            transactionId: cashDetails.transactionId,
            receiptNumber: cashDetails.receiptNumber,
            notes: cashDetails.notes,
            paymentSlipUrl: ''
          });
        }

        // Reset form
        if (activeTab === 'CreditCard') {
          setCreditCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: '',
            cardType: 'Visa'
          });
        }
      } else {
        showModal('Payment Failed', response.data?.message || 'Payment processing failed.', 'error');
      }
    } catch (error: any) {
      showModal('Error', error.message || 'An error occurred during payment.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
    }
  };

  const showModal = (title: string, message: string, type: 'success' | 'pending' | 'error') => {
    setModal({ isOpen: true, title, message, type });
  };

  if (isFetchingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Payment Portal</h1>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="text-gray-900">{user?.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Due</label>
            <p className="text-lg font-bold text-blue-600">$55.00</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>
        <div className="grid grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.type}
              onClick={() => setActivePaymentTab(method.type as any)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeTab === method.type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <h3 className="font-bold text-gray-900">{method.label}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Forms */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {activeTab === 'Coverage' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Healthcare Coverage</h2>
            
            {coverageStatus.status === 'None' ? (
              <div>
                <p className="text-yellow-600 mb-4">You need to apply for healthcare coverage first.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy ID</label>
                    <input
                      type="text"
                      value={coverageApplication.policyId}
                      onChange={(e) => setCoverageApplication(prev => ({
                        ...prev,
                        policyId: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                      placeholder="Enter your policy ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select
                      value={coverageApplication.provider}
                      onChange={(e) => setCoverageApplication(prev => ({
                        ...prev,
                        provider: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    >
                      <option value="">Select Provider</option>
                      <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                      <option value="Aetna">Aetna</option>
                      <option value="Cigna">Cigna</option>
                      <option value="UnitedHealth">UnitedHealth</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                    <select
                      value={coverageApplication.coverageType}
                      onChange={(e) => setCoverageApplication(prev => ({
                        ...prev,
                        coverageType: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    >
                      <option value="">Select Type</option>
                      <option value="Full">Full</option>
                      <option value="Partial">Partial</option>
                      <option value="Emergency Only">Emergency Only</option>
                      <option value="Dental">Dental</option>
                      <option value="Vision">Vision</option>
                    </select>
                  </div>
                  <button
                    onClick={applyForCoverageHandler}
                    disabled={isLoading || !coverageApplication.policyId || !coverageApplication.provider || !coverageApplication.coverageType}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {isLoading ? 'Applying...' : 'Apply for Coverage'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={`mb-4 p-3 rounded font-medium ${
                  coverageStatus.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  coverageStatus.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Status: {coverageStatus.status}
                  {coverageStatus.adminNotes && ` - ${coverageStatus.adminNotes}`}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'CreditCard' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Credit Card Payment</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                value={creditCardDetails.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setCreditCardDetails(prev => ({
                    ...prev,
                    cardNumber: formatted
                  }));
                  validateCardField('cardNumber', formatted);
                }}
                onBlur={(e) => validateCardField('cardNumber', e.target.value)}
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
              {cardValidationErrors.cardNumber && (
                <p className="text-red-600 text-sm mt-1">{cardValidationErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={creditCardDetails.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setCreditCardDetails(prev => ({
                      ...prev,
                      expiryDate: formatted
                    }));
                    validateCardField('expiryDate', formatted);
                  }}
                  onBlur={(e) => validateCardField('expiryDate', e.target.value)}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
                {cardValidationErrors.expiryDate && (
                  <p className="text-red-600 text-sm mt-1">{cardValidationErrors.expiryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  value={creditCardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                    setCreditCardDetails(prev => ({
                      ...prev,
                      cvv: value
                    }));
                    validateCardField('cvv', value);
                  }}
                  onBlur={(e) => validateCardField('cvv', e.target.value)}
                  maxLength={4}
                  placeholder="123"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
                {cardValidationErrors.cvv && (
                  <p className="text-red-600 text-sm mt-1">{cardValidationErrors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={creditCardDetails.cardholderName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCreditCardDetails(prev => ({
                    ...prev,
                    cardholderName: value
                  }));
                  validateCardField('cardholderName', value);
                }}
                onBlur={(e) => validateCardField('cardholderName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
              {cardValidationErrors.cardholderName && (
                <p className="text-red-600 text-sm mt-1">{cardValidationErrors.cardholderName}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Cash' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Cash Payment</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Reference</label>
              <input
                type="text"
                value={cashDetails.depositReference}
                onChange={(e) => setCashDetails(prev => ({
                  ...prev,
                  depositReference: e.target.value
                }))}
                placeholder="Enter deposit reference"
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={cashDetails.bankName}
                  onChange={(e) => setCashDetails(prev => ({
                    ...prev,
                    bankName: e.target.value
                  }))}
                  placeholder="Enter bank name"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={cashDetails.branchName}
                  onChange={(e) => setCashDetails(prev => ({
                    ...prev,
                    branchName: e.target.value
                  }))}
                  placeholder="Enter branch name"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <input
                type="text"
                value={cashDetails.transactionId}
                onChange={(e) => setCashDetails(prev => ({
                  ...prev,
                  transactionId: e.target.value
                }))}
                placeholder="Enter transaction ID"
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Date</label>
              <input
                type="date"
                value={cashDetails.depositDate}
                onChange={(e) => setCashDetails(prev => ({
                  ...prev,
                  depositDate: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={cashDetails.notes}
                onChange={(e) => setCashDetails(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                placeholder="Add any additional notes"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Slip (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="paymentSlip"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="paymentSlip" className="cursor-pointer">
                  {paymentSlip ? (
                    <p className="text-gray-900">{paymentSlip.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-600">Click to upload payment slip</p>
                      <p className="text-sm text-gray-500">JPG, PNG, PDF (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={handlePayment}
          disabled={isLoading || (activeTab === 'Coverage' && coverageStatus.status !== 'Approved')}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? 'Processing...' : `Pay $55.00 →`}
        </button>
      </div>

      {/* Modal */}
            {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-4">
                {modal.type === 'success' ? '✅' : modal.type === 'pending' ? '⏳' : '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
              <p className="text-gray-600">{modal.message}</p>
            </div>
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
