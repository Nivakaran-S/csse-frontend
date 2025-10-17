'use client';

import React from 'react';
import { PaymentModalProps } from '../../types/payment';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div style={{
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '3rem',
            width: '3rem',
            borderRadius: '50%',
            backgroundColor: '#E8F5E9'
          }}>
            <span style={{ fontSize: '1.5rem', color: '#66BB6A' }}>✅</span>
          </div>
        );
      case 'pending':
        return (
          <div style={{
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '3rem',
            width: '3rem',
            borderRadius: '50%',
            backgroundColor: '#FFF3E0'
          }}>
            <span style={{ fontSize: '1.5rem', color: '#FFB300' }}>⏳</span>
          </div>
        );
      case 'error':
        return (
          <div style={{
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '3rem',
            width: '3rem',
            borderRadius: '50%',
            backgroundColor: '#FFEBEE'
          }}>
            <span style={{ fontSize: '1.5rem', color: '#F44336' }}>❌</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#66BB6A',
          color: 'white'
        };
      case 'pending':
        return {
          backgroundColor: '#FFB300',
          color: 'white'
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#666',
          color: 'white'
        };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Background overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          cursor: 'pointer'
        }}
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            {getIcon()}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#424242',
                marginBottom: '0.5rem'
              }}>
                {title}
              </h3>
              <p style={{
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                {message}
              </p>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#F5F5F5',
          padding: '1rem 2rem',
          borderTop: '1px solid #E0E0E0',
          textAlign: 'center'
        }}>
          <button
            type="button"
            style={{
              ...getButtonStyle(),
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;