// src/app/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Alert, Container, Row, Col, Form, Pagination, Spinner, Card } from "react-bootstrap";
import { useGetProductsQuery } from "../services/realProductsApi";
import ProductCard from "../components/shared/ProductCard";
import ToastService from "../services/ToastService";
import { ProductModel } from "../models/ProductModel";
import CategoryModel from "../models/CategoryModel";
import ApiService from "../services/ApiService";
import HeroSection from "../components/HomePage/HeroSection";

// Optimized styles for professional boxed UI with minimal spacing
const homePageStyles = `
  .homepage-container {
    background: #f8f9fa;
    min-height: 100vh;
    padding: 0;
  }

  .hero-section-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px;
    margin-bottom: 8px;
  }

  .homepage-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px;
    display: flex;
    gap: 12px;
  }

  .categories-sidebar {
    width: 280px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    padding: 0;
    height: fit-content;
    position: sticky;
    top: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .sidebar-header {
    background: #ffffff;
    border-bottom: 1px solid #e9ecef;
    padding: 12px 16px;
    color: #333333;
  }

  .sidebar-title {
    font-size: 15px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 4px 0;
  }

  .categories-count-badge {
    font-size: 11px;
    background: #f8f9fa;
    color: #6c757d;
    padding: 2px 6px;
    display: inline-block;
    font-weight: 500;
  }

  .category-list {
    list-style: none;
    padding: 6px;
    margin: 0;
  }

  .category-item {
    margin-bottom: 1px;
  }

  .category-item.loading,
  .category-item.error {
    margin-bottom: 6px;
  }

  .category-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    color: #4a5568;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .category-link:hover {
    background: #f8f9fa;
    color: #F75E1E;
    text-decoration: none;
  }

  .category-link.active {
    background: #F75E1E;
    color: #ffffff;
  }

  .category-name {
    flex: 1;
    font-weight: 500;
  }

  .category-count {
    font-size: 10px;
    background: rgba(108, 117, 125, 0.1);
    padding: 2px 5px;
    color: #6c757d;
    font-weight: 600;
    min-width: 18px;
    text-align: center;
  }

  .category-link.active .category-count {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .loading-state,
  .error-state {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    color: #6c757d;
    font-size: 12px;
    background: #f8f9fa;
  }

  .loading-spinner-small {
    width: 12px;
    height: 12px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #F75E1E;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .error-state {
    background: #fff5f5;
    color: #e53e3e;
    border: 1px solid #fed7d7;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .products-section {
    flex: 1;
    background: #ffffff;
    border: 1px solid #e9ecef;
    padding: 0;
    min-width: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .products-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    padding: 16px 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .header-content {
    flex: 1;
  }

  .products-title {
    font-size: 20px;
    font-weight: 700;
    color: #114786;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .products-title::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 20px;
    background: linear-gradient(135deg, #F75E1E, #ff7a3a);
  }

  .products-meta {
    margin: 0;
  }

  .products-count {
    font-size: 13px;
    color: #6c757d;
    font-weight: 500;
    background: #f8f9fa;
    padding: 4px 10px;
    border: 1px solid #e9ecef;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sort-label {
    font-size: 13px;
    color: #6c757d;
    font-weight: 600;
    margin: 0;
  }

  .sort-select {
    font-size: 13px;
    border: 2px solid #e9ecef;
    padding: 8px 12px;
    background: #ffffff;
    color: #114786;
    min-width: 160px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .sort-select:focus {
    border-color: #F75E1E;
    outline: none;
    box-shadow: 0 0 0 2px rgba(247, 94, 30, 0.1);
  }

  .sort-select:hover {
    border-color: #F75E1E;
  }

  .products-list {
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-top: 0;
  }
  
  .product-list-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  .product-list-item:hover {
    background: #fafafa;
    border-bottom-color: #F75E1E;
    text-decoration: none;
    color: inherit;
  }

  .product-list-item:last-child {
    border-bottom: none;
  }

  .product-image-container {
    width: 90px;
    height: 90px;
    flex-shrink: 0;
    background: #f8f9fa;
    overflow: hidden;
    position: relative;
  }

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-main-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .product-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price-section {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 3px 0;
  }

  .product-price {
    font-size: 18px;
    font-weight: 700;
    color: #114786;
    margin: 0;
  }

  .product-old-price {
    font-size: 13px;
    color: #999;
    text-decoration: line-through;
    margin: 0;
  }

  .discount-percent {
    font-size: 10px;
    background: #ff4757;
    color: #ffffff;
    padding: 1px 4px;
    font-weight: 600;
  }

  .product-meta-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .product-category {
    font-size: 11px;
    color: #6c757d;
    background: #f8f9fa;
    padding: 3px 6px;
    font-weight: 500;
  }

  .product-date {
    font-size: 11px;
    color: #adb5bd;
    margin: 0;
  }

  .product-side-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }

  .wishlist-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
  }

  .wishlist-btn:hover {
    background: #f8f9fa;
    color: #F75E1E;
  }

  .wishlist-btn.active {
    background: #F75E1E;
    color: #ffffff;
  }

  .stock-status {
    font-size: 10px;
    padding: 3px 6px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .stock-in {
    background: #d4edda;
    color: #155724;
  }

  .stock-out {
    background: #f8d7da;
    color: #721c24;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 16px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
  }

  /* AL-SUK Themed Pagination */
  .pagination-container .pagination {
    --bs-pagination-color: #114786;
    --bs-pagination-bg: #ffffff;
    --bs-pagination-border-color: #dee2e6;
    --bs-pagination-hover-color: #ffffff;
    --bs-pagination-hover-bg: #F75E1E;
    --bs-pagination-hover-border-color: #F75E1E;
    --bs-pagination-focus-color: #ffffff;
    --bs-pagination-focus-bg: #F75E1E;
    --bs-pagination-focus-border-color: #F75E1E;
    --bs-pagination-active-color: #ffffff;
    --bs-pagination-active-bg: #114786;
    --bs-pagination-active-border-color: #114786;
    --bs-pagination-disabled-color: #6c757d;
    --bs-pagination-disabled-bg: #ffffff;
    --bs-pagination-disabled-border-color: #dee2e6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .pagination-container .pagination .page-item .page-link {
    margin: 0 1px;
    border: 1px solid #dee2e6;
    color: #114786;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .pagination-container .pagination .page-item:hover .page-link {
    background-color: #F75E1E;
    border-color: #F75E1E;
    color: #ffffff;
    transform: translateY(-1px);
  }

  .pagination-container .pagination .page-item.active .page-link {
    background-color: #114786;
    border-color: #114786;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(17, 71, 134, 0.3);
  }

  .pagination-container .pagination .page-item.disabled .page-link {
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;
    cursor: not-allowed;
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 150px;
    gap: 12px;
  }

  .loading-spinner .spinner-border {
    color: #F75E1E;
    width: 2.5rem;
    height: 2.5rem;
  }

  .loading-spinner::after {
    content: 'Loading products...';
    color: #114786;
    font-size: 13px;
    font-weight: 500;
  }

  .no-products {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f8f9ff 0%, #fff8f6 100%);
    border: 1px solid rgba(17, 71, 134, 0.1);
  }

  .no-products h4 {
    color: #114786;
    font-weight: 700;
    margin-bottom: 8px;
    font-size: 18px;
  }

  .no-products p {
    color: #6c757d;
    margin: 0;
    font-size: 13px;
  }

  .error-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #fff5f5 0%, #fef7f7 100%);
    border: 1px solid rgba(220, 53, 69, 0.2);
    margin: 16px 0;
  }

  .error-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .error-content h5 {
    color: #dc3545;
    font-weight: 600;
    margin: 0 0 3px 0;
    font-size: 15px;
  }

  .error-content p {
    color: #dc3545;
    margin: 0;
    font-size: 13px;
  }

  /* Responsive Design */
  @media (max-width: 991.98px) {
    .homepage-content {
      gap: 8px;
    }
    
    .categories-sidebar {
      width: 250px;
    }
    
    .products-header {
      padding: 12px 16px;
      gap: 12px;
    }
    
    .products-title {
      font-size: 18px;
    }
    
    .products-title::before {
      width: 2px;
      height: 18px;
    }
  }

  @media (max-width: 767.98px) {
    .homepage-content {
      flex-direction: column;
      gap: 8px;
      padding: 6px;
    }
    
    .hero-section-wrapper {
      padding: 6px;
      margin-bottom: 6px;
    }
    
    .categories-sidebar {
      width: 100%;
      position: static;
      order: 2;
    }
    
    .products-section {
      order: 1;
    }
    
    .products-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
    }
    
    .sort-controls {
      width: 100%;
      justify-content: space-between;
    }
    
    .sort-select {
      min-width: 140px;
    }
    
    .product-image-container {
      width: 80px;
      height: 80px;
    }
    
    .product-title {
      font-size: 14px;
    }
    
    .product-price {
      font-size: 16px;
    }
    
    .product-category {
      font-size: 10px;
      padding: 2px 4px;
    }
    
    .product-date {
      font-size: 10px;
    }
  }

  @media (max-width: 575.98px) {
    .homepage-content {
      padding: 4px;
    }
    
    .hero-section-wrapper {
      padding: 4px;
    }
    
    .sidebar-header {
      padding: 10px 12px;
    }
    
    .sidebar-title {
      font-size: 14px;
    }
    
    .category-list {
      padding: 4px;
    }
    
    .category-link {
      padding: 6px 10px;
      font-size: 12px;
    }
    
    .products-header {
      padding: 10px;
    }
    
    .products-title {
      font-size: 16px;
    }
    
    .products-list {
      padding: 12px;
    }
    
    .product-list-item {
      padding: 10px 0;
      gap: 10px;
    }
    
    .product-image-container {
      width: 70px;
      height: 70px;
    }
    
    .product-title {
      font-size: 13px;
    }
    
    .product-price {
      font-size: 15px;
    }
    
    .wishlist-btn {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
    
    .pagination-container {
      padding: 12px;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "homepage-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = homePageStyles;
    document.head.appendChild(styleElement);
  }
}

// Simple ProductListItem component for list view with rich information display
const ProductListItem: React.FC<{ product: ProductModel }> = ({ product }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Convert string prices to numbers for calculations
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
  const discountPercent = price2 > price1 
    ? Math.round(((price2 - price1) / price2) * 100)
    : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short' 
      });
    } catch {
      return '';
    }
  };

  // Get image URL - handle both cases
  const getImageUrl = (product: any) => {
    if (product.feature_photo) {
      // If it's already a full URL, return as is
      if (product.feature_photo.startsWith('http')) {
        return product.feature_photo;
      }
      
      // Extract just the filename from the feature_photo path
      const filename = product.feature_photo.split('/').pop() || product.feature_photo;
      
      // Construct URL with proper storage path structure
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8888/alsuk-backend';
      return `${baseUrl}/storage/images/${filename}`;
    }
    return "/media/svg/files/blank-image.svg";
  };

  return (
    <div className="product-list-item" onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* Product Image */}
      <div className="product-image-container">
        <img 
          src={getImageUrl(product)} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.src = "/media/svg/files/blank-image.svg";
          }}
        />
      </div>
      
      {/* Main Product Information */}
      <div className="product-main-info">
        <h3 className="product-title">{product.name}</h3>
        
        {/* Price Section */}
        <div className="product-price-section">
          <div className="product-price">UGX {price1.toLocaleString()}</div>
          {price2 > price1 && (
            <>
              <div className="product-old-price">UGX {price2.toLocaleString()}</div>
              {discountPercent > 0 && (
                <span className="discount-percent">-{discountPercent}%</span>
              )}
            </>
          )}
        </div>
        
        {/* Meta Information */}
        <div className="product-meta-info">
          <span className="product-category">{product.category_text}</span>
          <div className="product-date">Listed {formatDate(product.date_added)}</div>
        </div>
      </div>
      
      {/* Side Actions */}
      <div className="product-side-actions">
        <button 
          className="wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            // Handle wishlist logic here
          }}
          title="Add to wishlist"
        >
          ♡
        </button>
        
        <span className={`stock-status ${product.in_stock ? 'stock-in' : 'stock-out'}`}>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

interface LocationState {
  orderSuccess?: boolean;
  orderId?: number;
  paymentUrl?: string;
}

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_created");
  const [sortOrder, setSortOrder] = useState("desc");

  // State for categories
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Get selected category name for display
  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)?.category || "Category"
    : null;

  // Update URL when category changes
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page
    
    // Update URL
    const searchParams = new URLSearchParams(location.search);
    if (categoryId) {
      searchParams.set('category', categoryId.toString());
      const categoryName = categories.find(cat => cat.id === categoryId)?.category;
      if (categoryName) {
        searchParams.set('category_name', encodeURIComponent(categoryName));
      }
    } else {
      searchParams.delete('category');
      searchParams.delete('category_name');
    }
    searchParams.set('page', '1');
    
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  // Initialize category and search from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      const categoryId = parseInt(categoryParam);
      if (!isNaN(categoryId)) {
        setSelectedCategory(categoryId);
      }
    }
    
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [location.search]);

  // Fetch categories on component mount with debouncing
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      // Prevent duplicate calls
      if (categoriesLoading) return;
      
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        
        // Add a small delay to prevent rapid requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        const fetchedCategories = await ApiService.getCategories();
        
        if (isMounted) {
          setCategories(fetchedCategories);
          console.log('✅ Categories loaded:', fetchedCategories.length, 'items');
        }
      } catch (error: any) {
        if (isMounted) {
          console.error('❌ Categories error:', error.message);
          setCategoriesError(error.message || 'Failed to load categories');
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Get products with current filters
  const { 
    data: productsResponse, 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetProductsQuery({
    page: currentPage,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    limit: 24,
    in_stock: true
  });

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (newSortBy: string) => {
    const [sortField, order] = newSortBy.split('_');
    setSortBy(sortField);
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!productsResponse || productsResponse.last_page <= 1) return null;

    const items = [];
    const currentPageNum = productsResponse.current_page;
    const lastPage = productsResponse.last_page;
    
    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPageNum === 1}
        onClick={() => handlePageChange(currentPageNum - 1)}
      />
    );

    // Page numbers (show max 5 pages around current)
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(lastPage, currentPageNum + 2);

    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPageNum}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item key={lastPage} onClick={() => handlePageChange(lastPage)}>
          {lastPage}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPageNum === lastPage}
        onClick={() => handlePageChange(currentPageNum + 1)}
      />
    );

    return (
      <div className="pagination-container">
        <Pagination className="custom-pagination mb-0">
          {items}
        </Pagination>
      </div>
    );
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <HeroSection />
      
      <div className="homepage-content">
        {/* Clean Categories Sidebar */}
        <div className="categories-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Categories</h3>
            <div className="categories-count-badge">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </div>
          </div>
          
          <ul className="category-list">
            <li className="category-item">
              <a
                href="#"
                className={`category-link ${selectedCategory === null ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryChange(null);
                }}
              >
                <span className="category-name">All Products</span>
                <span className="category-count">{productsResponse?.total || 0}</span>
              </a>
            </li>
            
            {categoriesLoading ? (
              <li className="category-item loading">
                <div className="loading-state">
                  <div className="loading-spinner-small"></div>
                  <span>Loading categories...</span>
                </div>
              </li>
            ) : categoriesError ? (
              <>
                <li className="category-item error">
                  <div className="error-state">
                    <span>Using default categories</span>
                  </div>
                </li>
                {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Automotive'].map((cat, index) => (
                  <li key={`default-${index}`} className="category-item">
                    <a
                      href="#"
                      className="category-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryChange(null);
                      }}
                    >
                      <span className="category-name">{cat}</span>
                      <span className="category-count">0</span>
                    </a>
                  </li>
                ))}
              </>
            ) : (
              categories.map((category: CategoryModel) => (
                <li key={category.id} className="category-item">
                  <a
                    href="#"
                    className={`category-link ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryChange(category.id);
                    }}
                  >
                    <span className="category-name">{category.category}</span>
                    <span className="category-count">{Math.floor(Math.random() * 50) + 5}</span>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Products Section */}
        <div className="products-section p-0">
          <div className="products-header">
            <div className="header-content">
              <h2 className="products-title">
                {selectedCategoryName ? `${selectedCategoryName} Products` : 'Latest Products'}
              </h2>
              <div className="products-meta">
                {productsResponse && (
                  <span className="products-count">
                    Showing {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, productsResponse.total)} of {productsResponse.total} products
                  </span>
                )}
              </div>
            </div>
            
            <div className="header-controls">
              <div className="sort-controls">
                <label className="sort-label">Sort by:</label>
                <select 
                  className="sort-select"
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="date_created_desc">Newest First</option>
                  <option value="date_created_asc">Oldest First</option>
                  <option value="price_1_asc">Price: Low to High</option>
                  <option value="price_1_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products List */}
          {productsLoading ? (
            <div className="loading-spinner">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : productsError ? (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h5>Unable to load products</h5>
                <p>Please check your connection and try again.</p>
              </div>
            </div>
          ) : !productsResponse || productsResponse.data.length === 0 ? (
            <div className="no-products">
              <h4>No products found</h4>
              <p>Try adjusting your search or browse different categories.</p>
            </div>
          ) : (
            <>
              <div className="products-list ">
                {productsResponse.data.map((product: ProductModel) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsResponse && productsResponse.last_page > 1 && (
                <div className="pagination-container ">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    
                    {[...Array(Math.min(5, productsResponse.last_page))].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    {productsResponse.last_page > 5 && currentPage < productsResponse.last_page - 2 && (
                      <>
                        <Pagination.Ellipsis />
                        <Pagination.Item onClick={() => handlePageChange(productsResponse.last_page)}>
                          {productsResponse.last_page}
                        </Pagination.Item>
                      </>
                    )}
                    
                    <Pagination.Next
                      disabled={currentPage === productsResponse.last_page}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;