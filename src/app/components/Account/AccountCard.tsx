// src/app/components/Account/AccountCard.tsx
import React from 'react';

interface AccountCardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

const AccountCard: React.FC<AccountCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  headerActions,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  emptyIcon = 'bi-inbox'
}) => {
  return (
    <div className={`account-card ${className}`}>
      {/* Card Header */}
      {(title || headerActions) && (
        <div className="account-card-header">
          <div className="account-card-header-content">
            {title && (
              <div className="account-card-header-text">
                <h3 className="account-card-title">
                  {icon && <i className={icon}></i>}
                  {title}
                </h3>
                {subtitle && (
                  <p className="account-card-subtitle">{subtitle}</p>
                )}
              </div>
            )}
            {headerActions && (
              <div className="account-card-header-actions">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="account-card-body">
        {loading ? (
          <div className="account-card-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading...</p>
          </div>
        ) : empty ? (
          <div className="account-card-empty">
            <i className={emptyIcon}></i>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default AccountCard;
