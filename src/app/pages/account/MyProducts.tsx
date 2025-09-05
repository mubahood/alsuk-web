import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
    
    // Check for success message from location state
    const state = location.state as LocationState;
    if (state?.message) {
      setMessage(state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for now - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 14 Pro Max',
          price_1: '4500000',
          price_2: '5000000',
          feature_photo: 'iphone.jpg',
          category_text: 'Electronics',
          status: '1',
          in_stock: '1',
          url: '+256 700 000 000',
          supplier: 'Kampala, Uganda',
          description: 'Brand new iPhone 14 Pro Max with 256GB storage',
          date_added: '2024-01-15'
        },
        {
          id: 2,
          name: 'MacBook Air M2',
          price_1: '6500000',
          price_2: '7000000',
          feature_photo: 'macbook.jpg',
          category_text: 'Computers',
          status: '1',
          in_stock: '0',
          url: '+256 700 000 001',
          supplier: 'Entebbe, Uganda',
          description: 'Latest MacBook Air with M2 chip and 512GB SSD',
          date_added: '2024-01-10'
        }
      ];

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

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'UGX 0';
    return `UGX ${numPrice.toLocaleString()}`;
  };

  const getImageUrl = (product: Product): string => {
    if (product.feature_photo && product.feature_photo !== 'no_image.jpg') {
      return `/storage/images/${product.feature_photo}`;
    }
    return '/images/no-product-image.jpg';
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your products...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="my-products-page">
        {/* Header */}
        <div className="products-header mb-4">
          <Row className="align-items-center">
            <Col>
              <h1 className="page-title">My Products</h1>
              <p className="text-muted">Manage your products and track their performance</p>
            </Col>
            <Col xs="auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/account/my-products/create')}
                className="create-product-btn"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Product
              </Button>
            </Col>
          </Row>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant="success" dismissible onClose={() => setMessage('')}>
            <i className="bi bi-check-circle me-2"></i>
            {message}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="empty-state-icon mb-3">
              <i className="bi bi-box-seam display-1 text-muted"></i>
            </div>
            <h3 className="mb-3">No Products Yet</h3>
            <p className="text-muted mb-4">Start selling by adding your first product to the marketplace</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/account/my-products/create')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Create Your First Product
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {products.map(product => (
              <Col key={product.id} md={6} lg={4}>
                <Card className="product-card h-100">
                  <div className="product-image-wrapper">
                    <Card.Img
                      variant="top"
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/no-product-image.jpg';
                      }}
                    />
                    <div className="product-status-badge">
                      <Badge bg={product.status === '1' ? 'success' : 'secondary'}>
                        {product.status === '1' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="product-name">{product.name}</Card.Title>
                    
                    <div className="product-pricing mb-2">
                      <span className="selling-price fw-bold text-primary">
                        {formatPrice(product.price_1)}
                      </span>
                      {product.price_2 && parseFloat(product.price_2) > parseFloat(product.price_1) && (
                        <span className="original-price text-muted text-decoration-line-through ms-2">
                          {formatPrice(product.price_2)}
                        </span>
                      )}
                    </div>

                    <div className="product-meta mb-3">
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-tag-fill text-primary me-2"></i>
                        <span className="text-muted">{product.category_text || 'Uncategorized'}</span>
                      </div>
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-geo-alt-fill text-muted me-2"></i>
                        <span className="text-muted small">{product.supplier}</span>
                      </div>
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-telephone-fill text-muted me-2"></i>
                        <span className="text-muted small">{product.url}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className={`bi ${product.in_stock === '1' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                        <span className={`small ${product.in_stock === '1' ? 'text-success' : 'text-danger'}`}>
                          {product.in_stock === '1' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="d-grid gap-2 d-md-flex">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/account/my-products/edit/${product.id}`)}
                          className="flex-fill"
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-fill"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default MyProducts;
