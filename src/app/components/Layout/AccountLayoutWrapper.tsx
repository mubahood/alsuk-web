// src/app/components/Layout/AccountLayoutWrapper.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import AccountSidebar from "../Account/AccountSidebar";

const AccountLayoutWrapper: React.FC = () => {
  return (
    <div className="account-layout-wrapper">
      <HeaderWrapper />
      <div className="container-fluid">
        <div className="account-main-container">
          <div className="account-sidebar-section">
            <AccountSidebar />
          </div>
          <div className="account-content-section">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayoutWrapper;
