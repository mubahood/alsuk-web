// src/app/pages/account/AccountSettings.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Settings, Shield, Bell, CreditCard, Eye, EyeOff, Save } from "lucide-react";
import AccountPageWrapper from '../../components/Account/AccountPageWrapper';
import AccountCard from '../../components/Account/AccountCard';

const AccountSettings: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  
  // Settings state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    securityAlerts: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    personalization: true
  });

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Password update logic here
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Clear password fields
    setSecuritySettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSettingsSave = () => {
    // In a real app, this would make an API call
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <AccountPageWrapper
      title="Account Settings"
      subtitle="Manage your account preferences and security"
      icon="bi-gear"
      headerActions={
        <button 
          onClick={handleSettingsSave}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Save size={16} />
          Save All Changes
        </button>
      }
    >
      {/* Success Alert */}
      {showSuccess && (
        <AccountCard className="success-border">
          <div className="text-success text-center">
            <i className="bi-check-circle-fill me-2"></i>
            Settings updated successfully!
          </div>
        </AccountCard>
      )}

      {/* Security Settings */}
      <AccountCard
        title="Security Settings"
        subtitle="Change your password and manage two-factor authentication"
        icon="bi-shield-check"
      >
        <form onSubmit={handlePasswordSubmit}>
          <h5 className="mb-3">Change Password</h5>
          
          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <div className="input-group">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={securitySettings.currentPassword}
                onChange={handleSecurityChange}
                className="form-control"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={securitySettings.newPassword}
                onChange={handleSecurityChange}
                className="form-control"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={securitySettings.confirmPassword}
              onChange={handleSecurityChange}
              className="form-control"
              placeholder="Confirm new password"
            />
          </div>

          <hr className="my-4" />

          <div className="form-check">
            <input
              type="checkbox"
              id="twoFactorEnabled"
              name="twoFactorEnabled"
              checked={securitySettings.twoFactorEnabled}
              onChange={handleSecurityChange}
              className="form-check-input"
            />
            <label htmlFor="twoFactorEnabled" className="form-check-label">
              Enable Two-Factor Authentication
            </label>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </AccountCard>

      {/* Notification Settings */}
      <AccountCard
        title="Notification Preferences"
        subtitle="Choose what notifications you want to receive"
        icon="bi-bell"
      >
        <div className="row">
          <div className="col-md-6">
            <h6 className="mb-3">Email Notifications</h6>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="emailNotifications" className="form-check-label">
                General Email Notifications
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="orderUpdates"
                name="orderUpdates"
                checked={notificationSettings.orderUpdates}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="orderUpdates" className="form-check-label">
                Order Status Updates
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="promotions"
                name="promotions"
                checked={notificationSettings.promotions}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="promotions" className="form-check-label">
                Promotions & Offers
              </label>
            </div>
          </div>
          <div className="col-md-6">
            <h6 className="mb-3">Other Notifications</h6>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={notificationSettings.smsNotifications}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="smsNotifications" className="form-check-label">
                SMS Notifications
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                checked={notificationSettings.newsletter}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="newsletter" className="form-check-label">
                Newsletter Subscription
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="securityAlerts"
                name="securityAlerts"
                checked={notificationSettings.securityAlerts}
                onChange={handleNotificationChange}
                className="form-check-input"
              />
              <label htmlFor="securityAlerts" className="form-check-label">
                Security Alerts
              </label>
            </div>
          </div>
        </div>
      </AccountCard>

      {/* Privacy Settings */}
      <AccountCard
        title="Privacy & Data"
        subtitle="Control your privacy and data sharing preferences"
        icon="bi-shield-lock"
      >
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="profileVisibility" className="form-label">Profile Visibility</label>
              <select
                id="profileVisibility"
                name="profileVisibility"
                value={privacySettings.profileVisibility}
                onChange={handlePrivacyChange}
                className="form-select"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="dataSharing"
                name="dataSharing"
                checked={privacySettings.dataSharing}
                onChange={handlePrivacyChange}
                className="form-check-input"
              />
              <label htmlFor="dataSharing" className="form-check-label">
                Allow data sharing with partners
              </label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="analytics"
                name="analytics"
                checked={privacySettings.analytics}
                onChange={handlePrivacyChange}
                className="form-check-input"
              />
              <label htmlFor="analytics" className="form-check-label">
                Help improve our service with analytics
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                id="personalization"
                name="personalization"
                checked={privacySettings.personalization}
                onChange={handlePrivacyChange}
                className="form-check-input"
              />
              <label htmlFor="personalization" className="form-check-label">
                Personalized recommendations
              </label>
            </div>
          </div>
        </div>
      </AccountCard>

      {/* Account Actions */}
      <AccountCard
        title="Account Actions"
        subtitle="Manage your account data and preferences"
        icon="bi-person-gear"
        className="danger-border"
      >
        <div className="d-flex flex-column gap-3">
          <div>
            <h6>Export Account Data</h6>
            <p className="text-muted small mb-2">Download a copy of your account data</p>
            <button className="btn btn-outline-primary btn-sm">
              <i className="bi-download me-2"></i>
              Export Data
            </button>
          </div>

          <hr />

          <div>
            <h6 className="text-warning">Danger Zone</h6>
            <p className="text-muted small mb-2">These actions cannot be undone</p>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-warning btn-sm">
                <i className="bi-pause-circle me-2"></i>
                Deactivate Account
              </button>
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi-trash me-2"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default AccountSettings;
