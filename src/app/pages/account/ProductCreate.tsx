import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import './ProductCreate.css';

interface Category {
  id: number;
  category: string;
  attributes?: string;
}

interface ProductFormData {
  name: string;
  url: string; // Contact phone
  supplier: string; // Address  
  category: string;
  price_1: string; // Selling price
  price_2: string; // Original price
  description: string;
  has_colors: string;
  has_sizes: string;
  colors: string;
  sizes: string;
  p_type: string;
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    url: '',
    supplier: '',
    category: '',
    price_1: '',
    price_2: '',
    description: '',
    has_colors: 'No',
    has_sizes: 'No',
    colors: '',
    sizes: '',
    p_type: 'No'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Mock categories - replace with actual API call
      const mockCategories: Category[] = [
        { id: 1, category: 'Electronics' },
        { id: 2, category: 'Computers & Accessories' },
        { id: 3, category: 'Fashion & Clothing' },
        { id: 4, category: 'Home & Garden' },
        { id: 5, category: 'Sports & Outdoors' },
        { id: 6, category: 'Books & Media' },
        { id: 7, category: 'Automotive' },
        { id: 8, category: 'Health & Beauty' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setPhotos(prev => [...prev, ...acceptedFiles]);
      if (errors.photos) {
        setErrors(prev => ({ ...prev, photos: '' }));
      }
    }
  });

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Contact phone number is required';
    } else if (formData.url.length < 5) {
      newErrors.url = 'Phone number should be at least 5 digits';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Product/Service address is required';
    } else if (formData.supplier.length < 5) {
      newErrors.supplier = 'Address should be at least 5 characters';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.price_1 || parseFloat(formData.price_1) < 1) {
      newErrors.price_1 = 'Selling price must be at least 1';
    }

    if (!formData.price_2 || parseFloat(formData.price_2) < 1) {
      newErrors.price_2 = 'Original price must be at least 1';
    }

    if (parseFloat(formData.price_2) < parseFloat(formData.price_1)) {
      newErrors.price_2 = 'Original price should be greater than selling price';
    }

    if (photos.length === 0) {
      newErrors.photos = 'Please add at least one product photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category: category.id.toString()
    }));

    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Mock submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/account/my-products', { 
        state: { message: 'Product created successfully!' }
      });
    } catch (error: any) {
      console.error('Failed to create product:', error);
      setErrors({
        submit: error.message || 'Failed to create product. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="product-create-page">
        {/* Header */}
        <div className="create-header mb-4">
          <Row className="align-items-center">
            <Col>
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/account/my-products')}
                className="mb-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to My Products
              </Button>
              <h1 className="page-title">Create New Product</h1>
              <p className="text-muted">Add a new product to start selling</p>
            </Col>
          </Row>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              {/* Photo Upload Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0"><i className="bi bi-images me-2"></i>Product Photos</h5>
                </Card.Header>
                <Card.Body>
                  <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
                    <input {...getInputProps()} />
                    <div className="dropzone-content text-center py-4">
                      <i className="bi bi-cloud-upload display-4 text-primary mb-3"></i>
                      <h6>
                        {isDragActive
                          ? "Drop photos here..."
                          : "Drop photos here or click to select"}
                      </h6>
                      <p className="text-muted small mb-0">
                        Add up to 10 product photos (JPG, PNG, GIF, WebP)
                      </p>
                    </div>
                  </div>

                  {photos.length > 0 && (
                    <div className="uploaded-photos mt-3">
                      <h6>Uploaded Photos ({photos.length})</h6>
                      <Row className="g-3">
                        {photos.map((file, index) => (
                          <Col key={index} xs={6} md={4} lg={3}>
                            <div className="photo-preview">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="img-fluid rounded"
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="remove-photo"
                                onClick={() => removePhoto(index)}
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                  
                  {errors.photos && <div className="text-danger small mt-2">{errors.photos}</div>}
                </Card.Body>
              </Card>

              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        isInvalid={!!errors.name}
                        placeholder="Enter product name"
                      />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Contact Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        isInvalid={!!errors.url}
                        placeholder="Enter contact phone number"
                      />
                      <Form.Control.Feedback type="invalid">{errors.url}</Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Product/Service Address *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => handleInputChange('supplier', e.target.value)}
                        isInvalid={!!errors.supplier}
                        placeholder="Enter product location/address"
                      />
                      <Form.Control.Feedback type="invalid">{errors.supplier}</Form.Control.Feedback>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Label>Product Category *</Form.Label>
                      <Form.Select
                        value={formData.category}
                        onChange={(e) => {
                          const categoryId = e.target.value;
                          const category = categories.find(cat => cat.id.toString() === categoryId);
                          if (category) {
                            handleCategorySelect(category);
                          }
                        }}
                        isInvalid={!!errors.category}
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.category}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your product or service..."
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Pricing */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0"><i className="bi bi-currency-exchange me-2"></i>Pricing</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Form.Label>Original Price (UGX) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.price_2}
                      onChange={(e) => handleInputChange('price_2', e.target.value)}
                      isInvalid={!!errors.price_2}
                      placeholder="Enter original price"
                      min="1"
                    />
                    <Form.Control.Feedback type="invalid">{errors.price_2}</Form.Control.Feedback>
                  </div>

                  <div className="mb-3">
                    <Form.Label>Selling Price (UGX) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.price_1}
                      onChange={(e) => handleInputChange('price_1', e.target.value)}
                      isInvalid={!!errors.price_1}
                      placeholder="Enter selling price"
                      min="1"
                    />
                    <Form.Control.Feedback type="invalid">{errors.price_1}</Form.Control.Feedback>
                  </div>
                </Card.Body>
              </Card>

              {/* Submit */}
              <Card>
                <Card.Body>
                  {errors.submit && (
                    <Alert variant="danger" className="mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {errors.submit}
                    </Alert>
                  )}

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating Product...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Create Product
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </Container>
  );
};

export default ProductCreate;
