// src/app/pages/static/MobileApps.tsx
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout';
import { APP_LINKS, COMPANY_INFO } from '../../constants';

const MobileApps: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Mobile Apps' }
  ];

  const appFeatures = [
    {
      icon: "bi-lightning",
      title: "Fast & Secure Shopping",
      description: "Browse and shop thousands of products with lightning-fast speed and secure payments"
    },
    {
      icon: "bi-bell",
      title: "Push Notifications",
      description: "Get instant updates on orders, deals, and exclusive offers directly to your phone"
    },
    {
      icon: "bi-geo-alt",
      title: "Location-Based Services",
      description: "Find products and services near you with our location-aware features"
    },
    {
      icon: "bi-camera",
      title: "Visual Search",
      description: "Take a photo to find similar products or use barcode scanning for quick purchases"
    },
    {
      icon: "bi-credit-card",
      title: "Mobile Payments",
      description: "Pay seamlessly with Mobile Money, card payments, or other mobile payment methods"
    },
    {
      icon: "bi-person-check",
      title: "Account Sync",
      description: "Your account, orders, and wishlist sync perfectly across all your devices"
    }
  ];

  return (
    <StaticPageLayout
      title="AL-SUK Mobile Apps"
      subtitle="Shop anywhere, anytime with our mobile apps for iOS and Android"
      breadcrumbs={breadcrumbs}
    >
      <div>
        <h2>Download Our Mobile Apps</h2>
        <p>
          Experience the full power of AL-SUK on your mobile device. Our apps are designed to provide 
          you with a seamless shopping experience, whether you're at home, at work, or on the go.
        </p>

        <div className="static-app-download">
          <h3 className="static-app-title">Get the AL-SUK App</h3>
          <p className="static-app-description">
            Available for free on both iOS and Android devices. Download now and start shopping!
          </p>
          <div className="static-app-buttons">
            <a 
              href={APP_LINKS.IOS}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-apple"></i>
              Download for iOS
            </a>
            <a 
              href={APP_LINKS.ANDROID}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-google-play"></i>
              Download for Android
            </a>
          </div>
        </div>

        <h2>App Features</h2>
        <p>
          Our mobile apps come packed with features designed to make your shopping experience smooth, 
          fast, and enjoyable:
        </p>

        <div className="static-feature-grid">
          {appFeatures.map((feature, index) => (
            <div key={index} className="static-feature-card">
              <i className={`${feature.icon} static-feature-icon`}></i>
              <h3 className="static-feature-title">{feature.title}</h3>
              <p className="static-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <h2>System Requirements</h2>
        
        <h3>iOS App Requirements</h3>
        <ul>
          <li>iOS 12.0 or later</li>
          <li>Compatible with iPhone, iPad, and iPod touch</li>
          <li>50 MB of free storage space</li>
          <li>Internet connection required</li>
        </ul>

        <h3>Android App Requirements</h3>
        <ul>
          <li>Android 6.0 (API level 23) or higher</li>
          <li>50 MB of free storage space</li>
          <li>Internet connection required</li>
          <li>Compatible with most Android devices</li>
        </ul>

        <h2>App Support & Updates</h2>
        <p>
          We regularly update our apps to bring you new features, security improvements, and bug fixes. 
          Make sure to enable automatic updates to always have the latest version.
        </p>

        <h3>Need Help with the App?</h3>
        <p>
          If you're experiencing issues with our mobile app or need assistance, our support team is 
          here to help:
        </p>

        <div className="static-contact-grid">
          <div className="static-contact-item">
            <i className="bi bi-envelope static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Email Support</p>
              <p className="static-contact-value">
                <a href={`mailto:${COMPANY_INFO.EMAIL}?subject=Mobile App Support`}>
                  {COMPANY_INFO.EMAIL}
                </a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-whatsapp static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">WhatsApp Support</p>
              <p className="static-contact-value">
                <a 
                  href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}?text=Hi, I need help with the AL-SUK mobile app`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {COMPANY_INFO.WHATSAPP}
                </a>
              </p>
            </div>
          </div>
          
          <div className="static-contact-item">
            <i className="bi bi-question-circle static-contact-icon"></i>
            <div className="static-contact-info">
              <p className="static-contact-label">Help Center</p>
              <p className="static-contact-value">
                <a href="/help">Visit Help Center</a>
              </p>
            </div>
          </div>
        </div>

        <h2>Privacy & Security</h2>
        <p>
          Your privacy and security are our top priorities. Our mobile apps use industry-standard 
          encryption to protect your personal information and payment details. We never store 
          sensitive payment information on your device.
        </p>

        <ul>
          <li>End-to-end encryption for all transactions</li>
          <li>Secure authentication with biometric support</li>
          <li>Regular security updates and monitoring</li>
          <li>Compliance with international privacy standards</li>
        </ul>

        <h2>Coming Soon</h2>
        <p>We're constantly working to improve your mobile experience. Here's what's coming soon:</p>
        <ul>
          <li>Augmented Reality (AR) product preview</li>
          <li>Voice search functionality</li>
          <li>Social shopping features</li>
          <li>Enhanced offline browsing</li>
          <li>Smart recommendation engine</li>
        </ul>

        <div className="static-app-download">
          <h3 className="static-app-title">Ready to Get Started?</h3>
          <p className="static-app-description">
            Join millions of satisfied customers who shop with AL-SUK mobile apps every day.
          </p>
          <div className="static-app-buttons">
            <a 
              href={APP_LINKS.IOS}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-apple"></i>
              App Store
            </a>
            <a 
              href={APP_LINKS.ANDROID}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-google-play"></i>
              Google Play
            </a>
            <a 
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/\D/g, '')}`}
              className="static-app-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default MobileApps;
