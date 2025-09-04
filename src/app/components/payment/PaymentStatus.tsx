// src/app/components/payment/PaymentStatus.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import PesapalService from '../../services/PesapalService';
import ToastService from '../../services/ToastService';

interface PaymentStatusProps {
  orderId: number;
  trackingId?: string;
  onStatusUpdate?: (status: string, data: any) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showActions?: boolean;
  className?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  orderId,
  trackingId,
  onStatusUpdate,
  autoRefresh = false,
  refreshInterval = 5000,
  showActions = true,
  className = ''
}) => {
  const [status, setStatus] = useState<string>('CHECKING');
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    checkPaymentStatus();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkPaymentStatus(false); // Don't show loading for auto-refresh
      }, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderId, autoRefresh, refreshInterval]);

  const checkPaymentStatus = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError('');

      const response = await PesapalService.checkPaymentStatus(orderId);

      if (response.success && response.data) {
        const paymentStatus = response.data.payment_status || 'UNKNOWN';
        setStatus(paymentStatus);
        setStatusData(response.data);
        setLastChecked(new Date());
        
        // Notify parent component
        onStatusUpdate?.(paymentStatus, response.data);
        
        // Show success toast for completed payments
        if (paymentStatus.toUpperCase() === 'COMPLETED' && showLoading) {
          ToastService.paymentSuccess();
        }
        
      } else {
        const errorMsg = response.message || 'Failed to check payment status';
        setError(errorMsg);
        if (showLoading) {
          ToastService.error(errorMsg);
        }
      }

    } catch (error: any) {
      const errorMsg = error.message || 'Failed to check payment status';
      setError(errorMsg);
      if (showLoading) {
        ToastService.error(errorMsg);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const getStatusDisplay = () => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return {
          variant: 'success' as const,
          icon: 'bi-check-circle-fill',
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully.'
        };
      case 'PENDING':
      case 'IN_PROGRESS':
        return {
          variant: 'warning' as const,
          icon: 'bi-clock-fill',
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait...'
        };
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
        return {
          variant: 'danger' as const,
          icon: 'bi-x-circle-fill',
          title: 'Payment Failed',
          message: statusData?.payment_status_description || 'Payment processing failed. Please try again.'
        };
      case 'CHECKING':
        return {
          variant: 'info' as const,
          icon: 'bi-arrow-clockwise',
          title: 'Checking Status',
          message: 'Verifying your payment status...'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: 'bi-question-circle-fill',
          title: 'Unknown Status',
          message: 'Payment status is unclear. Please refresh or contact support.'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (isLoading && status === 'CHECKING') {
    return (
      <Card className={`payment-status ${className}`}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <h5 className="mt-3">Checking Payment Status</h5>
          <p className="text-muted mb-0">
            Please wait while we verify your payment...
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`payment-status border-${statusDisplay.variant} ${className}`}>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="text-center mb-4">
          <div className={`status-icon text-${statusDisplay.variant} mb-3`}>
            <i className={`bi ${statusDisplay.icon}`}></i>
          </div>
          <h4 className="status-title">{statusDisplay.title}</h4>
          <p className="status-message text-muted mb-3">
            {statusDisplay.message}
          </p>
          
          <Badge bg={statusDisplay.variant} className="status-badge">
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Payment Details */}
        {statusData && (
          <div className="payment-details mb-4">
            <div className="details-grid">
              <div className="detail-item">
                <small className="text-muted">Order ID</small>
                <div className="fw-semibold">#{orderId}</div>
              </div>
              
              {trackingId && (
                <div className="detail-item">
                  <small className="text-muted">Tracking ID</small>
                  <div className="fw-semibold">{trackingId}</div>
                </div>
              )}
              
              {statusData.amount && (
                <div className="detail-item">
                  <small className="text-muted">Amount</small>
                  <div className="fw-semibold">
                    {PesapalService.formatAmount(
                      parseFloat(statusData.amount), 
                      statusData.currency || 'UGX'
                    )}
                  </div>
                </div>
              )}
              
              {statusData.payment_method && (
                <div className="detail-item">
                  <small className="text-muted">Payment Method</small>
                  <div className="fw-semibold">{statusData.payment_method}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Checked */}
        <div className="last-checked text-center text-muted mb-3">
          <small>
            <i className="bi bi-clock me-1"></i>
            Last checked: {lastChecked.toLocaleTimeString()}
          </small>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="payment-actions">
            <div className="d-grid gap-2">
              <Button
                variant="outline-primary"
                onClick={() => checkPaymentStatus(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Status
                  </>
                )}
              </Button>
              
              {status.toUpperCase() === 'FAILED' && (
                <Button
                  variant="warning"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Try Payment Again
                </Button>
              )}
              
              {status.toUpperCase() === 'COMPLETED' && (
                <Button
                  variant="success"
                  onClick={() => window.location.href = '/account/orders'}
                >
                  <i className="bi bi-list-check me-2"></i>
                  View Orders
                </Button>
              )}
            </div>
          </div>
        )}
      </Card.Body>

      <style>{`
        .payment-status .status-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .payment-status .status-title {
          color: var(--bs-body-color);
          margin-bottom: 0.5rem;
        }

        .payment-status .status-badge {
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
        }

        .payment-status .payment-details {
          background: var(--bs-light, #f8f9fa);
          border-radius: 8px;
          padding: 1rem;
        }

        .payment-status .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .payment-status .detail-item {
          text-align: center;
        }

        .payment-status .detail-item small {
          font-size: 0.75rem;
          display: block;
          margin-bottom: 0.25rem;
        }

        .payment-status .last-checked {
          font-size: 0.8rem;
          border-top: 1px solid var(--bs-border-color, #dee2e6);
          padding-top: 0.75rem;
        }

        @media (max-width: 576px) {
          .payment-status .details-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </Card>
  );
};

export default PaymentStatus;
