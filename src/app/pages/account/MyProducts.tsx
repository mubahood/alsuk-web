import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyProducts.css';

interface Product {
  id: number;
  name: string;
  price_1: string;
  price_2: string;
  feature_photo: string;
  category_text: string;
  status: string;
  in_stock: string;
  url: string; // Contact phone
  supplier: string; // Address
  description: string;
  date_added: string;
}

interface LocationState {
  message?: string;
}

const MyProducts: React.FC = () => {
  // IMMEDIATE RETURN FOR TESTING - NO HOOKS OR COMPLEX LOGIC
  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
      minHeight: '100vh',
      color: 'white',
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1 style={{fontSize: '48px', marginBottom: '20px'}}>
        🎯 THIS IS THE CORRECT FRONTEND COMPONENT! 🎯
      </h1>
      <h2 style={{fontSize: '32px', marginBottom: '20px'}}>
        September 5th, 2025 - Updated at {new Date().toLocaleTimeString()}
      </h2>
      <p style={{fontSize: '20px'}}>
        If you see this colorful page, the routing is working correctly!
      </p>
      <p style={{fontSize: '18px', marginTop: '20px'}}>
        Path: /Users/mac/Desktop/github/alsuk-web/src/app/pages/account/MyProducts.tsx
      </p>
    </div>
  );
};

