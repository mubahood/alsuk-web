// src/app/components/shared/ManifestInitializer.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { loadManifest, updateCartCount } from '../../store/slices/manifestSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

/**
 * Component that initializes and manages the application manifest
 * Should be rendered early in the app lifecycle
 */
const ManifestInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Load manifest when component mounts
  useEffect(() => {
    dispatch(loadManifest());
  }, [dispatch]);

  // Reload manifest when authentication status changes
  useEffect(() => {
    // Small delay to ensure auth state is settled
    const timer = setTimeout(() => {
      dispatch(loadManifest());
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, dispatch]);

  // This component doesn't render anything
  return null;
};

export default ManifestInitializer;
