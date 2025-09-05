// src/app/pages/account/AccountProfile.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { updateProfile } from '../../store/slices/authSlice';
import ToastService from '../../services/ToastService';
import ApiService from '../../services/ApiService';
import AccountPageWrapper from '../../components/Account/AccountPageWrapper';
import AccountCard from '../../components/Account/AccountCard';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  sex: string;
  intro: string;
}

const AccountProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dob: '',
    sex: '',
    intro: ''
  });

  // Initialize profile data from user state
  useEffect(() => {
    if (user) {
      const newProfile = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number_1 || '',
        dob: user.date_of_birth || '',
        sex: user.sex || '',
        intro: user.intro || ''
      };
      setProfile(newProfile);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!profile.first_name.trim() || profile.first_name.trim().length < 2) {
      errors.first_name = 'First name is required and must be at least 2 characters';
    }
    if (!profile.last_name.trim() || profile.last_name.trim().length < 2) {
      errors.last_name = 'Last name is required and must be at least 2 characters';
    }
    if (!profile.phone_number.trim() || profile.phone_number.trim().length < 5) {
      errors.phone_number = 'Phone number is required and must be at least 5 characters';
    }
    if (profile.email && profile.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    if (profile.intro && profile.intro.length > 500) {
      errors.intro = 'Introduction must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      ToastService.error('Please correct the errors below');
      return;
    }

    setIsSaving(true);
    try {
      const response = await ApiService.updateProfile({
        ...profile,
        phone_number_1: profile.phone_number,
        date_of_birth: profile.dob
      });

      if (response.success) {
        dispatch(updateProfile(response.data));
        setIsEditing(false);
        setShowSuccess(true);
        ToastService.success('Profile updated successfully');
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      ToastService.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationErrors({});
    // Reset to original values
    if (user) {
      const originalProfile = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number_1 || '',
        dob: user.date_of_birth || '',
        sex: user.sex || '',
        intro: user.intro || ''
      };
      setProfile(originalProfile);
    }
  };

  return (
    <AccountPageWrapper
      title="My Profile"
      subtitle="Manage your personal information and account settings"
      icon="bi-person"
      headerActions={
        !isEditing ? (
          <button 
            className="btn btn-primary"
            onClick={handleEditClick}
          >
            <i className="bi-pencil me-2"></i>
            Edit Profile
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi-check me-2"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )
      }
    >
      {/* Success Alert */}
      {showSuccess && (
        <AccountCard className="success-border">
          <div className="text-success text-center">
            <i className="bi-check-circle-fill me-2"></i>
            Profile updated successfully!
          </div>
        </AccountCard>
      )}

      {/* Profile Information */}
      <AccountCard
        title="Personal Information"
        subtitle="Your basic information and contact details"
        icon="bi-person-lines-fill"
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleInputChange}
              className={`form-control ${validationErrors.first_name ? 'is-invalid' : ''}`}
              disabled={!isEditing}
              placeholder="Enter your first name"
            />
            {validationErrors.first_name && (
              <div className="invalid-feedback">{validationErrors.first_name}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleInputChange}
              className={`form-control ${validationErrors.last_name ? 'is-invalid' : ''}`}
              disabled={!isEditing}
              placeholder="Enter your last name"
            />
            {validationErrors.last_name && (
              <div className="invalid-feedback">{validationErrors.last_name}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
              disabled={!isEditing}
              placeholder="Enter your email address"
            />
            {validationErrors.email && (
              <div className="invalid-feedback">{validationErrors.email}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleInputChange}
              className={`form-control ${validationErrors.phone_number ? 'is-invalid' : ''}`}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
            {validationErrors.phone_number && (
              <div className="invalid-feedback">{validationErrors.phone_number}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleInputChange}
              className="form-control"
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select
              name="sex"
              value={profile.sex}
              onChange={handleInputChange}
              className="form-select"
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Introduction</label>
            <textarea
              name="intro"
              value={profile.intro}
              onChange={handleInputChange}
              className={`form-control ${validationErrors.intro ? 'is-invalid' : ''}`}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            {validationErrors.intro && (
              <div className="invalid-feedback">{validationErrors.intro}</div>
            )}
            <div className="form-text">
              {profile.intro.length}/500 characters
            </div>
          </div>
        </div>
      </AccountCard>

      {/* Account Security */}
      <AccountCard
        title="Account Security"
        subtitle="Manage your account security settings"
        icon="bi-shield-check"
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-1">Password</h6>
            <p className="text-muted mb-0">
              Keep your account secure with a strong password
            </p>
          </div>
          <Link 
            to="/account/settings" 
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi-gear me-2"></i>
            Security Settings
          </Link>
        </div>
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default AccountProfile;
