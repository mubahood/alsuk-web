// src/app/components/Account/AccountDashboardContent.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useAppCounts } from '../../hooks/useManifest';
import AccountPageWrapper from './AccountPageWrapper';
import AccountCard from './AccountCard';

const AccountDashboardContent: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const appCounts = useAppCounts();

  // Essential marketplace actions
  const quickActions = [
    {
      title: 'Messages',
      description: 'Chat with sellers and buyers',
      icon: 'bi-chat-dots',
      link: '/account/chat',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
    },
    {
      title: 'My Wishlist',
      description: 'View your saved products',
      icon: 'bi-heart',
      link: '/account/wishlist',
      color: 'danger',
      gradient: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)'
    },
    {
      title: 'Update Profile',
      description: 'Manage your account information',
      icon: 'bi-person-gear',
      link: '/account/profile',
      color: 'success',
      gradient: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)'
    },
    {
      title: 'Account Settings',
      description: 'Security and preferences',
      icon: 'bi-gear',
      link: '/account/settings',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #ffc107 0%, #d39e00 100%)'
    }
  ];

  // Marketplace-focused stats
  const accountStats = [
    {
      label: 'Wishlist Items',
      value: appCounts.wishlist_count?.toString() || '0',
      icon: 'bi-heart-fill',
      color: '#dc3545'
    },
    {
      label: 'Profile Completion',
      value: user?.complete_profile === 'Yes' ? '100%' : '75%',
      icon: 'bi-person-check',
      color: '#28a745'
    },
    {
      label: 'Account Status',
      value: user?.status || 'Active',
      icon: 'bi-shield-check',
      color: '#007bff'
    },
    {
      label: 'Member Since',
      value: user?.created_at ? new Date(user.created_at).getFullYear().toString() : new Date().getFullYear().toString(),
      icon: 'bi-calendar-check',
      color: '#6f42c1'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AccountPageWrapper
      title={`${getGreeting()}, ${user?.first_name || user?.name?.split(' ')[0] || 'Customer'}!`}
      subtitle="Welcome to your AL-SUK marketplace dashboard. Manage your account and discover amazing products."
      icon="bi-speedometer2"
    >
      {/* Account Stats */}
      <AccountCard
        title="Account Overview"
        subtitle="Quick summary of your account activity"
        icon="bi-graph-up"
      >
        <div className="row g-3">
          {accountStats.map((stat, index) => (
            <div key={index} className="col-6 col-md-3">
              <div className="text-center p-3">
                <div className="mb-2">
                  <i className={`${stat.icon} fs-2`} style={{ color: stat.color }}></i>
                </div>
                <h4 className="mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </h4>
                <h6 className="mb-1">{stat.label}</h6>
                <small className="text-muted">
                  {stat.label === 'Wishlist Items' && 'Products you want to buy later'}
                  {stat.label === 'Profile Completion' && 'Keep your profile updated'}
                  {stat.label === 'Account Status' && 'Your account is in good standing'}
                  {stat.label === 'Member Since' && 'Thank you for being with us'}
                </small>
              </div>
            </div>
          ))}
        </div>
      </AccountCard>

      {/* Quick Actions */}
      <AccountCard
        title="Quick Actions"
        subtitle="Access your most used features"
        icon="bi-lightning"
      >
        <div className="row g-3">
          {quickActions.map((action, index) => (
            <div key={index} className="col-6 col-md-3">
              <Link 
                to={action.link} 
                className="text-decoration-none"
              >
                <div className="card h-100 text-center border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '60px', 
                        height: '60px',
                        background: action.gradient 
                      }}
                    >
                      <i className={`${action.icon} text-white fs-4`}></i>
                    </div>
                    <h6 className="card-title mb-2">{action.title}</h6>
                    <p className="card-text small text-muted mb-0">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </AccountCard>

      {/* Welcome Message */}
      <AccountCard
        title="Welcome to AL-SUK Marketplace"
        subtitle="Your one-stop destination for quality products"
        icon="bi-shop"
        className="primary-border"
      >
        <div className="text-center">
          <div className="mb-4">
            <i className="bi-shop display-1 text-primary"></i>
          </div>
          <p className="lead mb-4">
            Browse thousands of items, connect with trusted sellers, 
            and enjoy a seamless shopping experience.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link 
              to="/products" 
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <i className="bi-search"></i>
              Browse Products
            </Link>
            <Link 
              to="/categories" 
              className="btn btn-outline-primary d-flex align-items-center gap-2"
            >
              <i className="bi-grid"></i>
              View Categories
            </Link>
          </div>
        </div>
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default AccountDashboardContent;