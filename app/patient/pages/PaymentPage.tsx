'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethod, PaymentDetails, PaymentRecord, PaymentModalProps } from '../../types/payment';
import { paymentApi } from '../utils/api';
import PaymentModal from '../components/PaymentModal';
import CashPaymentReceipt from '../components/CashPaymentReceipt';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';

const paymentMethods: PaymentMethod[] = [
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
    label: 'Other Payment Methods',
    description: 'Alternative payment options.'
  }
];

const PaymentPage: React.FC = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const router = useRouter();
  const { user, logout, isLoading: userLoading } = useUser();
  const [activeTab, setActiveNTab] = useState<'Coverage' | 'CreditCard' | 'Cash'>('Coverage');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [modal, setModal] = useState<PaymentModalProps>({
    isOpen: false,
    onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
    title: '',
    message: '',
    type: 'success'
  });

  const [cashReceiptModal, setCashReceiptModal] = useState({
    isOpen: false,
    paymentData: {
      amount: 0,
      depositReference: '',
      paymentSlip: null as File | null
    }
  });



  // Form states for each payment method
  const [coverageDetails, setCoverageDetails] = useState({
    policyId: 'POL-789045123',
    serviceReference: 'SRV-001'
  });

  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: '', // Empty by default
    expiryDate: '', // Empty by default
    cvv: '', // Empty by default
    cardholderName: '', // Empty by default
    cardType: 'Visa'
  });

  const [cardValidationErrors, setCardValidationErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null);

  const [cashDetails, setCashDetails] = useState({
    depositReference: 'DEP-001',
    depositSlipUrl: ''
  });

  const [coverageApplication, setCoverageApplication] = useState({
    policyId: user?.id && user.id !== '' ? `POL-${user.id.slice(-6)}` : 'POL-123456', // Auto-generate policy ID based on user ID
    provider: '',
    coverageType: ''
  });

  const [coverageStatus, setCoverageStatus] = useState<{
    status: 'None' | 'Pending' | 'Approved' | 'Declined';
    applicationId?: string;
    adminNotes?: string;
  }>({ status: 'None' });

  // Load payment history and coverage status on component mount
  useEffect(() => {
    loadPaymentHistory();
    checkCoverageStatus();
  }, [user?.id]); // Re-run when user ID changes

  const checkCoverageStatus = async () => {
    if (!user?.id || user.id === '') return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/coverage/status/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCoverageStatus({
          status: data.data.status,
          applicationId: data.data.id,
          adminNotes: data.data.adminNotes
        });
      } else {
        setCoverageStatus({ status: 'None' });
      }
    } catch (error) {
      console.error('Error checking coverage status:', error);
      setCoverageStatus({ status: 'None' });
    }
  };



  const applyForCoverage = async () => {
    if (!user?.id || user.id === '') {
      showModal(
        'Error',
        'User ID is not available. Please log out and log in again.',
        'error'
      );
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/coverage/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          policyId: coverageApplication.policyId,
          provider: coverageApplication.provider,
          coverageType: coverageApplication.coverageType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCoverageStatus({
          status: 'Pending',
          applicationId: data.data.id
        });
        showModal(
          'Coverage Application Submitted! 📋',
          'Your healthcare coverage application has been submitted and is pending admin approval. You will be notified once it\'s reviewed.',
          'pending'
        );
      } else {
        showModal(
          'Application Error',
          data.message || 'Failed to submit coverage application. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error applying for coverage:', error);
      showModal(
        'Application Error',
        'An error occurred while submitting your application. Please try again.',
        'error'
      );
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentApi.getPaymentHistory();
      if (response.success) {
        setPaymentHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment history:', error);
    }
  };

  // Handle file upload for payment slip
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentSlipPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Real-time validation for credit card fields
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

  const validateForm = (): boolean => {
    // Simplified validation - just check if we have some basic data
    switch (activeTab) {
      case 'Coverage':
        // Allow coverage payment with default values
        return true;
      case 'CreditCard':
        // Allow credit card payment with any data entered
        return true;
      case 'Cash':
        // Allow cash payment with any data entered
        return true;
    }
    return true;
  };

  const showModal = (title: string, message: string, type: 'success' | 'pending' | 'error') => {
    setModal({
      isOpen: true,
      onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
      title,
      message,
      type
    });
  };

  const handlePayment = async () => {
    // Check if healthcare coverage is required and approved
    if (activeTab === 'Coverage') {
      if (coverageStatus.status !== 'Approved') {
        showModal(
          'Coverage Required ❌',
          'You must have approved healthcare coverage to use this payment method. Please apply for coverage first and wait for admin approval.',
          'error'
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      // Validate credit card details if credit card payment
      if (activeTab === 'CreditCard') {
        const isValidCard = validateCardNumber(creditCardDetails.cardNumber);
        const isValidExpiry = validateExpiryDate(creditCardDetails.expiryDate);
        const isValidCVV = creditCardDetails.cvv.length >= 3 && creditCardDetails.cvv.length <= 4;
        const hasCardholderName = creditCardDetails.cardholderName.trim().length > 0;

        if (!isValidCard || !isValidExpiry || !isValidCVV || !hasCardholderName) {
          showModal(
            'Payment Unsuccessful ❌',
            'Invalid credit card details. Please check your card number, expiry date, CVV, and cardholder name.',
            'error'
          );
          setIsLoading(false);
          return;
        }
      }

      let paymentDetails: PaymentDetails = {};

      switch (activeTab) {
        case 'Coverage':
          paymentDetails = {
            policyId: coverageDetails.policyId,
            serviceReference: coverageDetails.serviceReference
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
            depositSlipUrl: paymentSlip ? paymentSlipPreview || 'https://example.com/deposit-slip.pdf' : 'https://example.com/deposit-slip.pdf',
            fileName: paymentSlip?.name || 'deposit-slip.pdf'
          };
          break;
      }

      // Simulate payment processing with delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure for credit cards (80% success rate)
      if (activeTab === 'CreditCard') {
        const isSuccessful = Math.random() > 0.2; // 80% success rate
        
        if (isSuccessful) {
          showModal(
            'Payment Successful! 🎉',
            `Your payment of $55.00 has been processed successfully using Credit Card. A receipt has been sent to your email.`,
            'success'
          );
        } else {
          showModal(
            'Payment Unsuccessful ❌',
            'Your credit card payment was declined. Please check your card details or try a different payment method.',
            'error'
          );
          setIsLoading(false);
          return;
        }
      } else if (activeTab === 'Coverage') {
        // Coverage payments always succeed
        showModal(
          'Payment Successful! 🎉',
          `Your payment of $55.00 has been processed successfully using Healthcare Coverage. A receipt has been sent to your email.`,
          'success'
        );
      } else if (activeTab === 'Cash') {
        // Cash payments always succeed
        showModal(
          'Payment Successful! 🎉',
          `Your payment of $55.00 has been processed successfully using Cash Deposit. A receipt has been sent to your email.`,
          'success'
        );
      }
      
      // Refresh payment history
      await loadPaymentHistory();
    } catch (error) {
      console.error('Payment error:', error);
      showModal(
        'Payment Error',
        'An error occurred while processing your payment. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🌿</div>
            mediCure
          </div>
          <nav className="nav-links">
            <a href="#">Home</a>
            <a href="#">About Us</a>
            <a href="#">Contact Us</a>
          </nav>
          <div className="user-section">
            <span className="welcome-text">
              Welcome, {user?.firstName || user?.userName || 'User'}
            </span>
            <button className="logout-btn" onClick={() => { 
              logout(); 
              setTimeout(() => {
                router.push('/login');
              }, 100);
            }}>
              👤 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">
          📄 Make Payment for Healthcare Services
        </h1>

        {/* Patient Information and Service Details */}
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">
              👤 Patient Information
            </h2>
            <div className="form-group">
              <label className="form-label">Name:</label>
              <input 
                type="text" 
                className="form-input" 
                value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.userName || 'User'} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Patient ID:</label>
              <input 
                type="text" 
                className="form-input" 
                value={user?.id || 'N/A'} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input 
                type="text" 
                className="form-input" 
                value={user?.email || 'Not provided'} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone:</label>
              <input 
                type="text" 
                className="form-input" 
                value={user?.phoneNumber || 'Not provided'} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender:</label>
              <input 
                type="text" 
                className="form-input" 
                value={user?.gender || 'Not specified'} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              📄 Service Details
            </h2>
            <div className="form-group">
              <label className="form-label">Service Type:</label>
              <input 
                type="text" 
                className="form-input" 
                value="Primary Care Visit" 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#2196F3' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Provider:</label>
              <input 
                type="text" 
                className="form-input" 
                value="Dr. Sarah Johnson" 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#2196F3' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Service:</label>
              <input 
                type="text" 
                className="form-input" 
                value={new Date().toLocaleDateString()} 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#2196F3' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount:</label>
              <input 
                type="text" 
                className="form-input" 
                value="$55.00" 
                readOnly 
                style={{ backgroundColor: '#f9f9f9', color: '#2196F3', fontWeight: 'bold' }}
              />
            </div>
          </div>
        </div>

        {/* Healthcare Coverage Application - Only show when Coverage is selected and no coverage exists */}
        {activeTab === 'Coverage' && coverageStatus.status === 'None' && (
          <div className="card">
            <h2 className="card-title">
              🏥 Apply for Healthcare Coverage
            </h2>
            <div className="alert alert-info">
              <span>ℹ️</span>
              <div>
                <strong>Coverage Required.</strong> To use healthcare coverage payment, you must first apply and get approved by our admin team.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Policy ID:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your policy ID"
                value={coverageApplication.policyId}
                onChange={(e) => setCoverageApplication(prev => ({
                  ...prev,
                  policyId: e.target.value
                }))}
                style={{ backgroundColor: 'white' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Insurance Provider:</label>
              <select
                className="form-input"
                value={coverageApplication.provider}
                onChange={(e) => setCoverageApplication(prev => ({
                  ...prev,
                  provider: e.target.value
                }))}
                style={{ backgroundColor: 'white' }}
              >
                <option value="">Select Provider</option>
                <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                <option value="Aetna">Aetna</option>
                <option value="Cigna">Cigna</option>
                <option value="UnitedHealth">UnitedHealth</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Coverage Type:</label>
              <select
                className="form-input"
                value={coverageApplication.coverageType}
                onChange={(e) => setCoverageApplication(prev => ({
                  ...prev,
                  coverageType: e.target.value
                }))}
                style={{ backgroundColor: 'white' }}
              >
                <option value="">Select Coverage Type</option>
                <option value="Primary Care">Primary Care</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <button
              onClick={applyForCoverage}
              disabled={!coverageApplication.policyId || !coverageApplication.provider || !coverageApplication.coverageType}
              className="btn btn-primary"
              style={{
                opacity: (!coverageApplication.policyId || !coverageApplication.provider || !coverageApplication.coverageType) ? 0.6 : 1,
                cursor: (!coverageApplication.policyId || !coverageApplication.provider || !coverageApplication.coverageType) ? 'not-allowed' : 'pointer'
              }}
            >
              📋 Apply for Coverage
            </button>
          </div>
        )}

        {/* Coverage Status Display - Only show when Coverage is selected */}
        {activeTab === 'Coverage' && coverageStatus.status !== 'None' && (
          <div className="card">
            <h2 className="card-title">
              🏥 Healthcare Coverage Status
            </h2>
            <div className={`alert ${coverageStatus.status === 'Approved' ? 'alert-success' : 
                              coverageStatus.status === 'Pending' ? 'alert-warning' : 'alert-danger'}`}>
              <span>
                {coverageStatus.status === 'Approved' ? '✅' : 
                 coverageStatus.status === 'Pending' ? '⏳' : '❌'}
              </span>
              <div>
                <strong>
                  {coverageStatus.status === 'Approved' ? 'Coverage Approved!' : 
                   coverageStatus.status === 'Pending' ? 'Application Pending' : 'Application Declined'}
                </strong>
                <br />
                {coverageStatus.status === 'Approved' && 'You can now use healthcare coverage payment method.'}
                {coverageStatus.status === 'Pending' && 'Your application is under review. You will be notified once approved.'}
                {coverageStatus.status === 'Declined' && coverageStatus.adminNotes && `Reason: ${coverageStatus.adminNotes}`}
              </div>
            </div>
            {coverageStatus.status === 'Pending' && (
              <button
                onClick={checkCoverageStatus}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                🔄 Refresh Status
              </button>
            )}
          </div>
        )}

        {/* Select Payment Method */}
        <div className="card">
          <h2 className="card-title">
            💳 Select Payment Method
          </h2>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div
                key={method.type}
                className={`payment-card ${activeTab === method.type ? 'active' : ''}`}
                onClick={() => setActiveNTab(method.type)}
              >
                <div className="payment-card-header">
                  <span>
                    {method.type === 'Coverage' && '🛡️'}
                    {method.type === 'CreditCard' && '💳'}
                    {method.type === 'Cash' && '👛'}
                  </span>
                  <h3 className="payment-card-title">{method.label}</h3>
                </div>
                <p className="payment-card-description">{method.description}</p>
                
                {activeTab === method.type && (
                  <div>
                    {method.type === 'Coverage' && (
                      <div>
                        {coverageStatus.status === 'Approved' ? (
                          <div>
                            <div className="alert alert-success">
                              <span>✅</span>
                              <div>
                                <strong>Coverage Approved!</strong> You can now proceed with healthcare coverage payment.
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Insurance Provider:</label>
                              <input
                                type="text"
                                className="form-input"
                                value="Blue Cross Blue Shield"
                                style={{ color: '#2196F3' }}
                                readOnly
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Policy Number:</label>
                              <input
                                type="text"
                                className="form-input"
                                value={coverageApplication.policyId}
                                style={{ color: '#2196F3' }}
                                readOnly
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Service Reference:</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Enter service reference"
                                value={coverageDetails.serviceReference}
                                onChange={(e) => setCoverageDetails(prev => ({ ...prev, serviceReference: e.target.value }))}
                                style={{ backgroundColor: 'white' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            <span>⚠️</span>
                            <div>
                              <strong>Coverage Required.</strong> You must apply for and get approved healthcare coverage before using this payment method.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {method.type === 'CreditCard' && (
                      <div>
                        <div className="form-group">
                          <label className="form-label">Card Number:</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="1234 5678 9012 3456"
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
                            style={{ 
                              backgroundColor: 'white',
                              borderColor: cardValidationErrors.cardNumber ? '#F44336' : '#ddd'
                            }}
                          />
                          {cardValidationErrors.cardNumber && (
                            <div style={{ color: '#F44336', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {cardValidationErrors.cardNumber}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Expiry:</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="MM/YY"
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
                              style={{ 
                                backgroundColor: 'white',
                                borderColor: cardValidationErrors.expiryDate ? '#F44336' : '#ddd'
                              }}
                            />
                            {cardValidationErrors.expiryDate && (
                              <div style={{ color: '#F44336', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {cardValidationErrors.expiryDate}
                              </div>
                            )}
                          </div>
                          <div className="form-group">
                            <label className="form-label">CVV:</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="123"
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
                              style={{ 
                                backgroundColor: 'white',
                                borderColor: cardValidationErrors.cvv ? '#F44336' : '#ddd'
                              }}
                            />
                            {cardValidationErrors.cvv && (
                              <div style={{ color: '#F44336', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {cardValidationErrors.cvv}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Cardholder Name:</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
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
                            style={{ 
                              backgroundColor: 'white',
                              borderColor: cardValidationErrors.cardholderName ? '#F44336' : '#ddd'
                            }}
                          />
                          {cardValidationErrors.cardholderName && (
                            <div style={{ color: '#F44336', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {cardValidationErrors.cardholderName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {method.type === 'Cash' && (
                      <div>
                        <div className="form-group">
                          <label className="form-label">Deposit Reference:</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter deposit reference number"
                            value={cashDetails.depositReference}
                            onChange={(e) => setCashDetails(prev => ({
                              ...prev,
                              depositReference: e.target.value
                            }))}
                            style={{ backgroundColor: 'white' }}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Payment Slip Upload:</label>
                          <div style={{ 
                            border: '2px dashed #ddd', 
                            borderRadius: '8px', 
                            padding: '1rem', 
                            textAlign: 'center',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <input
                              type="file"
                              id="paymentSlip"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              style={{ display: 'none' }}
                            />
                            <label 
                              htmlFor="paymentSlip" 
                              style={{ 
                                cursor: 'pointer', 
                                display: 'block',
                                color: '#666'
                              }}
                            >
                              {paymentSlip ? (
                                <div>
                                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                  <p><strong>{paymentSlip.name}</strong></p>
                                  <p style={{ fontSize: '0.9rem', color: '#999' }}>
                                    Click to change file
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                                  <p><strong>Click to upload payment slip</strong></p>
                                  <p style={{ fontSize: '0.9rem', color: '#999' }}>
                                    Supports: JPG, PNG, PDF (Max 5MB)
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                          
                          {paymentSlipPreview && (
                            <div style={{ marginTop: '1rem' }}>
                              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                Preview:
                              </p>
                              <img 
                                src={paymentSlipPreview} 
                                alt="Payment slip preview" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px', 
                                  border: '1px solid #ddd',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Claim Submission Alert */}
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Claim Submission Required.</strong> This payment will involve claim submission. 
            Your healthcare provider must approve the claim before payment is finalized.
          </div>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <h2 className="card-title">
            📄 Payment Summary
          </h2>
          <div className="summary-row">
            <span>Service Charge:</span>
            <span>$120.00</span>
          </div>
          <div className="summary-row">
            <span>Insurance Coverage:</span>
            <span className="text-green">-$50.00</span>
          </div>
          <div className="summary-row">
            <span>Additional Fees:</span>
            <span>$5.00</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total Amount Due:</span>
            <span>$75.00</span>
          </div>
        </div>

        {/* Claim Approval Status */}
        <div className="card">
          <h2 className="card-title">
            ✅ Claim Approval Status
          </h2>
          <div className="status-cards">
            <div className="status-card active">
              <div className="status-icon" style={{ backgroundColor: '#FFB300', color: 'white' }}>
                ⏳
              </div>
              <div className="status-title">Pending Approval</div>
              <div className="status-description">
                Your claim is under review by the healthcare provider.
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon" style={{ backgroundColor: '#E0E0E0', color: '#666' }}>
                📄
              </div>
              <div className="status-title">Claim Submitted</div>
              <div className="status-description">
                Claim details sent to insurance provider.
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon" style={{ backgroundColor: '#E0E0E0', color: '#666' }}>
                ✅
              </div>
              <div className="status-title">Approved</div>
              <div className="status-description">
                Claim approved and payment processed.
              </div>
            </div>
          </div>
        </div>

        {/* Claim Submission Timeline */}
        <div className="card">
          <h2 className="card-title">
            📊 Claim Submission Timeline
          </h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-labels">
              <span>Submitted</span>
              <span>Under Review</span>
              <span>Approved</span>
            </div>
            <div className="text-right mt-1">
              <span className="text-gray">Last updated: Today, 10:30 AM</span>
            </div>
          </div>
        </div>

        {/* Payment Progress Stepper */}
        <div className="card">
          <h2 className="card-title">
            📈 Payment Progress
          </h2>
          <div className="stepper">
            <div className="stepper-step completed">
              <div className="stepper-icon">✅</div>
              <div className="stepper-label">Service Selected</div>
            </div>
            <div className="stepper-step completed">
              <div className="stepper-icon">✅</div>
              <div className="stepper-label">Payment Method</div>
            </div>
            <div className="stepper-step active">
              <div className="stepper-icon">⏳</div>
              <div className="stepper-label">Provider Approval</div>
            </div>
            <div className="stepper-step">
              <div className="stepper-icon">⭕</div>
              <div className="stepper-label">Payment Complete</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          <button 
            onClick={() => router.push('/home')}
            className="btn btn-secondary"
          >
            ← Back
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading || 
                     (activeTab === 'Coverage' && coverageStatus.status !== 'Approved')}
            className="btn btn-primary"
            style={{
              opacity: (isLoading || 
                       (activeTab === 'Coverage' && coverageStatus.status !== 'Approved')) ? 0.6 : 1,
              cursor: (isLoading || 
                       (activeTab === 'Coverage' && coverageStatus.status !== 'Approved')) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Processing...' : 
             (activeTab === 'Coverage' && coverageStatus.status !== 'Approved') ? 'Coverage Approval Required' :
             'Submit Payment →'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <p>© 2023 mediCure Healthcare Payment Portal. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>

              {/* Payment Modal */}
              <PaymentModal {...modal} />

              {/* Cash Payment Receipt Modal */}
              <CashPaymentReceipt
                isOpen={cashReceiptModal.isOpen}
                onClose={() => setCashReceiptModal(prev => ({ ...prev, isOpen: false }))}
                paymentData={cashReceiptModal.paymentData}
              />


            </div>
            </ProtectedRoute>
          );
};

export default PaymentPage;