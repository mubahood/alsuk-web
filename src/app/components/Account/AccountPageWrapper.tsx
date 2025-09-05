// src/app/components/Account/AccountPageWrapper.tsx
import React from 'react';

interface AccountPageWrapperProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

const AccountPageWrapper: React.FC<AccountPageWrapperProps> = ({
  title,
  subtitle,
  icon,
  children,
  headerActions,
  className = ''
}) => {
  return (
    <div className={`account-page-wrapper ${className}`}>
      {/* Standardized Page Header */}
      <div className="account-page-header">
        <div className="account-page-header-content">
          <div className="account-page-header-text">
            <h1 className="account-page-title">
              {icon && <i className={icon}></i>}
              {title}
            </h1>
            {subtitle && (
              <p className="account-page-subtitle">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="account-page-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Standardized Page Content */}
      <div className="account-page-content">
        {children}
      </div>
    </div>
  );
};

export default AccountPageWrapper;
