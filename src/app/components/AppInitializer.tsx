// src/app/components/AppInitializer.tsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { updateCartCount } from '../store/slices/manifestSlice';

/**
 * AppInitializer handles initialization logic when the app starts
 * - Loads application manifest with essential data
 * - Loads wishlist for authenticated users
 * - Can be extended for other initialization tasks
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Manifest loading is handled by useManifest hook in components that need it
  // No need to load here to avoid duplicate requests

  // User-specific data is automatically included in manifest when user is authenticated
  // No need for separate auth-triggered reloads

  return <>{children}</>;
};

export default AppInitializer;
