// src/app/pages/HomePage.tsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Alert } from "react-bootstrap";
import HeroSection from "../components/HomePage/HeroSection";
import DealsSection from "../components/HomePage/DealsSection";
import SuperBuyerSection from "../components/HomePage/SuperBuyerSection";
import TopProductsSection from "../components/HomePage/TopProductsSection";
import ToastService from "../services/ToastService";
// Inline styles for HomePage following the unified design system
const homePageStyles = `
  .homepage-container {
    background: var(--background-body);
    min-height: 100vh;
  }

  .homepage-section {
    padding: 2rem 0;
  }

  .homepage-section:first-child {
    padding-top: 1rem;
  }

  .homepage-section:last-child {
    padding-bottom: 3rem;
  }

  .hero-section-fullwidth {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    padding: 0;
    margin-bottom: 3rem;
  }

  @media (max-width: 767.98px) {
    .homepage-section {
      padding: 1.5rem 0;
    }
    
    .homepage-section:first-child {
      padding-top: 0.5rem;
    }
    
    .homepage-section:last-child {
      padding-bottom: 2rem;
    }
  }

  @media (max-width: 575.98px) {
    .homepage-section {
      padding: 1rem 0;
    }
  }
`;

interface LocationState {
  orderSuccess?: boolean;
  orderId?: number;
  paymentUrl?: string;
}

const HomePage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    // Show order success message when user returns from checkout
    if (state?.orderSuccess && state?.orderId) {
      ToastService.success(
        `🎉 Order #${state.orderId} placed successfully! Thank you for your purchase.`,
        { autoClose: 6000 }
      );
      
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: homePageStyles }} />
      <div className="homepage-container">
        <div className="container mt-4">
          {/* Order Success Alert */}
          {state?.orderSuccess && state?.orderId && (
            <Alert variant="success" className="mb-4">
              <Alert.Heading>🎉 Order Placed Successfully!</Alert.Heading>
              <p>
                Your order <strong>#{state.orderId}</strong> has been confirmed and is being processed.
                You will receive a confirmation email shortly.
              </p>
              <hr />
              <div className="d-flex justify-content-between">
                <a href="/account/orders" className="btn btn-outline-success">
                  <i className="bi bi-list-ul me-2"></i>
                  View My Orders
                </a>
                {state.paymentUrl && (
                  <a href={`/payment/${state.orderId}`} className="btn btn-success">
                    <i className="bi bi-credit-card me-2"></i>
                    Complete Payment
                  </a>
                )}
              </div>
            </Alert>
          )}

          <HeroSection />
          <DealsSection />
          <SuperBuyerSection />
          <TopProductsSection />
        </div>
      </div>
    </>
  );
};

export default HomePage;
