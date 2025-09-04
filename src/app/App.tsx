import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routing/AppRoutes";
import ScrollToTop from "./components/Layout/ScrollToTop";
import { restoreAuthState, selectIsAuthenticated, selectUser } from "./store/slices/authSlice";

// Import React Toastify CSS
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Restore authentication state on app startup
  useEffect(() => {
    console.log('🚀 App initialized, restoring auth state...');
    
    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      dispatch(restoreAuthState());
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Debug auth state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email || user?.username
    });
  }, [isAuthenticated, user]);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="custom-toast-container"
      />
    </>
  );
};

export default App;
