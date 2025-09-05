// src/app/pages/ProductDetailPage/ProductDetailPage.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ProgressBar,
  Spinner,
  Modal,
  Card,
} from "react-bootstrap";
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "../../services/realProductsApi";
import { ProductModel } from "../../models/ProductModel";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import { selectIsAuthenticated, selectUser } from "../../store/slices/authSlice";
import ProductCard from "../../components/shared/ProductCard";
import WishlistButton from "../../components/shared/WishlistButton";
import DynamicBreadcrumb from "../../components/shared/DynamicBreadcrumb";
import Utils from "../../services/Utils";
import chatService from "../../services/chatService";

// All CSS inline - no external dependencies
const inlineStyles = `
  /* ===================================================================
     Product Detail Page - Modern Square Design
     Extends parent theme variables for consistency
     =================================================================== */

  /* Loading, Error, Not Found States */
  .pdp-loading-container,
  .pdp-error-container,
  .pdp-not-found-container {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    padding: var(--spacing-3xl);
  }

  .pdp-loading-container .spinner-border {
    width: 3rem;
    height: 3rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
  }

  .pdp-loading-container h4,
  .pdp-error-container h4,
  .pdp-not-found-container h4 {
    color: var(--text-color-dark);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
  }

  /* Main Product Container */
  .product-detail-page-container {
    background: var(--white);
    padding: 1rem;
  }

  /* Product Image Gallery */
  .product-image-gallery {
    position: relative;
  }

  .main-image-wrapper {
    width: 100%;
    aspect-ratio: 1;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-timing);
    position: relative;
    box-shadow: var(--shadow-sm);
  }

  .main-image-wrapper:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .main-image-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform var(--transition-speed) var(--transition-timing);
  }

  .main-image-wrapper:hover img {
    transform: scale(1.02);
  }

  /* Improved thumbnail row with horizontal scroll */
  .thumbnail-container {
    position: relative;
    margin-top: var(--spacing-md);
  }

  .thumbnail-scroll-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .thumbnail-scroll-button {
    width: 32px;
    height: 32px;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    background: var(--white);
    color: var(--text-color-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-timing);
    flex-shrink: 0;
    z-index: 2;
  }

  .thumbnail-scroll-button:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  .thumbnail-scroll-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .thumbnail-row {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
    padding: 2px;
  }

  .thumbnail-row::-webkit-scrollbar {
    display: none;
  }

  .thumb-wrapper {
    width: 70px;
    height: 70px;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-timing);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  .thumb-wrapper:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .thumb-wrapper.selected-thumb {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }

  .thumb-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .discount-badge {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: var(--accent-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 12px;
    box-shadow: var(--shadow-sm);
    z-index: 2;
  }

  /* Thumbnail Gallery */
  .thumbnail-row {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding: var(--spacing-sm) 0;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--background-light);
    scroll-behavior: smooth;
  }

  .thumbnail-row::-webkit-scrollbar {
    height: 6px;
  }

  .thumbnail-row::-webkit-scrollbar-track {
    background: var(--background-light);
    border-radius: 3px;
  }

  .thumbnail-row::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
  }

  .thumbnail-row::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
    opacity: 0.8;
  }

  .thumb-wrapper {
    flex: 0 0 auto;
    width: 70px;
    height: 70px;
    border: 1px solid var(--border-color);
    border-radius: 0px;
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-timing);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
    position: relative;
  }

  .thumb-wrapper:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }

  .thumb-wrapper.selected-thumb {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.3);
  }

  .thumb-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 576px) {
    .thumb-wrapper {
      width: 60px;
      height: 60px;
    }
  }

  /* Product Info */
  .product-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color-dark);
    line-height: 1.3;
    margin-bottom: var(--spacing-lg);
  }

  .category-badge {
    background: var(--primary-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius);
    font-weight: 500;
    font-size: 13px;
    border: none;
  }

  /* Share Buttons */
  .share-buttons {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
  }

  .share-buttons .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background: var(--white);
    color: var(--text-color-medium);
    transition: all var(--transition-speed) var(--transition-timing);
    font-size: 14px;
  }

  .share-buttons .btn:hover {
    box-shadow: var(--shadow-sm);
  }

  .share-buttons .btn-facebook:hover {
    background: #1877f2;
    color: var(--white);
    border-color: #1877f2;
  }

  .share-buttons .btn-twitter:hover {
    background: #1da1f2;
    color: var(--white);
    border-color: #1da1f2;
  }

  .share-buttons .btn-whatsapp:hover {
    background: #25d366;
    color: var(--white);
    border-color: #25d366;
  }

  /* Sidebar Card */
  .sidebar-card {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: var(--spacing-2xl);
  }

  .sidebar-card .card-body {
    padding: var(--spacing-2xl);
  }

  /* Pricing Section */
  .pricing-section {
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color-light);
  }

  .current-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1.2;
    margin-bottom: var(--spacing-xs);
  }

  .old-price {
    font-size: 1rem;
    color: var(--text-color-light);
    text-decoration: line-through;
    margin-left: var(--spacing-sm);
  }

  .savings-badge {
    background: var(--success-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-weight: 500;
    font-size: 12px;
    margin-top: var(--spacing-xs);
    display: inline-block;
  }

  /* Stock Status */
  .stock-container {
    background: var(--background-light);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    transition: all var(--transition-speed) var(--transition-timing);
  }

  .stock-container.in-stock {
    background: rgba(25, 135, 84, 0.05);
    border-color: rgba(25, 135, 84, 0.2);
  }

  .stock-container.out-of-stock {
    background: rgba(var(--primary-color-rgb), 0.05);
    border-color: rgba(var(--primary-color-rgb), 0.2);
  }

  .stock-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
  }

  .stock-status.in-stock {
    color: var(--success-color);
  }

  .stock-status.out-of-stock {
    color: var(--primary-color);
  }

  .stock-count {
    color: var(--text-color-medium);
    font-size: 14px;
    margin-bottom: var(--spacing-sm);
  }

  /* Progress Bar */
  .stock-progress {
    height: 6px;
    background: var(--background-muted);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .stock-progress .progress-bar {
    border-radius: var(--border-radius);
    transition: width 0.6s ease;
  }

  /* Variants */
  .variants-section {
    margin-bottom: var(--spacing-lg);
  }

  .variant-label {
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: var(--spacing-sm);
    display: block;
    font-size: 14px;
  }

  .variant-options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .variant-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-color);
    background: var(--white);
    color: var(--text-color-medium);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-timing);
    font-weight: 500;
    font-size: 13px;
  }

  .variant-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--background-light);
  }

  .variant-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--white);
    box-shadow: var(--shadow-sm);
  }

  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .btn-add-to-cart,
  .btn-buy-now {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--border-radius);
    border: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-add-to-cart {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .btn-add-to-cart:hover:not(:disabled) {
    background: var(--primary-color-dark);
    border-color: var(--primary-color-dark);
    color: var(--white);
    box-shadow: var(--shadow-md);
  }

  .btn-buy-now {
    background: var(--white);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .btn-buy-now:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .btn-add-to-cart:disabled,
  .btn-buy-now:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Checkout Button */
  .btn-checkout {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.75rem;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: var(--border-radius);
    border: none;
    background: #28a745 !important;
    color: white !important;
    transition: all var(--transition-speed) var(--transition-timing);
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  }

  .btn-checkout:hover {
    background: #218838 !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }

  .btn-checkout:active {
    transform: translateY(0);
  }

  .btn-checkout:focus {
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25);
  }

  /* Contact Actions */
  .contact-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .btn-chat-seller,
  .btn-whatsapp,
  .btn-call-seller {
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    transition: all var(--transition-speed) var(--transition-timing);
    border: none;
    font-size: 15px;
    min-height: 48px;
  }

  .btn-chat-seller {
    background: var(--primary-color);
    color: var(--white);
  }

  .btn-chat-seller:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-whatsapp {
    background: #25d366;
    color: var(--white);
  }

  .btn-whatsapp:hover {
    background: #128c7e;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-call-seller {
    background: var(--white);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }

  .btn-call-seller:hover {
    background: var(--primary-color);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Safety Tips Card */
  .safety-tips-card {
    background: var(--background-light);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    margin-top: var(--spacing-2xl);
  }

  .safety-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .safety-header i {
    color: var(--success-color);
    font-size: 18px;
  }

  .safety-header h6 {
    margin: 0;
    color: var(--text-color-dark);
    font-weight: 600;
  }

  .safety-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .safety-tip {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) 0;
  }

  .safety-tip i {
    color: var(--text-color-medium);
    font-size: 14px;
    width: 16px;
    text-align: center;
  }

  .safety-tip span {
    color: var(--text-color-medium);
    font-size: 14px;
  }

  /* Product Tabs */
  .product-tabs {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    margin-bottom: var(--spacing-2xl);
  }

  .product-tabs .nav-pills {
    background: var(--background-light);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
  }

  .product-tabs .nav-pills .nav-link {
    background: transparent;
    color: var(--text-color-medium);
    font-weight: 500;
    border-radius: var(--border-radius);
    padding: var(--spacing-sm) var(--spacing-lg);
    margin-right: var(--spacing-sm);
    border: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
    font-size: 14px;
  }

  .product-tabs .nav-pills .nav-link:hover {
    background: var(--white);
    color: var(--text-color-dark);
    border-color: var(--border-color);
  }

  .product-tabs .nav-pills .nav-link.active {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .product-tabs .tab-content {
    padding: var(--spacing-2xl);
    background: var(--white);
  }

  .product-tabs .tab-pane {
    color: var(--text-color-medium);
    line-height: 1.6;
  }

  /* Specifications Table */
  .specs-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .specs-table th,
  .specs-table td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .specs-table th {
    background: var(--background-light);
    font-weight: 600;
    color: var(--text-color-dark);
    width: 30%;
    font-size: 14px;
  }

  .specs-table td {
    color: var(--text-color-medium);
    font-size: 14px;
  }

  .specs-table tr:last-child th,
  .specs-table tr:last-child td {
    border-bottom: none;
  }

  .specs-table tr:nth-child(even) {
    background: var(--background-muted);
  }

  /* Product Tags */
  .product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }

  .product-tag {
    background: var(--primary-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all var(--transition-speed) var(--transition-timing);
    cursor: pointer;
    border: 1px solid transparent;
    user-select: none;
    outline: none;
  }

  .product-tag:hover,
  .product-tag:focus {
    background: var(--white);
    color: var(--primary-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .product-tag:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .product-tag.secondary {
    background: var(--text-color-light);
    color: var(--white);
  }

  .product-tag.secondary:hover,
  .product-tag.secondary:focus {
    background: var(--white);
    color: var(--text-color-dark);
    border-color: var(--text-color-light);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .product-tag.secondary:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Product Attributes Section */
  .product-attributes {
    margin-top: var(--spacing-lg);
    padding: 0;
    border: none;
  }

  .product-attributes h5 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--primary-color);
    letter-spacing: 0.5px;
    text-transform: capitalize;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  .attributes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
    border: none;
    background: transparent;
  }

  .attribute-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0.75rem;
    padding: 0.4rem 0.5rem;
    align-items: start;
    border-bottom: none;
  }

  .attribute-row:nth-child(even) {
    background: var(--bs-light);
  }

  .attribute-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--bs-secondary);
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .attribute-value {
    font-size: 0.8rem;
    color: var(--bs-dark);
    line-height: 1.3;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    .attribute-row {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  /* Related Products */
  .related-products {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .related-products h3 {
    color: var(--text-color-dark);
    font-weight: 700;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .related-products h3::before {
    content: "";
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border-radius: 2px;
  }

  .related-products-slider {
    position: relative;
    overflow: hidden;
  }

  .related-products-container {
    display: flex;
    gap: 1rem;
    transition: transform 0.3s ease;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 0.5rem;
  }

  .related-products-container::-webkit-scrollbar {
    display: none;
  }

  .related-product-item {
    flex: 0 0 220px;
    min-width: 220px;
  }

  .related-product-card {
    background: var(--white);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .related-product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color);
  }

  .related-product-image {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;
    background: var(--bg-light);
  }

  .related-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .related-product-card:hover .related-product-image img {
    transform: scale(1.05);
  }

  .related-product-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .related-product-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.5rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-decoration: none;
    flex: 1;
  }

  .related-product-title:hover {
    color: var(--primary-color);
  }

  .related-product-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .related-product-price-current {
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .related-product-price-original {
    font-size: 0.85rem;
    color: var(--text-color-muted);
    text-decoration: line-through;
  }

  .related-product-discount {
    background: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
  }

  .related-product-actions {
    display: flex;
    gap: 0.5rem;
  }

  .related-product-btn {
    flex: 1;
    padding: 0.6rem 0.8rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .related-product-btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .related-product-btn-primary:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
  }

  .related-product-btn-outline {
    background: transparent;
    color: var(--text-color-dark);
    border: 1px solid var(--border-color);
  }

  .related-product-btn-outline:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-color-light);
    text-decoration: none;
  }

  .slider-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    color: var(--text-color-dark);
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slider-button:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  .slider-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(-50%);
  }

  .slider-button.prev {
    left: -16px;
  }

  .slider-button.next {
    right: -16px;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .related-products {
      padding: 1rem;
      margin-top: 1rem;
    }

    .related-product-item {
      flex: 0 0 180px;
      min-width: 180px;
    }

    .related-product-image {
      height: 120px;
    }

    .related-product-content {
      padding: 0.5rem;
    }

    .related-product-title {
      font-size: 0.8rem;
    }

    .related-product-price-current {
      font-size: 0.85rem;
    }

    .related-product-btn {
      padding: 0.3rem 0.4rem;
      font-size: 0.75rem;
    }

    .slider-button {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }

    .slider-button.prev {
      left: -14px;
    }

    .slider-button.next {
      right: -14px;
    }
  }

  @media (max-width: 480px) {
    .related-product-item {
      flex: 0 0 160px;
      min-width: 160px;
    }

    .related-product-image {
      height: 100px;
    }

    .related-product-actions {
      flex-direction: column;
      gap: 0.3rem;
    }

    .related-product-btn {
      padding: 0.35rem;
      font-size: 0.7rem;
    }
  }
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-color-dark);
    transition: all var(--transition-speed) var(--transition-timing);
    z-index: 2;
    box-shadow: var(--shadow-sm);
  }

  .slider-button:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
  }

  .slider-button.prev {
    left: -18px;
  }

  .slider-button.next {
    right: -18px;
  }

  .slider-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: var(--background-light);
    color: var(--text-color-light);
  }

  .slider-button:disabled:hover {
    background: var(--background-light);
    color: var(--text-color-light);
    border-color: var(--border-color);
  }

  /* Fullscreen Modal Styles */
  .fullscreen-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.95) !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(3px);
  }

  .fullscreen-modal .modal-dialog {
    max-width: none !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .fullscreen-modal .modal-content {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .fullscreen-modal .modal-header,
  .fullscreen-modal .modal-footer {
    display: none !important;
  }

  .fullscreen-modal .modal-body {
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    background: transparent !important;
  }

  .modal-image-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    overflow: hidden;
    padding: 0;
  }

  .modal-image-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100vw - 140px); /* Account for nav buttons */
    height: calc(100vh - 100px); /* Account for close button and counter */
    max-width: calc(100vw - 140px);
    max-height: calc(100vh - 100px);
    background: transparent;
    border-radius: 8px;
    overflow: hidden;
  }

  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.2s ease;
    color: var(--text-color-dark);
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .modal-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.2s ease;
    color: var(--text-color-dark);
    font-size: 24px;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-nav-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .modal-nav-btn.prev {
    left: 20px;
  }

  .modal-nav-btn.next {
    right: 20px;
  }

  .modal-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .modal-nav-btn:disabled:hover {
    transform: translateY(-50%) scale(1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-image-counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-dark);
    z-index: 10001;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    .modal-close-btn {
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .modal-nav-btn {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }

    .modal-nav-btn.prev {
      left: 10px;
    }

    .modal-nav-btn.next {
      right: 10px;
    }

    .modal-image-counter {
      bottom: 10px;
      padding: 6px 12px;
      font-size: 12px;
    }

    .modal-image-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100vw - 88px); /* Account for smaller nav buttons on mobile */
      height: calc(100vh - 80px); /* Account for smaller controls on mobile */
      max-width: calc(100vw - 88px);
      max-height: calc(100vh - 80px);
    }
  }

  /* Responsive Design */
  @media (max-width: 991.98px) {
    .sidebar-card {
      position: relative;
      top: auto;
      margin-top: var(--spacing-2xl);
    }

    .product-title {
      font-size: 1.5rem;
    }

    .current-price {
      font-size: 1.75rem;
    }

    .product-detail-page-container {
      padding: 0.75rem;
    }
  }

  @media (max-width: 767.98px) {
    .product-detail-page-container {
      padding: 0.5rem;
    }

    .product-title {
      font-size: 1.25rem;
    }

    .current-price {
      font-size: 1.5rem;
    }

    .action-buttons {
      gap: var(--spacing-sm);
    }

    .btn-add-to-cart,
    .btn-buy-now {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: 13px;
    }

    .related-product-item {
      flex: 0 0 220px;
      min-width: 220px;
    }

    .slider-button {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .slider-button.prev {
      left: -16px;
    }

    .slider-button.next {
      right: -16px;
    }

    .sidebar-card .card-body {
      padding: var(--spacing-lg);
    }

    .product-tabs .nav-pills {
      padding: var(--spacing-md);
    }

    .product-tabs .tab-content {
      padding: var(--spacing-lg);
    }
  }

  @media (max-width: 575.98px) {
    .action-buttons {
      flex-direction: column;
    }

    .share-buttons {
      justify-content: center;
    }

    .related-products {
      padding: var(--spacing-lg);
    }

    .related-product-item {
      flex: 0 0 200px;
      min-width: 200px;
    }
  }

  /* ===================================================================
     Product Description Content Styling
     =================================================================== */
  .product-description-content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-color);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .product-description-content * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Typography */
  .product-description-content p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .product-description-content h1,
  .product-description-content h2,
  .product-description-content h3,
  .product-description-content h4,
  .product-description-content h5,
  .product-description-content h6 {
    color: var(--primary-color);
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    line-height: 1.3;
  }

  .product-description-content h1 { font-size: 1.5rem; }
  .product-description-content h2 { font-size: 1.375rem; }
  .product-description-content h3 { font-size: 1.25rem; }
  .product-description-content h4 { font-size: 1.125rem; }
  .product-description-content h5 { font-size: 1rem; }
  .product-description-content h6 { font-size: 0.875rem; }

  /* Lists */
  .product-description-content ul,
  .product-description-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .product-description-content li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  /* Images */
  .product-description-content img {
    max-width: 250px !important;
    width: auto !important;
    height: auto !important;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    margin: 1rem auto;
    display: block;
  }

  .product-description-content figure {
    margin: 1rem 0;
    text-align: center;
  }

  .product-description-content figcaption {
    font-size: 0.75rem;
    color: var(--text-color-light);
    margin-top: 0.5rem;
    font-style: italic;
  }

  /* Tables */
  .product-description-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    background: var(--white);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .product-description-content table th,
  .product-description-content table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
  }

  .product-description-content table th {
    background: var(--background-light);
    color: var(--text-color-dark);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .product-description-content table tr:last-child td {
    border-bottom: none;
  }

  .product-description-content table tr:hover {
    background: var(--background-light);
  }

  /* Links */
  .product-description-content a {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
  }

  .product-description-content a:hover {
    color: var(--primary-color-dark);
    border-bottom-color: var(--primary-color);
  }

  /* Blockquotes */
  .product-description-content blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--primary-color);
    background: var(--background-light);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    font-style: italic;
  }

  /* Code */
  .product-description-content code {
    background: var(--background-light);
    color: var(--primary-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
  }

  .product-description-content pre {
    background: var(--background-light);
    color: var(--text-color-dark);
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin: 1rem 0;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .product-description-content pre code {
    background: none;
    color: inherit;
    padding: 0;
  }

  /* Dividers */
  .product-description-content hr {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 2rem 0;
  }

  /* Strong and emphasis */
  .product-description-content strong,
  .product-description-content b {
    color: var(--text-color-dark);
    font-weight: 600;
  }

  .product-description-content em,
  .product-description-content i {
    font-style: italic;
    color: var(--text-color);
  }

  /* Video and iframe responsiveness */
  .product-description-content iframe,
  .product-description-content video,
  .product-description-content embed,
  .product-description-content object {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: var(--border-radius);
  }

  /* Responsive iframe wrapper */
  .product-description-content .video-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    margin: 1rem 0;
    border-radius: var(--border-radius);
  }

  .product-description-content .video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .product-description-content {
      font-size: 0.8rem;
    }

    .product-description-content h1 { font-size: 1.25rem; }
    .product-description-content h2 { font-size: 1.125rem; }
    .product-description-content h3 { font-size: 1rem; }
    .product-description-content h4 { font-size: 0.95rem; }
    .product-description-content h5 { font-size: 0.9rem; }
    .product-description-content h6 { font-size: 0.85rem; }

    .product-description-content table {
      font-size: 0.75rem;
    }

    .product-description-content table th,
    .product-description-content table td {
      padding: 0.5rem;
    }
  }

  /* ===================================================================
     Page Navigator Styling
     =================================================================== */
  .page-navigator {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
  }

  .navigator-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .navigator-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-color);
    text-decoration: none;
    transition: all var(--transition-speed) var(--transition-timing);
    cursor: pointer;
    font-size: 0.875rem;
    width: 100%;
    text-align: left;
  }

  .nav-link-btn:hover {
    background: var(--background-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateX(2px);
  }

  .nav-link-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color-light);
  }

  .nav-link-btn i {
    font-size: 1rem;
    width: 16px;
    text-align: center;
    color: var(--primary-color);
  }

  .nav-link-btn span {
    font-weight: 500;
  }

  /* Mobile responsiveness for navigator */
  @media (max-width: 992px) {
    .page-navigator {
      display: none;
    }

    /* Hide desktop action buttons on mobile */
    .action-buttons {
      display: none;
    }
  }

  /* ===================================================================
     Mobile Sticky Bottom Bar
     =================================================================== */
  .mobile-sticky-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .mobile-contact-actions {
    display: flex;
    gap: 0.5rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .mobile-btn-call,
  .mobile-btn-whatsapp,
  .mobile-btn-chat {
    flex: 1;
    padding: 0.875rem 0.5rem;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: var(--border-radius);
    border: none;
    transition: all var(--transition-speed) var(--transition-timing);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-height: 60px;
  }

  .mobile-btn-call {
    background: var(--white);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }

  .mobile-btn-call:hover {
    background: var(--primary-color);
    color: var(--white);
  }

  .mobile-btn-whatsapp {
    background: #25d366;
    color: var(--white);
  }

  .mobile-btn-whatsapp:hover {
    background: #128c7e;
  }

  .mobile-btn-chat {
    background: var(--primary-color);
    color: var(--white);
  }

  .mobile-btn-chat:hover {
    background: var(--primary-color-dark);
  }

  .mobile-btn-call i,
  .mobile-btn-whatsapp i,
  .mobile-btn-chat i {
    font-size: 1.2rem;
  }

  /* Show mobile bar only on mobile devices */
  @media (max-width: 992px) {
    .mobile-sticky-bottom {
      display: block;
    }

    /* Add bottom padding to container to prevent content overlap */
    .container {
      padding-bottom: 100px;
    }
  }

  /* Hide mobile bar on desktop */
  @media (min-width: 993px) {
    .mobile-sticky-bottom {
      display: none;
    }
  }

  /* ===================================================================
     Section Titles Styling
     =================================================================== */
  .section-title {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-title i {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  /* Apply to existing section titles */
  .card-body h5:first-child,
  .product-attributes h5,
  .navigator-title {
    color: var(--primary-color);
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card-body h5:first-child::after,
  .product-attributes h5::after,
  .navigator-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  .card-body h5:first-child i,
  .product-attributes h5 i,
  .navigator-title i {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  /* Related products title */
  .related-products h3 {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  .related-products h3::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  /* Mobile responsiveness for section titles */
  @media (max-width: 768px) {
    /* Mobile page layout improvements */
    .container {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    /* Breadcrumb mobile spacing */
    .breadcrumb {
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    /* Card spacing on mobile */
    .card {
      margin-bottom: 0.5rem !important;
    }

    .card-body {
      padding: 0.75rem !important;
    }

    /* Mobile product layout */
    .product-image-gallery {
      margin-bottom: 1rem;
    }

    .main-image-wrapper {
      margin-bottom: 0.75rem;
    }

    /* Ensure content doesn't get hidden behind mobile sticky bar */
    body {
      padding-bottom: 80px;
    }

    .section-title,
    .card-body h5:first-child,
    .product-attributes h5,
    .navigator-title {
      font-size: 1.1rem;
    }

    .related-products h3 {
      font-size: 1.3rem;
    }

    .section-title::after,
    .card-body h5:first-child::after,
    .product-attributes h5::after,
    .navigator-title::after,
    .related-products h3::after {
      width: 40px;
    }

    /* Mobile image gallery improvements */
    .product-image-gallery {
      margin-bottom: var(--spacing-lg);
    }

    .main-image-wrapper {
      margin-bottom: var(--spacing-md);
    }

    .thumbnail-container {
      margin-top: var(--spacing-sm);
    }

    .thumbnail-scroll-button {
      width: 28px;
      height: 28px;
    }

    .thumb-wrapper {
      width: 60px;
      height: 60px;
    }

    /* Mobile contact actions */
    .contact-actions {
      margin-top: var(--spacing-md);
    }

    .btn-chat-seller,
    .btn-whatsapp,
    .btn-call-seller {
      min-height: 52px;
      font-size: 16px;
    }

    /* Mobile safety tips */
    .safety-tips-card {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
    }

    .safety-tip {
      padding: var(--spacing-sm) 0;
    }

    .safety-tip span {
      font-size: 15px;
    }

    /* Mobile Related Products */
    .related-products {
      padding: 0.75rem;
      margin-top: 0.75rem;
    }

    .related-products h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }

    .related-product-item {
      flex: 0 0 180px;
      min-width: 180px;
    }

    .related-product-image {
      height: 140px;
    }

    .related-product-content {
      padding: 0.75rem;
    }

    .related-product-title {
      font-size: 0.85rem;
    }

    .related-product-price-current {
      font-size: 0.9rem;
    }

    .related-product-btn {
      padding: 0.5rem 0.6rem;
      font-size: 0.8rem;
    }

    /* Improve mobile product info layout */
    .product-detail-page-container {
      padding: 0.5rem !important;
    }

    /* Better mobile pricing */
    .price-section {
      text-align: center;
      margin: 1rem 0;
    }

    /* Mobile-friendly variants */
    .variant-selector button {
      min-height: 44px;
      font-size: 15px;
    }

  }

  /* Extra small devices */
  @media (max-width: 480px) {
    /* Tighter spacing for very small screens */
    .container {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }

    .card-body {
      padding: 0.5rem !important;
    }

    .contact-actions {
      gap: 0.5rem;
    }

    .thumbnail-scroll-button {
      width: 24px;
      height: 24px;
    }

    .thumb-wrapper {
      width: 50px;
      height: 50px;
    }

    /* Extra small Related Products */
    .related-products {
      padding: 0.5rem;
    }

    .related-product-item {
      flex: 0 0 160px;
      min-width: 160px;
    }

    .related-product-image {
      height: 120px;
    }

    .related-product-content {
      padding: 0.5rem;
    }

    .related-product-title {
      font-size: 0.8rem;
      margin-bottom: 0.4rem;
    }

    .related-product-price {
      margin-bottom: 0.75rem;
    }

    .related-product-price-current {
      font-size: 0.85rem;
    }

    .related-product-btn {
      padding: 0.4rem 0.5rem;
      font-size: 0.75rem;
    }

    .safety-tips-card {
      padding: var(--spacing-sm);
    }

    .safety-header h6 {
      font-size: 15px;
    }

    .safety-tip span {
      font-size: 14px;
    }
  }
`;

