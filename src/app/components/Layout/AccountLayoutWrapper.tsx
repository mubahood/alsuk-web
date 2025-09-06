// src/app/components/Layout/AccountLayoutWrapper.tsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import AccountSidebar from "../Account/AccountSidebar";

const AccountLayoutWrapper: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen and set default collapsed state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarCollapsed(mobile);
    };

    // Set initial state
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="account-layout-wrapper">
      <HeaderWrapper />
      {/* Mobile Menu Toggle Button */}
      <button 
        className={`mobile-sidebar-toggle ${isSidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label={isSidebarCollapsed ? "Open menu" : "Close menu"}
      >
        <i className={`bi ${isSidebarCollapsed ? 'bi-list' : 'bi-x'}`}></i>
      </button>
      
      <div className="container-fluid">
        <div className="account-main-container">
          <div className={`account-sidebar-section ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <AccountSidebar 
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
          <div className="account-content-section">
            {/* Mobile overlay when sidebar is open */}
            {!isSidebarCollapsed && isMobile && (
              <div 
                className="sidebar-overlay"
                onClick={() => setIsSidebarCollapsed(true)}
              />
            )}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayoutWrapper;
