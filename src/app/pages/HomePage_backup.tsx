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
    gap: 8px;
  }

  .categories-sidebar {
    width: 280px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    padding: 0;
    height: fit-content;
    position: sticky;
    top: 80px;
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
    font-size: 11px;
    background: rgba(108, 117, 125, 0.1);
    padding: 2px 6px;
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
    overflow: hidden;
  }

  .products-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    padding: 16px;
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
    padding: 4px 8px;
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
    box-shadow: 0 0 0 3px rgba(247, 94, 30, 0.1);
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
    padding: 2px 4px;
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
    box-shadow: 0 2px 8px rgba(17, 71, 134, 0.3);
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
    height: 200px;
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
    padding: 40px 16px;
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
  @media (max-width: 991px) {
    .homepage-content {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .categories-sidebar {
      display: none;
    }

    .products-section {
      flex: 1;
      margin-left: 0;
    }

    .products-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
    }

    .header-controls {
      width: 100%;
      justify-content: flex-end;
    }

    .sort-select {
      min-width: 140px;
    }

    .products-title {
      font-size: 18px;
    }
  }

  @media (max-width: 575px) {
    .homepage-content {
      padding: 8px;
    }

    .products-header {
      padding: 12px;
    }

    .products-title {
      font-size: 16px;
    }

    .header-controls {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }

    .sort-controls {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      width: 100%;
    }

    .sort-select {
      width: 100%;
      min-width: none;
    }

    .products-list {
      padding: 12px;
    }

    .product-list-item {
      padding: 16px 12px;
      gap: 16px;
    }

    .product-image-container {
      width: 110px;
      height: 110px;
      flex-shrink: 0;
    }

    .product-title {
      font-size: 14px;
      margin-bottom: 6px;
    }

    .product-price {
      font-size: 16px;
      margin-bottom: 4px;
    }

    .product-meta {
      gap: 6px;
    }

    .product-meta span {
      font-size: 11px;
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
        
        {/* Product Meta Information */}
        <div className="product-meta-info">
          {product.category_name && (
            <span className="product-category">{product.category_name}</span>
          )}
          <span className="product-date">{formatDate(product.created_at)}</span>
        </div>
      </div>
      
      {/* Side Actions */}
      <div className="product-side-actions">
        <button className="wishlist-btn" title="Add to wishlist">
          <i className="fas fa-heart"></i>
        </button>
        
        <span className={`stock-status ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL params
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get("category") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialQuery = searchParams.get("query") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialSort = searchParams.get("sort") || "created_at:desc";

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  
  // Categories state
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string>("");

  // Products query
  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
    refetch: refetchProducts
  } = useGetProductsQuery({
    page: currentPage,
    per_page: 20,
    category: selectedCategory,
    location: selectedLocation,
    search: searchQuery,
    sort: sortBy
  });

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await ApiService.get("/manifest/categories");
        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.warn("Categories data format unexpected:", response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategoriesError("Failed to load categories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedLocation) params.set("location", selectedLocation);
    if (searchQuery) params.set("query", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortBy !== "created_at:desc") params.set("sort", sortBy);

    const newSearch = params.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    if (newPath !== location.pathname + location.search) {
      navigate(newPath, { replace: true });
    }
  }, [selectedCategory, selectedLocation, searchQuery, currentPage, sortBy, navigate, location.pathname, location.search]);

  // Handle filter changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Prepare data for rendering
  const products = productsData?.data || [];
  const totalPages = productsData?.last_page || 1;
  const currentPageData = productsData?.current_page || 1;
  const totalProducts = productsData?.total || 0;

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const startPage = Math.max(1, currentPageData - 2);
    const endPage = Math.min(totalPages, currentPageData + 2);

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPageData}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section-wrapper">
        <HeroSection />
      </div>

      {/* Main Content */}
      <div className="homepage-content">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Categories</h2>
            <span className="categories-count-badge">
              {categories.length} total
            </span>
          </div>
          
          <ul className="category-list">
            {/* All Categories Option */}
            <li className="category-item">
              <button
                className={`category-link ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategoryChange("")}
              >
                <span className="category-name">All Categories</span>
                <span className="category-count">{totalProducts}</span>
              </button>
            </li>

            {/* Loading State */}
            {categoriesLoading && (
              <li className="category-item loading">
                <div className="loading-state">
                  <div className="loading-spinner-small"></div>
                  <span>Loading categories...</span>
                </div>
              </li>
            )}

            {/* Error State */}
            {categoriesError && (
              <li className="category-item error">
                <div className="error-state">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{categoriesError}</span>
                </div>
              </li>
            )}

            {/* Categories List */}
            {!categoriesLoading && !categoriesError && categories.map((category) => (
              <li key={category.id} className="category-item">
                <button
                  className={`category-link ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id.toString())}
                >
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.products_count || 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Section */}
        <div className="products-section">
          {/* Products Header */}
          <div className="products-header">
            <div className="header-content">
              <h1 className="products-title">
                {selectedCategory ? 
                  categories.find(cat => cat.id.toString() === selectedCategory)?.name || "Category" 
                  : "All Products"
                }
              </h1>
              <div className="products-meta">
                <span className="products-count">
                  {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
            
            <div className="header-controls">
              <div className="sort-controls">
                <label className="sort-label">Sort by:</label>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="created_at:desc">Newest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="price_1:asc">Price: Low to High</option>
                  <option value="price_1:desc">Price: High to Low</option>
                  <option value="name:asc">Name: A to Z</option>
                  <option value="name:desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="products-list">
            {/* Loading State */}
            {isProductsLoading && (
              <div className="loading-spinner">
                <Spinner animation="border" />
              </div>
            )}

            {/* Error State */}
            {productsError && (
              <Alert variant="danger" className="error-alert">
                <div className="error-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="error-content">
                  <h5>Error Loading Products</h5>
                  <p>We couldn't load the products. Please try again later.</p>
                </div>
              </Alert>
            )}

            {/* No Products */}
            {!isProductsLoading && !productsError && products.length === 0 && (
              <div className="no-products">
                <h4>No Products Found</h4>
                <p>Try adjusting your search criteria or browse all categories.</p>
              </div>
            )}

            {/* Products List */}
            {!isProductsLoading && !productsError && products.length > 0 && (
              <>
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {!isProductsLoading && !productsError && totalPages > 1 && (
            <div className="pagination-container">
              <Pagination className="custom-pagination">
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPageData === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPageData - 1)}
                  disabled={currentPageData === 1}
                />
                
                {generatePaginationItems()}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPageData + 1)}
                  disabled={currentPageData === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPageData === totalPages}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
