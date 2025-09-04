import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { selectIsAuthenticated } from "../../store/slices/authSlice";
import { loadWishlistFromAPI } from "../../store/slices/wishlistSlice";
import { useCart } from "../../hooks/useCart";
import { useAppCounts, useMegaMenuCategories } from "../../hooks/useManifest";
import { useManifest } from "../../hooks/useManifest";
import LiveSearchBox from "../search/LiveSearchBox";
import "./ModernMainNav.css";

const ModernMainNav: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Use manifest counts instead of individual state selectors
  const { cartCount } = useCart();
  const appCounts = useAppCounts();
  const { reloadManifest } = useManifest();
  const megaMenuCategories = useMegaMenuCategories();
  const wishlistCount = appCounts.wishlist_count;
  
  // Debug: Log mega menu categories
  useEffect(() => {
    console.log('🔍 Mega Menu Categories Debug:', {
      count: megaMenuCategories.length,
      categories: megaMenuCategories.map(cat => ({
        id: cat.id,
        name: cat.category,
        subcategoriesCount: cat.subcategories?.length || 0,
        subcategories: cat.subcategories?.map(sub => sub.category) || []
      }))
    });
  }, [megaMenuCategories]);
  
  // Auth selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const categoryRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);
  const hasNotifications = false; // This would come from notifications state

  // Handle mobile search
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
    }
  };

  // Note: Wishlist is loaded via manifest, no need for separate API call

  // Enhanced mega menu hover handling
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const categoryElement = categoryRef.current;
      const megaMenuElement = megaMenuRef.current;
      
      if (categoryElement && megaMenuElement) {
        const isOverCategory = categoryElement.contains(e.relatedTarget as Node);
        const isOverMegaMenu = megaMenuElement.contains(e.relatedTarget as Node);
        
        if (!isOverCategory && !isOverMegaMenu) {
          setMegaMenuOpen(false);
        }
      }
    };

    const categoryElement = categoryRef.current;
    const megaMenuElement = megaMenuRef.current;

    if (categoryElement) {
      categoryElement.addEventListener('mouseleave', handleMouseLeave);
    }
    if (megaMenuElement) {
      megaMenuElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (categoryElement) {
        categoryElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (megaMenuElement) {
        megaMenuElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <>
      {/* Modern Mobile Navigation Layout */}
      <div className="modern-mobile-nav d-lg-none">
        {/* Top Row: Menu Toggle + Logo + Action Icons */}
        <div className="mobile-nav-top">
          <div className="container-fluid">
            <div className="mobile-top-row">
              {/* Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                type="button"
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
              >
                <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}></i>
              </button>

              {/* Logo */}
              <Link to="/" className="mobile-logo-wrapper">
                <img
                  src="/media/logos/logo.png"
                  alt="Blitxpress"
                  className="mobile-logo"
                />
              </Link>

              {/* Action Icons */}
              <div className="mobile-action-icons">
                <Link to="/products" className="mobile-action-link">
                  <div className="mobile-action-icon-wrapper">
                    <i className="bi bi-shop"></i>
                  </div>
                </Link>
                {isAuthenticated ? (
                  <Link to="/account" className="mobile-action-link">
                    <div className="mobile-action-icon-wrapper">
                      <i className="bi bi-person"></i>
                      {hasNotifications && <span className="mobile-notification-dot"></span>}
                    </div>
                  </Link>
                ) : (
                  <Link to="/auth/login" className="mobile-action-link">
                    <div className="mobile-action-icon-wrapper">
                      <i className="bi bi-box-arrow-in-right"></i>
                    </div>
                  </Link>
                )}
                <Link to="/cart" className="mobile-action-link">
                  <div className="mobile-action-icon-wrapper">
                    <i className="bi bi-bag"></i>
                    {cartCount > 0 && (
                      <span className="mobile-cart-badge">{cartCount}</span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Live Search */}
        <div className="mobile-nav-bottom">
          <div className="container-fluid">
            <div className="mobile-search-wrapper">
              <form className="mobile-search-form" role="search" onSubmit={handleMobileSearch}>
                <div className="mobile-search-input-group">
                  <input
                    type="search"
                    className="mobile-search-input"
                    placeholder="Search for products, brands, categories..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    aria-label="Search"
                  />
                  <button className="mobile-search-btn" type="submit" aria-label="Search">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Fallback: Try LiveSearchBox as well */}
            <div style={{ display: 'none' }}>
              <LiveSearchBox 
                placeholder="Search for products, brands, categories..."
                className="mobile-search-box"
                size="sm"
                showRecentSearches={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="main-nav-wrapper d-none d-lg-block">
        <nav className="container d-flex align-items-center h-100">
          {/* Desktop Logo */}
          <Link to="/" className="logo-wrapper me-4">
            <img
              src="/media/logos/logo.png"
              alt="Blitxpress"
              className="main-logo"
            />
          </Link>

          {/* Enhanced Category Mega Menu */}
          <div 
            ref={categoryRef}
            className={`category-toggle  ${isMegaMenuOpen ? 'active' : ''}`}
            onMouseEnter={() => setMegaMenuOpen(true)}
          >
            <div className="category-toggle-content">
              <i className="bi bi-grid-3x3-gap-fill category-icon"></i>
              <span className="category-text">Categories</span>
              <i className="bi bi-chevron-down chevron-icon"></i>
            </div>
            
            {/* Enhanced Mega Menu */}
            <div 
              ref={megaMenuRef}
              className={`mega-menu m-0 ${isMegaMenuOpen ? 'show' : ''}`}
              onMouseEnter={() => setMegaMenuOpen(true)}
            >
              <div className="mega-menu-content">
           
                <div className="row g-4">
                  {megaMenuCategories.length > 0 ? (
                    megaMenuCategories.map((mainCategory, index) => (
                      <div key={mainCategory.id} className="col-md-4">
                        <div className="mega-menu-section">
                          <h5 className="mega-menu-heading">
                            <i className={`${mainCategory.icon || 'bi-grid-3x3-gap'} category-section-icon`}></i>
                            {mainCategory.category}
                          </h5>
                          <div className="mega-menu-links">
                            {mainCategory.subcategories && mainCategory.subcategories.length > 0 ? (
                              mainCategory.subcategories.map((subCategory) => (
                                <Link 
                                  key={subCategory.id}
                                  to={`/products?category=${subCategory.id}`} 
                                  className="mega-menu-link"
                                  onClick={() => setMegaMenuOpen(false)}
                                >
                                  <i className={`${subCategory.icon || 'bi-circle'} link-icon`}></i> 
                                  <span>{subCategory.category}</span>
                                  <span className="item-count">{subCategory.category_text || 0}+</span>
                                </Link>
                              ))
                            ) : (
                              <div className="mega-menu-link text-muted">
                                <i className="bi-info-circle link-icon"></i> 
                                <span>No subcategories found for {mainCategory.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="mega-menu-section">
                        <p className="text-muted">Loading categories...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Featured Categories Banner */}
                <div className="mega-menu-banner mt-4 pt-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="featured-category-card">
                        <div className="featured-content">
                          <div className="featured-icon">
                            <i className="bi bi-lightning-charge"></i>
                          </div>
                          <div className="featured-text">
                            <h6>Flash Sales</h6>
                            <p>Up to 70% off selected items</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="featured-category-card">
                        <div className="featured-content">
                          <div className="featured-icon featured-icon-secondary">
                            <i className="bi bi-truck"></i>
                          </div>
                          <div className="featured-text">
                            <h6>Free Delivery</h6>
                            <p>Fast delivery to your location</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced Live Search */}
          <div className="search-form flex-grow-1 position-relative">
            <LiveSearchBox 
              placeholder="Search for products, brands, categories..."
              className="desktop-search-box"
              showRecentSearches={true}
            />
          </div>

          {/* Enhanced Action Icons */}
          <div className="action-icons">
            <Link to="/products" className="action-link">
              <div className="action-icon-wrapper">
                <i className="bi bi-shop action-icon"></i>
              </div>
              <div className="action-text">Shop</div>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/account" className="action-link">
                  <div className="action-icon-wrapper">
                    <i className="bi bi-person action-icon"></i>
                    {hasNotifications && <span className="notification-dot"></span>}
                  </div>
                  <div className="action-text">
                    Account
                  </div>
                </Link>
                <Link to="account/wishlist" className="action-link">
                  <div className="action-icon-wrapper">
                    <i className="bi bi-heart action-icon"></i>
                    {wishlistCount > 0 && (
                      <span className="cart-badge">{wishlistCount}</span>
                    )}
                  </div>
                  <div className="action-text">Wishlist</div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="action-link">
                  <div className="action-icon-wrapper">
                    <i className="bi bi-box-arrow-in-right action-icon"></i>
                  </div>
                  <div className="action-text">Login</div>
                </Link>
                <Link to="/auth/register" className="action-link">
                  <div className="action-icon-wrapper">
                    <i className="bi bi-person-plus action-icon"></i>
                  </div>
                  <div className="action-text">Sign Up</div>
                </Link>
              </>
            )}
            
            <Link to="/cart" className="action-link">
              <div className="action-icon-wrapper">
                <i className="bi bi-bag action-icon"></i>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>
              <div className="action-text">Cart</div>
            </Link>
          </div>
        </nav>
      </div>

      {/* Enhanced Mobile Off-Canvas Menu */}
      <div
        className={`nav-overlay ${isMenuOpen ? "show" : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`mobile-nav-offcanvas ${isMenuOpen ? "show" : ""}`}>
        <div className="offcanvas-header">
          <div className="offcanvas-logo">
            <img src="/media/logos/logo.png" alt="Blitxpress" className="mobile-offcanvas-logo" />
          </div>
          <button 
            className="offcanvas-close-btn"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="offcanvas-body">
          {/* Mobile Navigation Links */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Categories</h6>
            <ul className="nav-links">
              <li>
                <a href="/category/electronics">
                  <i className="bi bi-cpu"></i>
                  <span>Electronics</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </li>
              <li>
                <a href="/category/fashion">
                  <i className="bi bi-bag-heart"></i>
                  <span>Fashion</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </li>
              <li>
                <a href="/category/home-garden">
                  <i className="bi bi-house-door"></i>
                  <span>Home & Garden</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </li>
              <li>
                <a href="/category/sports">
                  <i className="bi bi-trophy"></i>
                  <span>Sports & Outdoors</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </li>
              <li>
                <a href="/category/books">
                  <i className="bi bi-book"></i>
                  <span>Books & Media</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </div>

          {/* Mobile Account Actions */}
          {isAuthenticated ? (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">
                Welcome back!
              </h6>
              <ul className="nav-links">
                <li>
                  <Link to="/account" onClick={toggleMenu}>
                    <i className="bi bi-person"></i>
                    <span>My Account</span>
                    {hasNotifications && <span className="mobile-notification-dot"></span>}
                  </Link>
                </li>
                <li>
                  <Link to="/account/orders" onClick={toggleMenu}>
                    <i className="bi bi-box-seam"></i>
                    <span>My Orders</span>
                  </Link>
                </li>
                <li>
                  <Link to="/account/wishlist"  onClick={toggleMenu}>
                    <i className="bi bi-heart"></i>
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-cart-badge">{wishlistCount}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link to="/account/addresses" onClick={toggleMenu}>
                    <i className="bi bi-geo-alt"></i>
                    <span>Addresses</span>
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-heading">Account</h6>
              <ul className="nav-links">
                <li>
                  <Link to="/auth/login" onClick={toggleMenu}>
                    <i className="bi bi-box-arrow-in-right text-primary"></i>
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" onClick={toggleMenu}>
                    <i className="bi bi-person-plus text-success"></i>
                    <span>Create Account</span>
                  </Link>
                </li>
                <li>
                  <Link to="/account/wishlist"  onClick={toggleMenu}>
                    <i className="bi bi-heart"></i>
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-cart-badge">{wishlistCount}</span>
                    )}
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Quick Links */}
          <div className="mobile-nav-section">
            <h6 className="mobile-nav-heading">Quick Links</h6>
            <ul className="nav-links">
              <li>
                <Link to="/products" onClick={toggleMenu}>
                  <i className="bi bi-shop text-primary"></i>
                  <span>Shop All Products</span>
                </Link>
              </li>
              <li>
                <a href="/deals">
                  <i className="bi bi-lightning-charge text-warning"></i>
                  <span>Today's Deals</span>
                </a>
              </li>
              <li>
                <a href="/new-arrivals">
                  <i className="bi bi-star text-info"></i>
                  <span>New Arrivals</span>
                </a>
              </li>
              <li>
                <a href="/customer-service">
                  <i className="bi bi-headset"></i>
                  <span>Customer Service</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernMainNav;
