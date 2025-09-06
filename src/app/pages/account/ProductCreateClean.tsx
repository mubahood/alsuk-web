import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './ProductCreate.css';

interface FormData {
  name: string;
  category: string;
  condition: string;
  description: string;
  price_1: string; // selling price
  price_2: string; // original price
}

interface Errors {
  [key: string]: string;
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    condition: '',
    description: '',
    price_1: '',
    price_2: ''
  });
  const [errors, setErrors] = useState<Errors>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 10 - photos.length);
    setPhotos(prev => [...prev, ...newFiles]);
  }, [photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    disabled: photos.length >= 10
  });

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price_1) {
      newErrors.price_1 = 'Selling price is required';
    } else if (Number(formData.price_1) <= 0) {
      newErrors.price_1 = 'Selling price must be greater than 0';
    }
    
    if (!formData.price_2) {
      newErrors.price_2 = 'Original price is required';
    } else if (Number(formData.price_2) <= 0) {
      newErrors.price_2 = 'Original price must be greater than 0';
    }

    if (photos.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to shop on success
      navigate('/account/my-shop');
    } catch (error) {
      setErrors({ submit: 'Failed to create product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product-page">
      {/* Simple Header */}
      <div className="page-header">
        <button 
          type="button" 
          className="back-link"
          onClick={() => navigate('/account/my-shop')}
        >
          ← Back to My Shop
        </button>
        <h1>Create New Product</h1>
      </div>

      {/* Clean Form Layout */}
      <form onSubmit={handleSubmit} className="product-form">
        {/* Photo Upload - Full Width */}
        <div className="form-section photo-section">
          <h2>Product Photos</h2>
          
          <div 
            {...getRootProps()}
            className={`photo-upload ${isDragActive ? 'dragging' : ''} ${photos.length > 0 ? 'has-files' : ''}`}
          >
            <input {...getInputProps()} />
            {photos.length === 0 ? (
              <div className="upload-prompt">
                <div className="upload-icon">📷</div>
                <p>Drop photos here or click to upload</p>
                <span>JPG, PNG, GIF, WebP (max 10 photos)</span>
              </div>
            ) : (
              <div className="photo-grid">
                {photos.map((file, index) => (
                  <div key={index} className="photo-preview">
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <div className="add-more">
                    <div className="add-icon">+</div>
                    <span>Add more</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.photos && <span className="error-text">{errors.photos}</span>}
        </div>

        {/* Form Fields - Two Column Layout */}
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-column">
            <div className="field-group">
              <label>Product Name</label>
              <input
                type="text"
                className={errors.name ? 'error' : ''}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="What are you selling?"
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Category</label>
                <select
                  className={errors.category ? 'error' : ''}
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Choose category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              <div className="field-group">
                <label>Condition</label>
                <select
                  className={errors.condition ? 'error' : ''}
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  required
                >
                  <option value="">Item condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                {errors.condition && <span className="error-text">{errors.condition}</span>}
              </div>
            </div>

            <div className="field-group">
              <label>Description</label>
              <textarea
                className={errors.description ? 'error' : ''}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your item, its condition, and any important details..."
                rows={5}
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column">
            <div className="pricing-section">
              <h3>Pricing</h3>
              
              <div className="field-group">
                <label>Original Price (UGX)</label>
                <input
                  type="number"
                  className={errors.price_2 ? 'error' : ''}
                  value={formData.price_2}
                  onChange={(e) => handleInputChange('price_2', e.target.value)}
                  placeholder="What did you pay?"
                  min="0"
                  required
                />
                {errors.price_2 && <span className="error-text">{errors.price_2}</span>}
              </div>

              <div className="field-group">
                <label>Selling Price (UGX)</label>
                <input
                  type="number"
                  className={errors.price_1 ? 'error' : ''}
                  value={formData.price_1}
                  onChange={(e) => handleInputChange('price_1', e.target.value)}
                  placeholder="Your asking price"
                  min="0"
                  required
                />
                {errors.price_1 && <span className="error-text">{errors.price_1}</span>}
              </div>

              {formData.price_2 && formData.price_1 && formData.price_2 > formData.price_1 && (
                <div className="price-info">
                  <div className="discount">
                    {Math.round(((Number(formData.price_2) - Number(formData.price_1)) / Number(formData.price_2)) * 100)}% off
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="submit-area">
              {errors.submit && (
                <div className="error-summary">
                  {errors.submit}
                </div>
              )}
              
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
