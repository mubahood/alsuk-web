// src/app/components/Layout/MainLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderWrapper from "../Header/HeaderWrapper";
import Footer from "./Footer";

const MainLayout: React.FC = () => {
  return (
    <>
      <HeaderWrapper />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
