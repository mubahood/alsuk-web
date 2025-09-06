// src/app/components/shared/ProductCard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
  calculateStockProgress, 
  getStockStatus, 
  getProductUrl,
  getProductImage 
} from "../../utils";
import { RootState, AppDispatch } from "../../store/store";
import { selectManifest, selectIsAuthenticated } from "../../store/slices/manifestSlice";

// Inline CSS styles for ProductCard - Modern clean design
const productCardStyles = `
  .product-card {
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid #f0f0f0;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: #e0e0e0;
  }

  .product-card-image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;
  }

  .product-card-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #ffffff;
    padding: 12px;
    transition: transform 0.4s ease;
  }

  .product-card-image.loading {
    opacity: 0;
  }

  .product-card-image.loaded {
    opacity: 1;
  }

  .product-card:hover .product-card-image {
    transform: scale(1.05);
  }

  .product-card-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      #f8f9fa 0%,
      #e9ecef 50%,
      #f8f9fa 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    z-index: 1;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .product-card-discount-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #F75E1E, #e84e0f);
    color: #ffffff;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    z-index: 3;
    line-height: 1;
    box-shadow: 0 2px 8px rgba(247, 94, 30, 0.3);
  }

  .product-card-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .product-card-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 2.8em;
    text-decoration: none;
  }

  .product-card-pricing {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }

  .product-card-price-new {
    font-size: 16px;
    font-weight: 700;
    color: #114786;
    margin: 0;
    line-height: 1.2;
  }

  .product-card-price-old {
    font-size: 13px;
    color: #999;
    text-decoration: line-through;
    margin: 0;
    line-height: 1.2;
  }

  .product-card-reviews {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .product-card-review-stars {
    display: flex;
    gap: 2px;
  }

  .product-card-review-star {
    font-size: 12px;
    color: #ffc107;
  }

  .product-card-review-star.empty {
    color: #e9ecef;
  }

  .product-card-review-count {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 991px) {
    .product-card {
      border-radius: 10px;
    }
    
    .product-card-info {
      padding: 14px;
      gap: 6px;
    }
    
    .product-card-name {
      font-size: 13px;
    }
    
    .product-card-price-new {
      font-size: 15px;
    }
  }

  @media (max-width: 575px) {
    .product-card {
      border-radius: 8px;
    }
    
    .product-card-info {
      padding: 12px;
    }
    
    .product-card-name {
      font-size: 12px;
    }
    
    .product-card-price-new {
      font-size: 14px;
    }
      font-size: 14px;
    }
    
    .product-card-discount-badge {
      padding: 4px 8px;
      font-size: 10px;
    }
    
    .product-card-review-star {
      font-size: 11px;
    }
    
    .product-card-review-count {
      font-size: 11px;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "product-card-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = productCardStyles;
    document.head.appendChild(styleElement);
  }
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = "", 
  showStock = true 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const manifestData = useSelector((state: RootState) => selectManifest(state));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
  // Get review data from product (with fallbacks)
  const productRating = Number((product as any).rating) || Number((product as any).average_rating) || 0;
  const productReviewCount = Number((product as any).reviewsCount) || Number((product as any).review_count) || 0;
  
  // Handlers
  const handleImageLoad = () => setIsImageLoaded(true);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
    setIsImageLoaded(true);
  };

  // Get the image URL
  let imageUrl: string;
  if (product && 'getMainImage' in product && typeof product.getMainImage === 'function') {
    imageUrl = product.getMainImage();
  } else {
    imageUrl = getProductImage(product);
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="product-card-review-star">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="product-card-review-star">★</span>);
      } else {
        stars.push(<span key={i} className="product-card-review-star empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className={`product-card ${className}`}>
      <Link to={getProductUrl(product.id)} className="product-card-image-container">
        {!isImageLoaded && <div className="product-card-shimmer" />}
        
        <img
          src={imageUrl}
          alt={product.name}
          className={`product-card-image ${isImageLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {discountPercent > 0 && (
          <div className="product-card-discount-badge">
            -{discountPercent}%
          </div>
        )}
      </Link>
      
      <div className="product-card-info">
        <Link to={getProductUrl(product.id)} style={{ textDecoration: 'none' }}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        
        <div className="product-card-pricing">
          <div className="product-card-price-new">
            UGX {price1.toLocaleString()}
          </div>
          {price2 > price1 && (
            <div className="product-card-price-old">
              UGX {price2.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="product-card-reviews">
          {productRating > 0 && (
            <>
              <div className="product-card-review-stars">
                {renderStars(productRating)}
              </div>
              <span className="product-card-review-count">
                ({productReviewCount})
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