interface RouteParams {
  id?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Auth selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);

  const productId = useMemo(() => parseInt(id || "0", 10), [id]);

  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  // Fetch related products
  const { data: relatedProductsData } = useGetProductsQuery(
    {
      page: 1,
      limit: 4,
      category: product?.category || undefined,
    },
    {
      skip: !product?.category,
    }
  );

  const relatedProducts = relatedProductsData?.data || [];

  // Local UI state
  const [variantsSelection, setVariantsSelection] = useState<
    Record<string, string>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  // Handle tag click navigation
  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Initialize variants when product loads
  useEffect(() => {
    if (!product) return;

    try {
      setSelectedImageIndex(0); // Reset to first image

      const initial: Record<string, string> = {};
      if (product.variants && typeof product.variants === "object") {
        Object.entries(product.variants).forEach(([type, opts]) => {
          if (Array.isArray(opts) && opts.length) {
            initial[type] = opts[0];
          }
        });
      }
      setVariantsSelection(initial);
    } catch (error) {
      console.error("Error initializing product data:", error);
    }
  }, [product]);

  // Handle modal state and back button
  useEffect(() => {
    const handlePopState = () => {
      if (showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      window.history.pushState({ modalOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (showModal && gallery.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleModalPrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleModalNext();
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("keydown", handleArrowKeys);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("keydown", handleArrowKeys);
    };
  }, [showModal, modalImageIndex]);

  // Derived stock/pricing data - calculate outside of any conditions
  const price1 = useMemo(
    () => (product ? Number(product.price_1) || 0 : 0),
    [product]
  );
  const price2 = useMemo(
    () => (product ? Number(product.price_2) || 0 : 0),
    [product]
  );
  const discount = useMemo(
    () =>
      product && price2 > price1
        ? Math.round(((price2 - price1) / price2) * 100)
        : 0,
    [product, price1, price2]
  );

  const sold = useMemo(() => product?.stock?.items_sold ?? 0, [product]);
  const total = useMemo(() => product?.stock?.total_items ?? 0, [product]);
  const remaining = useMemo(() => Math.floor(Math.random() * 901) + 100, []);
  const soldPct = useMemo(
    () => (total ? Math.min(100, (sold / total) * 100) : 0),
    [total, sold]
  );
  const outOfStock = useMemo(
    () => total > 0 && remaining <= 0,
    [total, remaining]
  );

  // Handlers
  const onVariantSelect = (type: string, option: string) =>
    setVariantsSelection((prev) => ({ ...prev, [type]: option }));

  // Slider handlers
  const handleSliderPrev = () => {
    const container = document.querySelector(
      ".related-products-container"
    ) as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleSliderNext = () => {
    const container = document.querySelector(
      ".related-products-container"
    ) as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Get image URL - handle both cases (copied from working HomePage implementation)
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl) {
      // If it's already a full URL, return as is
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Extract just the filename from the imageUrl path
      const filename = imageUrl.split('/').pop() || imageUrl;
      
      // Construct URL with proper storage path structure
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8888/alsuk-backend';
      return `${baseUrl}/storage/images/${filename}`;
    }
    return "/media/svg/files/blank-image.svg";
  };

  // Get all images for gallery
  const getGalleryImages = (product: ProductModel) => {
    const images: string[] = [];
    
    // Add main feature photo
    if (product.feature_photo) {
      images.push(getImageUrl(product.feature_photo));
    }
    
    // Add additional images from rates array (product gallery)
    try {
      if (product.rates && typeof product.rates === 'string') {
        const ratesArray = JSON.parse(product.rates);
        if (Array.isArray(ratesArray)) {
          ratesArray.forEach((item: any) => {
            if (item.src) {
              images.push(getImageUrl(item.src));
            }
          });
        }
      }
    } catch (error) {
      console.warn('Error parsing product gallery images:', error);
    }
    
    // Remove duplicates and filter out invalid URLs
    const uniqueImages = Array.from(new Set(images))
      .filter(img => img && img !== "/media/svg/files/blank-image.svg");
    
    // Always have at least one image (fallback)
    return uniqueImages.length > 0 ? uniqueImages : ["/media/svg/files/blank-image.svg"];
  };

  // Gallery state
  const gallery = useMemo(() => product ? getGalleryImages(product) : [], [product]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = gallery[selectedImageIndex] || "/media/svg/files/blank-image.svg";

  // Thumbnail scroll state
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Update selected image when gallery changes
  useEffect(() => {
    if (gallery.length > 0 && selectedImageIndex >= gallery.length) {
      setSelectedImageIndex(0);
    }
  }, [gallery, selectedImageIndex]);

  // Thumbnail scroll functions
  const scrollThumbnails = (direction: 'left' | 'right') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 150; // Adjust based on thumbnail width + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, thumbnailScrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, thumbnailScrollPosition + scrollAmount);
    
    setThumbnailScrollPosition(newPosition);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  const canScrollLeft = thumbnailScrollPosition > 0;
  const canScrollRight = thumbnailContainerRef.current 
    ? thumbnailScrollPosition < (thumbnailContainerRef.current.scrollWidth - thumbnailContainerRef.current.clientWidth)
    : false;

  // Modal navigation handlers
  const handleModalOpen = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setShowModal(true);
  };

  const handleModalPrev = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const handleModalNext = () => {
    if (modalImageIndex < gallery.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  // Get current modal image with fallback
  const currentModalImage = gallery[modalImageIndex] || selectedImage;

  // Touch/swipe support for mobile modal navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && gallery.length > 1) {
      handleModalNext();
    }
    if (isRightSwipe && gallery.length > 1) {
      handleModalPrev();
    }
  };

  // Loading state
  if (isLoading || isFetching) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-loading-container text-center my-5">
          <Spinner animation="border" role="status" />
          <h4>Loading product details…</h4>
        </Container>
      </>
    );
  }

  // Error state
  if (isError) {
    let errorMessage = "Unexpected error occurred.";

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      const errorObj = error as any;
      if (errorObj.data) {
        if (typeof errorObj.data === "string") {
          errorMessage = errorObj.data;
        } else if (errorObj.data.message) {
          errorMessage = errorObj.data.message;
        } else if (errorObj.data.error) {
          errorMessage = errorObj.data.error;
        }
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.status) {
        errorMessage = `Error ${errorObj.status}: Failed to load product`;
      }
    }

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-error-container text-center my-5">
          <h4 className="mb-3" style={{ color: "var(--primary-color)" }}>
            Could not load product.
          </h4>
          <p>{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Container>
      </>
    );
  }

  // Not found state
  if (!product) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-not-found-container text-center my-5">
          <h4>Product not found.</h4>
          <Button variant="outline-primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <DynamicBreadcrumb />
      <Container className="my-0 px-2 px-md-3">
        <Row className="g-2 g-md-3">
          {/* Main Content Area - Left Side */}
          <Col lg={8} md={7}>
            {/* Product Images and Basic Info */}
            <Card className="border-0 shadow-none mb-2 mb-md-3">
              <Card.Body className="p-2 p-md-4 product-detail-page-container">
                <Row className="g-2 g-md-3">
                  {/* Product Images */}
                  <Col md={6} className="mb-2 mb-md-3">
                    <div className="product-image-gallery">
                      <div
                        className="main-image-wrapper"
                        onClick={() => handleModalOpen(selectedImageIndex)}
                      >
                        <img
                          src={selectedImage}
                          alt={product.name}
                          className="img-fluid"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/media/svg/files/blank-image.svg";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            cursor: "pointer",
                            transition:
                              "transform var(--transition-speed) var(--transition-timing)",
                          }}
                        />
                        {discount > 0 && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                      </div>

                      {/* Horizontal Scroll Thumbnails */}
                      {gallery.length > 1 && (
                        <div className="thumbnail-container">
                          <div className="thumbnail-scroll-wrapper">
                            <button
                              type="button"
                              className="thumbnail-scroll-button"
                              onClick={() => scrollThumbnails('left')}
                              disabled={!canScrollLeft}
                              aria-label="Scroll thumbnails left"
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            
                            <div 
                              className="thumbnail-row" 
                              ref={thumbnailContainerRef}
                              onScroll={(e) => setThumbnailScrollPosition(e.currentTarget.scrollLeft)}
                            >
                              {gallery.map((url, idx) => (
                                <div
                                  key={idx}
                                  className={`thumb-wrapper ${
                                    idx === selectedImageIndex ? "selected-thumb" : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedImageIndex(idx);
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt={`Thumbnail ${idx + 1}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                      cursor: "pointer",
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/media/svg/files/blank-image.svg";
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              className="thumbnail-scroll-button"
                              onClick={() => scrollThumbnails('right')}
                              disabled={!canScrollRight}
                              aria-label="Scroll thumbnails right"
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="my-2" style={{ borderColor: "lightgrey" }} />
                    {/* Share Buttons */}
                    <div className="share-buttons">
                      <span className="fw-semibold me-2">Share:</span>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-facebook"
                        title="Share on Facebook"
                      >
                        <i className="bi bi-facebook" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          window.location.href
                        )}&text=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-twitter"
                        title="Share on Twitter"
                      >
                        <i className="bi bi-twitter-x" />
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          product.name + " " + window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        title="Share on WhatsApp"
                      >
                        <i className="bi bi-whatsapp" />
                      </a>
                    </div>
                  </Col>

                  {/* Basic Product Info */}
                  <Col md={6} className="mb-2 mb-md-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="category-badge">
                        {product.category_text || "Uncategorized"}
                      </span>

                      <WishlistButton
                        productId={product.id}
                        productName={product.name}
                        variant="icon"
                        size="md"
                      />
                    </div>

                    <h1 className="product-title">{product.name}</h1>

                    {/* Product Attributes/Specifications */}
                    {Array.isArray(product.attributes_array) &&
                      product.attributes_array.length > 0 && (
                        <div className="product-attributes">
                          <h5>Specifications</h5>

                          <div className="attributes-grid">
                            {product.attributes_array.map((attr, index) => (
                              <div key={index} className="attribute-row">
                                <span className="attribute-label">
                                  {attr?.name || "Unknown"}
                                </span>
                                <span className="attribute-value">
                                  {attr?.value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Fallback: Basic Product Info when no attributes */}
                    {(!Array.isArray(product.attributes_array) ||
                      product.attributes_array.length === 0) && (
                      <div className="product-attributes">
                        <h5>Product Information</h5>

                        <div className="attributes-grid">
                          <div className="attribute-row">
                            <span className="attribute-label">Category</span>
                            <span className="attribute-value">
                              {product.category_text || "Uncategorized"}
                            </span>
                          </div>
                          <div className="attribute-row">
                            <span className="attribute-label">Product ID</span>
                            <span className="attribute-value">
                              {product.id || "N/A"}
                            </span>
                          </div>
                          {product.local_id && (
                            <div className="attribute-row">
                              <span className="attribute-label">SKU</span>
                              <span className="attribute-value">
                                {product.local_id}
                              </span>
                            </div>
                          )}
                          <div className="attribute-row">
                            <span className="attribute-label">
                              Availability
                            </span>
                            <span className="attribute-value">
                              {product.in_stock === 1
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          </div>
                          {product.has_colors === "Yes" && product.colors && (
                            <div className="attribute-row">
                              <span className="attribute-label">
                                Available Colors
                              </span>
                              <span className="attribute-value">
                                {product.colors}
                              </span>
                            </div>
                          )}
                          {product.has_sizes === "Yes" && product.sizes && (
                            <div className="attribute-row">
                              <span className="attribute-label">
                                Available Sizes
                              </span>
                              <span className="attribute-value">
                                {product.sizes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {Array.isArray(product.tags_array) &&
                      product.tags_array.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                          <div className="product-tags">
                            {product.tags_array.map((tag, index) => (
                              <span
                                key={index}
                                className="product-tag"
                                onClick={() => handleTagClick(tag)}
                                title={`Search for products with tag: ${tag}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleTagClick(tag);
                                  }
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Description Card - Below main product card */}
            <Card className="border-0 shadow-sm mt-4">
              <Card.Body className="p-4">
                <h5 className="section-title">
                  <i className="bi bi-file-text"></i>
                  Product Description
                </h5>
                {product.description ? (
                  <div
                    className="product-description-content"
                    dangerouslySetInnerHTML={{
                      __html: product.description,
                    }}
                  />
                ) : (
                  <p className="text-muted">No description available for this product.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Sidebar */}
          <Col lg={4} md={5}>
            <div className="sidebar-card">
              <div className="card-body">
                {/* Pricing */}
                <div className="pricing-section">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="current-price">
                      UGX {price1.toLocaleString()}
                    </div>
                    {price2 > price1 && (
                      <span className="old-price">
                        UGX {price2.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="savings-badge">Save {discount}%</span>
                  )}
                </div>

               

                {/* Variants Selection */}
                {product.variants &&
                  typeof product.variants === "object" &&
                  Object.keys(product.variants).length > 0 && (
                    <div className="variants-section mb-0">
                      {Object.entries(product.variants).map(([type, options]) =>
                        Array.isArray(options) && options.length > 0 ? (
                          <div key={type} className="mb-3">
                            <label className="variant-label">{type}:</label>
                            <div className="variant-options">
                              {options.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className={`variant-btn ${
                                    variantsSelection[type] === option
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => onVariantSelect(type, option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                {/* Contact Actions */}
                <div className="contact-actions">
                  <Button
                    className="btn-chat-seller"
                    disabled={chatLoading}
                    onClick={async () => {
                      console.log('Chat with Seller button clicked!');
                      console.log('Authentication state:', { isAuthenticated, currentUser });
                      
                      setChatLoading(true);
                      try {
                        // Check if user is authenticated
                        if (!isAuthenticated || !currentUser) {
                          console.log('User not authenticated, redirecting to login');
                          dispatch(showNotification({
                            type: 'error',
                            message: 'Please login to start a chat'
                          }));
                          navigate('/auth/login');
                          return;
                        }

                        // Get current user ID from Redux state
                        const currentUserId = currentUser.id?.toString();
                        if (!currentUserId) {
                          dispatch(showNotification({
                            type: 'error',
                            message: 'User ID not found. Please login again.'
                          }));
                          navigate('/auth/login');
                          return;
                        }

                        // Check if trying to chat with own product
                        if (product.user?.toString() === currentUserId) {
                          dispatch(showNotification({
                            type: 'error',
                            message: 'You cannot chat with yourself'
                          }));
                          return;
                        }

                        // Start chat
                        const response = await chatService.startChat({
                          sender_id: currentUserId,
                          receiver_id: product.user?.toString() || '',
                          product_id: product.id?.toString() || ''
                        });

                        if (response.code === 1) {
                          // Navigate to chat conversation
                          navigate(`/account/chat/${response.data.id}`, {
                            state: {
                              chatHead: response.data,
                              receiverId: product.user?.toString(),
                              senderId: currentUserId,
                            }
                          });
                        } else {
                          dispatch(showNotification({
                            type: 'error',
                            message: response.message || 'Failed to start chat'
                          }));
                        }
                      } catch (error) {
                        console.error('Error starting chat:', error);
                        dispatch(showNotification({
                          type: 'error',
                          message: 'Failed to start chat. Please try again.'
                        }));
                      } finally {
                        setChatLoading(false);
                      }
                    }}
                  >
                    {chatLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Starting chat...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-chat-dots"></i>
                        Chat with Seller
                      </>
                    )}
                  </Button>
                  <Button
                    className="btn-whatsapp"
                    onClick={() => {
                      const message = `Hi! I'm interested in this product: ${product.name} - ${window.location.href}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <i className="bi bi-whatsapp"></i>
                    WhatsApp
                  </Button>
                  <Button
                    className="btn-call-seller"
                    onClick={() => {
                      if (product.url && product.url.length > 5) {
                        window.open(`tel:${product.url}`, '_self');
                      } else {
                        alert('No phone number available for this seller');
                      }
                    }}
                  >
                    <i className="bi bi-telephone"></i>
                    Call Seller
                  </Button>
                </div>

                {/* Safety Tips */}
                <div className="safety-tips-card">
                  <div className="safety-header">
                    <i className="bi bi-shield-check"></i>
                    <h6>Stay Safe Tips</h6>
                  </div>
                  <div className="safety-content">
                    <div className="safety-tip">
                      <i className="bi bi-eye"></i>
                      <span>Meet in a public place when possible</span>
                    </div>
                    <div className="safety-tip">
                      <i className="bi bi-cash"></i>
                      <span>Inspect the product before payment</span>
                    </div>
                    <div className="safety-tip">
                      <i className="bi bi-shield"></i>
                      <span>Avoid sharing personal information</span>
                    </div>
                    <div className="safety-tip">
                      <i className="bi bi-exclamation-triangle"></i>
                      <span>Report suspicious activities</span>
                    </div>
                  </div>
                </div>

                {/* Page Navigator */}
                <div className="page-navigator mt-4">
                  <h6 className="navigator-title">
                    <i className="bi bi-list-ul"></i>
                    Quick Navigation
                  </h6>
                  <div className="navigator-links">
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => {
                        const element = document.querySelector('.product-description-content');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <i className="bi bi-file-text"></i>
                      <span>Description</span>
                    </button>
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => {
                        const element = document.querySelector('.related-products');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <i className="bi bi-grid"></i>
                      <span>Related Products</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {/* Product Details Cards */}
        <Row className="mt-4">
        </Row>

        {/* Fullscreen Image Modal */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          size="xl"
          centered
          className="fullscreen-modal"
          backdrop="static"
        >
          <Modal.Body>
            <div
              className="modal-image-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button
                className="modal-close-btn"
                onClick={handleModalClose}
                aria-label="Close modal"
              >
                ×
              </button>

              {gallery.length > 1 && (
                <>
                  <button
                    className="modal-nav-btn prev"
                    onClick={handleModalPrev}
                    disabled={modalImageIndex === 0}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="modal-nav-btn next"
                    onClick={handleModalNext}
                    disabled={modalImageIndex === gallery.length - 1}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="modal-image-wrapper">
                {currentModalImage ? (
                  <img
                    src={currentModalImage}
                    alt={`${product.name} - Image ${modalImageIndex + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      borderRadius: "0px",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/media/svg/files/blank-image.svg";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "18px",
                    }}
                  >
                    No image available
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="modal-image-counter">
                  {modalImageIndex + 1}/{gallery.length}
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </Container>

      {/* Related Products Section - Separate Card */}
      {relatedProducts.length > 0 && (
        <Container className="mt-2 mt-md-4 px-2 px-md-3">
          <div className="related-products">
            <h3>Related Products</h3>
            
            <div className="related-products-slider">
              <button
                className="slider-button prev"
                onClick={handleSliderPrev}
                type="button"
                aria-label="Previous products"
              >
                ‹
              </button>
              
              <div className="related-products-container">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="related-product-item">
                    <div className="related-product-card">
                      <div className="related-product-image">
                        <img
                          src={getImageUrl(relatedProduct.feature_photo)}
                          alt={relatedProduct.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/media/svg/files/blank-image.svg";
                          }}
                        />
                      </div>
                      
                      <div className="related-product-content">
                        <Link
                          to={`/product/${relatedProduct.id}`}
                          className="related-product-title"
                        >
                          {relatedProduct.name}
                        </Link>
                        
                        <div className="related-product-price">
                          <span className="related-product-price-current">
                            UGX {parseFloat(relatedProduct.price_2 || relatedProduct.price_1).toLocaleString()}
                          </span>
                          {relatedProduct.price_2 && parseFloat(relatedProduct.price_2) < parseFloat(relatedProduct.price_1) && (
                            <>
                              <span className="related-product-price-original">
                                UGX {parseFloat(relatedProduct.price_1).toLocaleString()}
                              </span>
                              <span className="related-product-discount">
                                -{Math.round(((parseFloat(relatedProduct.price_1) - parseFloat(relatedProduct.price_2)) / parseFloat(relatedProduct.price_1)) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="related-product-actions">
                          <button
                            className="related-product-btn related-product-btn-primary"
                            onClick={() => {
                              // Navigate to the product page to see contact options
                              navigate(`/product/${relatedProduct.id}`);
                            }}
                          >
                            Contact
                          </button>
                          <Link
                            to={`/product/${relatedProduct.id}`}
                            className="related-product-btn related-product-btn-outline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                className="slider-button next"
                onClick={handleSliderNext}
                type="button"
                aria-label="Next products"
              >
                ›
              </button>
            </div>
          </div>
        </Container>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-sticky-bottom">
        <div className="mobile-contact-actions">
          <Button
            className="mobile-btn-call"
            onClick={() => {
              if (product.url && product.url.length > 5) {
                window.open(`tel:${product.url}`, '_self');
              } else {
                alert('No phone number available for this seller');
              }
            }}
          >
            <i className="bi bi-telephone"></i>
            Call
          </Button>
          <Button
            className="mobile-btn-whatsapp"
            onClick={() => {
              const message = `Hi! I'm interested in this product: ${product.name} - ${window.location.href}`;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <i className="bi bi-whatsapp"></i>
            WhatsApp
          </Button>
          <Button
            className="mobile-btn-chat"
            disabled={chatLoading}
            onClick={async () => {
              console.log('Mobile Chat button clicked!');
              console.log('Authentication state:', { isAuthenticated, currentUser });
              
              setChatLoading(true);
              try {
                // Check if user is authenticated
                if (!isAuthenticated || !currentUser) {
                  console.log('User not authenticated, redirecting to login');
                  dispatch(showNotification({
                    type: 'error',
                    message: 'Please login to start a chat'
                  }));
                  navigate('/auth/login');
                  return;
                }

                // Get current user ID from Redux state
                const currentUserId = currentUser.id?.toString();
                if (!currentUserId) {
                  dispatch(showNotification({
                    type: 'error',
                    message: 'User ID not found. Please login again.'
                  }));
                  navigate('/auth/login');
                  return;
                }

                // Check if trying to chat with own product
                if (product.user?.toString() === currentUserId) {
                  dispatch(showNotification({
                    type: 'error',
                    message: 'You cannot chat with yourself'
                  }));
                  return;
                }

                // Start chat
                const response = await chatService.startChat({
                  sender_id: currentUserId,
                  receiver_id: product.user?.toString() || '',
                  product_id: product.id?.toString() || ''
                });

                if (response.code === 1) {
                  // Navigate to chat conversation
                  navigate(`/account/chat/${response.data.id}`, {
                    state: {
                      chatHead: response.data,
                      receiverId: product.user?.toString(),
                      senderId: currentUserId,
                    }
                  });
                } else {
                  dispatch(showNotification({
                    type: 'error',
                    message: response.message || 'Failed to start chat'
                  }));
                }
              } catch (error) {
                console.error('Error starting chat:', error);
                dispatch(showNotification({
                  type: 'error',
                  message: 'Failed to start chat. Please try again.'
                }));
              } finally {
                setChatLoading(false);
              }
            }}
          >
            {chatLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-1">Starting...</span>
              </>
            ) : (
              <>
                <i className="bi bi-chat-dots"></i>
                Chat
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