export default MyProducts;

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for now - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 14 Pro Max 256GB',
          price_1: '4500000',
          price_2: '5000000',
          feature_photo: '/media/products/iphone.jpg',
          category_text: 'Electronics',
          status: '1',
          in_stock: '1',
          url: '+256 700 000 000',
          supplier: 'Kampala, Uganda',
          description: 'Brand new iPhone 14 Pro Max with 256GB storage. Excellent condition with original accessories.',
          date_added: '2024-01-15'
        },
        {
          id: 2,
          name: 'MacBook Air M2 512GB',
          price_1: '6500000',
          price_2: '7000000',
          feature_photo: '/media/products/macbook.jpg',
          category_text: 'Computers',
          status: '1',
          in_stock: '0',
          url: '+256 700 000 001',
          supplier: 'Entebbe, Uganda',
          description: 'Latest MacBook Air with M2 chip and 512GB SSD. Perfect for professional work.',
          date_added: '2024-01-10'
        },
        {
          id: 3,
          name: 'Samsung Galaxy S24 Ultra',
          price_1: '4800000',
          price_2: '5200000',
          feature_photo: '/media/products/samsung.jpg',
          category_text: 'Electronics',
          status: '0',
          in_stock: '1',
          url: '+256 700 000 002',
          supplier: 'Jinja, Uganda',
          description: 'Top-of-the-line Samsung Galaxy with S Pen and 200MP camera.',
          date_added: '2024-01-12'
        },
        {
          id: 4,
          name: 'Honda Civic 2023',
          price_1: '25000000',
          price_2: '28000000',
          feature_photo: '/media/products/civic.jpg',
          category_text: 'Vehicles',
          status: '1',
          in_stock: '1',
          url: '+256 700 000 003',
          supplier: 'Mbarara, Uganda',
          description: 'Well maintained Honda Civic with low mileage and complete service history.',
          date_added: '2024-01-08'
        },
        {
          id: 5,
          name: 'Canon EOS R5 Camera',
          price_1: '12000000',
          price_2: '13500000',
          feature_photo: '/media/products/camera.jpg',
          category_text: 'Photography',
          status: '1',
          in_stock: '1',
          url: '+256 700 000 004',
          supplier: 'Kampala, Uganda',
          description: 'Professional mirrorless camera with 45MP sensor and 8K video recording.',
          date_added: '2024-01-05'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setProducts(mockProducts);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      setError('Failed to load your products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Mock delete - replace with actual API call
        setProducts(prev => prev.filter(p => p.id !== productId));
        setMessage('Product deleted successfully');
      } catch (error: any) {
        setError(error.message || 'Failed to delete product');
      }
    }
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/account/my-shop/${productId}/edit`);
  };

  const handleDuplicateProduct = async (productId: number) => {
    try {
      const originalProduct = products.find(p => p.id === productId);
      if (originalProduct) {
        const duplicatedProduct = {
          ...originalProduct,
          id: Date.now(), // Generate new ID
          name: `${originalProduct.name} (Copy)`,
          date_added: new Date().toISOString().split('T')[0]
        };
        
        setProducts(prev => [duplicatedProduct, ...prev]);
        setMessage('Product duplicated successfully');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to duplicate product');
    }
  };

  const getStatusText = (status: string) => {
    return status === '1' ? 'Active' : 'Inactive';
  };

  const getStatusClass = (status: string) => {
    return status === '1' ? 'status-active' : 'status-inactive';
  };

  const getStockText = (inStock: string) => {
    return inStock === '1' ? 'In Stock' : 'Out of Stock';
  };

  const getStockClass = (inStock: string) => {
    return inStock === '1' ? 'stock-available' : 'stock-unavailable';
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(parseInt(price));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.status === '1') ||
                         (statusFilter === 'inactive' && product.status === '0');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="header-content">
          <h1 className="products-title">My Products</h1>
          <div className="header-actions">
            <button 
              onClick={loadProducts} 
              className="refresh-btn"
              disabled={loading}
            >
              <i className="bi-arrow-clockwise"></i>
            </button>
            <button
              onClick={() => navigate('/account/my-shop/create')}
              className="add-product-btn"
            >
              <i className="bi-plus-circle"></i>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="products-filters">
          <div className="search-wrapper">
            <i className="bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-wrapper">
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="notification success">
          <i className="bi-check-circle"></i>
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="close-btn">
            <i className="bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="notification error">
          <i className="bi-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <i className="bi-x"></i>
          </button>
        </div>
      )}

      {/* Products List */}
      <div className="products-container">
        {loading ? (
          <div className="products-loading">
            <div className="spinner-border" role="status"></div>
            <p>Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            {searchQuery || statusFilter !== 'all' ? (
              <>
                <i className="bi-search"></i>
                <p>No products found</p>
                <span>Try adjusting your search or filters</span>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="clear-filters-btn">
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <i className="bi-box-seam"></i>
                <p>No products yet</p>
                <span>Start by adding your first product to AL-SUK</span>
                <button 
                  onClick={() => navigate('/account/my-shop/create')}
                  className="add-first-product-btn"
                >
                  Add Your First Product
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="products-list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-image">
                  <img 
                    src={product.feature_photo} 
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/media/products/placeholder.jpg';
                    }}
                  />
                  <div className="product-status-overlay">
                    <span className={`status-badge ${getStatusClass(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </div>
                </div>
                
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-date">{formatDate(product.date_added)}</div>
                  </div>
                  
                  <div className="product-details">
                    <div className="product-category">
                      <i className="bi-tag"></i>
                      <span>{product.category_text}</span>
                    </div>
                    
                    <div className="product-location">
                      <i className="bi-geo-alt"></i>
                      <span>{product.supplier}</span>
                    </div>
                  </div>
                  
                  <div className="product-pricing">
                    <div className="price-info">
                      <span className="current-price">{formatPrice(product.price_1)}</span>
                      {product.price_2 !== product.price_1 && (
                        <span className="original-price">{formatPrice(product.price_2)}</span>
                      )}
                    </div>
                    
                    <div className={`stock-status ${getStockClass(product.in_stock)}`}>
                      <i className={`bi-${product.in_stock === '1' ? 'check-circle' : 'x-circle'}`}></i>
                      <span>{getStockText(product.in_stock)}</span>
                    </div>
                  </div>
                  
                  <div className="product-description">
                    {product.description}
                  </div>
                </div>
                
                <div className="product-actions">
                  <button 
                    onClick={() => handleEditProduct(product.id)}
                    className="action-btn edit-btn"
                    title="Edit product"
                  >
                    <i className="bi-pencil"></i>
                  </button>
                  
                  <button 
                    onClick={() => handleDuplicateProduct(product.id)}
                    className="action-btn duplicate-btn"
                    title="Duplicate product"
                  >
                    <i className="bi-copy"></i>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="action-btn delete-btn"
                    title="Delete product"
                  >
                    <i className="bi-trash"></i>
                  </button>
                  
                  <button className="action-btn more-btn" title="More options">
                    <i className="bi-three-dots-vertical"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
