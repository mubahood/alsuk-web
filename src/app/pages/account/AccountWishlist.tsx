// src/app/pages/account/AccountWishlist.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  loadWishlistFromAPI, 
  removeFromWishlistAPI,
  selectIsInWishlist,
  selectWishlistLoading
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils';
import Utils from '../../services/Utils';
import ToastService from '../../services/ToastService';
import { ProductModel } from '../../models/ProductModel';
import AccountPageWrapper from '../../components/Account/AccountPageWrapper';
import AccountCard from '../../components/Account/AccountCard';

interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_price: string;
  product_sale_price?: string;
  product_photo?: string;
  created_at: string;
  updated_at: string;
}

const AccountWishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items) as WishlistItem[];
  const isLoading = useSelector((state: RootState) => selectWishlistLoading(state));

  useEffect(() => {
    dispatch(loadWishlistFromAPI());
  }, [dispatch]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await dispatch(removeFromWishlistAPI(productId)).unwrap();
      ToastService.success('Item removed from wishlist');
    } catch (error) {
      ToastService.error('Failed to remove item from wishlist');
      console.error('Remove from wishlist error:', error);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    dispatch(addToCart({
      product: {
        id: item.product_id,
        name: item.product_name,
        price_1: parseFloat(item.product_price),
        sale_price: item.product_sale_price ? parseFloat(item.product_sale_price) : 0,
        featured_photo: item.product_photo || '',
        category_id: 0,
        category_name: '',
        sub_category_id: 0,
        sub_category_name: '',
        description: '',
        short_description: '',
        details: '',
        user_id: item.user_id,
        photos: [],
        status: 1,
        qty: 1,
        type: 'Product',
        created_at: item.created_at,
        updated_at: item.updated_at
      },
      quantity: 1
    }));
    
    ToastService.success(`${item.product_name} added to cart`);
  };

  if (isLoading) {
    return (
      <AccountPageWrapper
        title="My Wishlist"
        subtitle="Loading your saved items..."
        icon="bi-heart"
      >
        <AccountCard loading={true}>
          <div></div>
        </AccountCard>
      </AccountPageWrapper>
    );
  }

  return (
    <AccountPageWrapper
      title="My Wishlist"
      subtitle={`${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved for later`}
      icon="bi-heart"
      headerActions={
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-primary">
            {wishlistItems.length} items
          </span>
          {wishlistItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                  wishlistItems.forEach(item => {
                    dispatch(removeFromWishlistAPI(item.product_id));
                  });
                }
              }}
              className="btn btn-outline-danger btn-sm"
            >
              <i className="bi-trash me-2"></i>
              Clear All
            </button>
          )}
        </div>
      }
    >
      {/* Wishlist Items */}
      <AccountCard
        title="Saved Items"
        icon="bi-heart-fill"
        empty={wishlistItems.length === 0}
        emptyMessage="Your wishlist is empty. Start shopping to save your favorite items!"
        emptyIcon="bi-heart"
      >
        {wishlistItems.length > 0 && (
          <div className="row g-3">
            {wishlistItems.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="position-relative">
                    <img
                      src={item.product_photo ? Utils.formatImageUrl(item.product_photo) : '/placeholder-image.jpg'}
                      alt={item.product_name}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      style={{ borderRadius: '50%', width: '32px', height: '32px' }}
                    >
                      <i className="bi-heart-fill"></i>
                    </button>
                  </div>
                  <div className="card-body">
                    <h6 className="card-title">
                      <Link 
                        to={`/product/${item.product_id}`}
                        className="text-decoration-none"
                      >
                        {item.product_name}
                      </Link>
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {item.product_sale_price && parseFloat(item.product_sale_price) > 0 ? (
                        <div>
                          <span className="text-decoration-line-through text-muted me-2">
                            {formatPrice(parseFloat(item.product_price))}
                          </span>
                          <span className="fw-bold text-danger">
                            {formatPrice(parseFloat(item.product_sale_price))}
                          </span>
                        </div>
                      ) : (
                        <span className="fw-bold">
                          {formatPrice(parseFloat(item.product_price))}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn btn-primary btn-sm w-100"
                    >
                      <i className="bi-cart-plus me-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default AccountWishlist;
