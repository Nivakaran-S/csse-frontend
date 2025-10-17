'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface CashPaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    amount: number;
    depositReference: string;
    paymentSlip?: File;
  };
}

const CashPaymentReceipt: React.FC<CashPaymentReceiptProps> = ({
  isOpen,
  onClose,
  paymentData
}) => {
  const { user } = useUser();
  const [receiptData, setReceiptData] = useState({
    patientName: '',
    patientId: '',
    patientEmail: '',
    patientPhone: '',
    amount: 0,
    depositReference: '',
    bankName: '',
    branchName: '',
    depositDate: '',
    transactionId: '',
    receiptNumber: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Auto-fill user data when component opens
  useEffect(() => {
    if (isOpen && user) {
      setReceiptData(prev => ({
        ...prev,
        patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'User',
        patientId: user.id || '',
        patientEmail: user.email || '',
        patientPhone: user.phoneNumber || '',
        amount: paymentData.amount,
        depositReference: paymentData.depositReference,
        receiptNumber: `RCP-${user.id?.slice(-6) || '000000'}-${Date.now().toString().slice(-4)}`,
        depositDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isOpen, user, paymentData]);

  const handleInputChange = (field: string, value: string) => {
    setReceiptData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Submit receipt to backend
      const response = await fetch('http://localhost:3001/api/cash-receipts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          patientName: receiptData.patientName,
          patientId: receiptData.patientId,
          patientEmail: receiptData.patientEmail,
          patientPhone: receiptData.patientPhone,
          amount: receiptData.amount,
          depositReference: receiptData.depositReference,
          bankName: receiptData.bankName,
          branchName: receiptData.branchName,
          depositDate: receiptData.depositDate,
          transactionId: receiptData.transactionId,
          receiptNumber: receiptData.receiptNumber,
          notes: receiptData.notes,
          paymentSlipUrl: paymentData.paymentSlip ? URL.createObjectURL(paymentData.paymentSlip) : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus('success');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting receipt:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">💰 Cash Payment Receipt Submission</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {submitStatus === 'success' && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <span>✅</span>
              <div>
                <strong>Receipt Submitted Successfully!</strong><br />
                Your cash payment receipt has been submitted and is pending admin verification.
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <span>❌</span>
              <div>
                <strong>Submission Failed!</strong><br />
                There was an error submitting your receipt. Please try again.
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Patient Information - Auto-filled */}
            <div className="card">
              <h3 className="card-title">👤 Patient Information</h3>
              <div className="form-group">
                <label className="form-label">Patient Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.patientName}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Patient ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.patientId}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.patientEmail}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.patientPhone}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#424242' }}
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="card">
              <h3 className="card-title">💳 Payment Information</h3>
              <div className="form-group">
                <label className="form-label">Amount Paid:</label>
                <input
                  type="text"
                  className="form-input"
                  value={`$${receiptData.amount.toFixed(2)}`}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#2196F3', fontWeight: 'bold' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Receipt Number:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.receiptNumber}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#2196F3' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Reference:</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptData.depositReference}
                  readOnly
                  style={{ backgroundColor: '#f9f9f9', color: '#2196F3' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Date:</label>
                <input
                  type="date"
                  className="form-input"
                  value={receiptData.depositDate}
                  onChange={(e) => handleInputChange('depositDate', e.target.value)}
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="card">
            <h3 className="card-title">🏦 Bank Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Bank Name:</label>
                <select
                  className="form-input"
                  value={receiptData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  style={{ backgroundColor: 'white' }}
                >
                  <option value="">Select Bank</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Chase Bank">Chase Bank</option>
                  <option value="Citibank">Citibank</option>
                  <option value="US Bank">US Bank</option>
                  <option value="PNC Bank">PNC Bank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch Name:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter branch name"
                  value={receiptData.branchName}
                  onChange={(e) => handleInputChange('branchName', e.target.value)}
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Transaction ID:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter bank transaction ID"
                value={receiptData.transactionId}
                onChange={(e) => handleInputChange('transactionId', e.target.value)}
                style={{ backgroundColor: 'white' }}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="card">
            <h3 className="card-title">📝 Additional Information</h3>
            <div className="form-group">
              <label className="form-label">Notes (Optional):</label>
              <textarea
                className="form-input"
                placeholder="Add any additional notes about the payment..."
                value={receiptData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                style={{ backgroundColor: 'white', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Payment Slip Preview */}
          {paymentData.paymentSlip && (
            <div className="card">
              <h3 className="card-title">📄 Payment Slip</h3>
              <div className="form-group">
                <label className="form-label">Uploaded File:</label>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>📄</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{paymentData.paymentSlip.name}</p>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        {(paymentData.paymentSlip.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Status */}
          <div className="alert alert-info">
            <span>ℹ️</span>
            <div>
              <strong>Receipt Submission Process:</strong><br />
              1. Your receipt will be submitted for admin verification<br />
              2. Admin will review and approve/decline your payment<br />
              3. You will receive email notification of the status<br />
              4. Approved payments will be processed immediately
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !receiptData.bankName || !receiptData.transactionId}
            style={{
              opacity: (!receiptData.bankName || !receiptData.transactionId) ? 0.6 : 1,
              cursor: (!receiptData.bankName || !receiptData.transactionId) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentReceipt;