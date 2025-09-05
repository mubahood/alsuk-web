// src/app/services/ApiService.ts

import { http_get, http_post } from "./Api";
import ProductModel, { PaginatedResponse } from "../models/ProductModel";
import CategoryModel from "../models/CategoryModel";
import VendorModel from "../models/VendorModel";
import ToastService from "./ToastService";

/**
 * Comprehensive API service that handles all backend endpoints
 */
export class ApiService {
  private static categoriesCache: CategoryModel[] | null = null;
  private static categoriesPromise: Promise<CategoryModel[]> | null = null;
  
  // ===== PRODUCTS =====
  
  /**
   * Fetch paginated products with filtering and search
   */
  static async getProducts(params: {
    page?: number;
    category?: number;
    search?: string;
    vendor?: number;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: 'name' | 'price_1' | 'date_added' | 'metric';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  } = {}): Promise<PaginatedResponse<ProductModel>> {
    try {
      const { page = 1, in_stock, ...otherFilters } = params;
      const filters: Record<string, string | number> = { ...otherFilters };
      
      // Convert boolean to string for API
      if (in_stock !== undefined) {
        filters.in_stock = in_stock ? 1 : 0;
      }
      
      return await ProductModel.fetchProducts(page, filters);
    } catch (error) {
      ToastService.error("Failed to load products");
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(id: number): Promise<ProductModel> {
    try {
      return await ProductModel.fetchProductById(id);
    } catch (error) {
      ToastService.error("Product not found");
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: number,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await ProductModel.fetchProductsByCategory(categoryId, page, additionalParams);
    } catch (error) {
      ToastService.error("Failed to load category products");
      throw error;
    }
  }

  /**
   * Search products
   */
  static async searchProducts(
    searchTerm: string,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await ProductModel.searchProducts(searchTerm, page, additionalParams);
    } catch (error) {
      ToastService.error("Search failed");
      throw error;
    }
  }

  // ===== CATEGORIES =====
  
  /**
   * Get all categories with caching to prevent duplicate requests
   */
  static async getCategories(): Promise<CategoryModel[]> {
    // Return cached result if available
    if (this.categoriesCache) {
      return this.categoriesCache;
    }
    
    // Return existing promise if already in progress
    if (this.categoriesPromise) {
      return this.categoriesPromise;
    }
    
    // Start new request
    this.categoriesPromise = this.fetchCategoriesInternal();
    
    try {
      const categories = await this.categoriesPromise;
      this.categoriesCache = categories; // Cache the result
      return categories;
    } catch (error) {
      this.categoriesPromise = null; // Reset promise on error
      throw error;
    } finally {
      this.categoriesPromise = null; // Reset promise when done
    }
  }
  
  private static async fetchCategoriesInternal(): Promise<CategoryModel[]> {
    try {
      return await CategoryModel.fetchCategories();
    } catch (error) {
      ToastService.error("Failed to load categories");
      throw error;
    }
  }

  /**
   * Get categories for banner display
   */
  static async getBannerCategories(): Promise<CategoryModel[]> {
    try {
      const categories = await CategoryModel.fetchCategories();
      return categories.filter(cat => cat.isShownInBanner());
    } catch (error) {
      ToastService.error("Failed to load banner categories");
      throw error;
    }
  }

  /**
   * Get categories for navigation/listing
   */
  static async getNavigationCategories(): Promise<CategoryModel[]> {
    try {
      const categories = await CategoryModel.fetchCategories();
      return categories.filter(cat => cat.isShownInCategories() && !cat.isParentCategory());
    } catch (error) {
      ToastService.error("Failed to load navigation categories");
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  static async getCategory(id: number): Promise<CategoryModel> {
    try {
      return await CategoryModel.fetchCategoryById(id);
    } catch (error) {
      ToastService.error("Category not found");
      throw error;
    }
  }

  // ===== VENDORS =====
  
  /**
   * Get all vendors
   */
  static async getVendors(): Promise<VendorModel[]> {
    try {
      return await VendorModel.fetchVendors();
    } catch (error) {
      ToastService.error("Failed to load vendors");
      throw error;
    }
  }

  /**
   * Get active vendors only
   */
  static async getActiveVendors(): Promise<VendorModel[]> {
    try {
      const vendors = await VendorModel.fetchVendors();
      return vendors.filter(vendor => vendor.isActive() && vendor.isApproved());
    } catch (error) {
      ToastService.error("Failed to load active vendors");
      throw error;
    }
  }

  /**
   * Get a single vendor by ID
   */
  static async getVendor(id: number): Promise<VendorModel> {
    try {
      return await VendorModel.fetchVendorById(id);
    } catch (error) {
      ToastService.error("Vendor not found");
      throw error;
    }
  }

  // ===== ORDERS =====
  
  /**
   * Get user orders (requires authentication)
   */
  static async getUserOrders(page = 1): Promise<any> {
    try {
      const response = await http_get(`orders?page=${page}`);
      return response;
    } catch (error) {
      ToastService.error("Failed to load orders");
      throw error;
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrder(id: number): Promise<any> {
    try {
      const response = await http_get(`orders/${id}`);
      return response;
    } catch (error) {
      ToastService.error("Order not found");
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: {
    products: Array<{
      product_id: number;
      quantity: number;
      variant?: Record<string, string>;
    }>;
    shipping_address: any;
    payment_method: string;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await http_post("orders", orderData);
      ToastService.success("Order placed successfully!");
      return response;
    } catch (error) {
      ToastService.error("Failed to place order");
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      const response = await http_post(`orders/${orderId}/status`, { status });
      ToastService.success("Order status updated");
      return response;
    } catch (error) {
      ToastService.error("Failed to update order status");
      throw error;
    }
  }

  // ===== CART & WISHLIST =====
  
  /**
   * Add to cart (server-side if needed, or localStorage)
   */
  static async addToCart(productId: number, quantity = 1, variant?: Record<string, string>): Promise<boolean> {
    try {
      // For now, we'll handle cart in localStorage, but this could sync with server
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.product_id === productId && JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
      );

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          product_id: productId,
          quantity,
          variant: variant || {},
          added_at: new Date().toISOString()
        });
      }

      localStorage.setItem('CART_ITEMS', JSON.stringify(cartItems));
      ToastService.success("Added to cart");
      return true;
    } catch (error) {
      ToastService.error("Failed to add to cart");
      throw error;
    }
  }

  /**
   * Get cart items with product details
   */
  static async getCartItems(): Promise<Array<{
    product: ProductModel;
    quantity: number;
    variant: Record<string, string>;
  }>> {
    try {
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const detailedItems = [];

      for (const item of cartItems) {
        try {
          const product = await ProductModel.fetchProductById(item.product_id);
          detailedItems.push({
            product,
            quantity: item.quantity,
            variant: item.variant || {}
          });
        } catch (error) {
          console.warn(`Product ${item.product_id} not found in cart`);
        }
      }

      return detailedItems;
    } catch (error) {
      ToastService.error("Failed to load cart");
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(productId: number, quantity: number, variant?: Record<string, string>): Promise<boolean> {
    try {
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const itemIndex = cartItems.findIndex((item: any) => 
        item.product_id === productId && JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].quantity = quantity;
        }
        localStorage.setItem('CART_ITEMS', JSON.stringify(cartItems));
        ToastService.success("Cart updated");
        return true;
      }
      return false;
    } catch (error) {
      ToastService.error("Failed to update cart");
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(productId: number, variant?: Record<string, string>): Promise<boolean> {
    return this.updateCartItem(productId, 0, variant);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<boolean> {
    try {
      localStorage.removeItem('CART_ITEMS');
      ToastService.success("Cart cleared");
      return true;
    } catch (error) {
      ToastService.error("Failed to clear cart");
      throw error;
    }
  }

  // ===== WISHLIST =====

  /**
   * Add to wishlist
   */
  static async addToWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_add", { product_id: productId });
      ToastService.success("Added to wishlist");
      return true;
    } catch (error) {
      ToastService.error("Failed to add to wishlist");
      throw error;
    }
  }

  /**
   * Remove from wishlist
   */
  static async removeFromWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_remove", { product_id: productId });
      ToastService.success("Removed from wishlist");
      return true;
    } catch (error) {
      ToastService.error("Failed to remove from wishlist");
      throw error;
    }
  }

  /**
   * Get user wishlist
   */
  static async getWishlist(): Promise<any[]> {
    try {
      const response = await http_get("wishlist_get");
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      ToastService.error("Failed to load wishlist");
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async checkWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_check", { product_id: productId });
      return response?.data?.in_wishlist || false;
    } catch (error) {
      console.warn("Failed to check wishlist status:", error);
      return false;
    }
  }

  // ===== MANIFEST =====

  /**
   * Get application manifest with essential data and counts
   */
  static async getManifest(): Promise<any> {
    try {
      const response = await http_get("manifest");
      
      if (!response?.data) {
        throw new Error("No manifest data received");
      }

      // Transform the API response structure to match frontend expectations
      const manifestData = response.data;
      
      return {
        categories: manifestData.CATEGORIES || [],
        first_banner: manifestData.FIRST_BANNER || null,
        section_1_products: manifestData.SECTION_1_PRODUCTS || {},
        section_2_products: manifestData.SECTION_2_PRODUCTS || {},
        slider_categories: manifestData.SLIDER_CATEGORIES || [],
        top_4_products: manifestData.TOP_4_PRODUCTS || {},
        // Add default values for other expected properties
        app_info: {
          name: "AL-SUK",
          version: "1.0.0",
          api_version: "1.0.0",
          maintenance_mode: false
        },
        delivery_locations: [],
        settings: {
          currency: "IQD",
          currency_symbol: "د.ع",
          tax_rate: 0,
          delivery_fee_varies: false,
          min_order_amount: 0
        },
        features: {
          wishlist_enabled: true,
          reviews_enabled: true,
          chat_enabled: true,
          promotions_enabled: true
        },
        counts: {
          total_products: 0,
          total_categories: manifestData.CATEGORIES?.length || 0,
          total_orders: 0,
          total_users: 0,
          total_vendors: 0,
          active_vendors: 0,
          total_delivery_locations: 0,
          active_promotions: 0,
          wishlist_count: 0,
          cart_count: 0,
          notifications_count: 0,
          unread_messages_count: 0,
          pending_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          processing_orders: 0,
          recent_orders_this_week: 0,
          orders_today: 0,
          orders_this_month: 0,
          new_users_this_week: 0,
          new_users_today: 0,
          products_out_of_stock: 0,
          low_stock_products: 0,
          featured_products_count: 0,
          total_revenue: 0,
          revenue_this_month: 0,
          average_order_value: 0
        },
        user: null,
        is_authenticated: false,
        featured_products: [],
        recent_products: [],
        recent_orders: [],
        recent_search_suggestions: [],
        wishlist: []
      };
    } catch (error: any) {
      console.error("Failed to load manifest:", error);
      throw error;
    }
  }

  // ===== SEARCH & FILTERS =====

  /**
   * Live search for real-time product search with suggestions
   */
  static async liveSearch(query: string, limit = 10): Promise<{
    products: ProductModel[];
    suggestions: string[];
    total: number;
    search_term: string;
  }> {
    try {
      // Use the products endpoint with search parameter
      const response = await http_get(`products?search=${encodeURIComponent(query)}&limit=${limit}`);
      const data = response?.data || {};
      
      // Extract products from the paginated response
      const products = (data.data || []).map((item: any) => ProductModel.fromJson(item));
      
      return {
        products,
        suggestions: [], // No suggestions from this endpoint, but products serve as suggestions
        total: data.total || 0,
        search_term: query
      };
    } catch (error) {
      console.warn("Live search failed:", error);
      return {
        products: [],
        suggestions: [],
        total: 0,
        search_term: query
      };
    }
  }

  /**
   * Get user's search history
   */
  static async getSearchHistory(limit = 10): Promise<string[]> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const response = await http_get(`search-history?limit=${limit}&session_id=${sessionId}`);
      return response?.data?.recent_searches || [];
    } catch (error) {
      console.warn("Failed to get search history:", error);
      return [];
    }
  }

  /**
   * Clear user's search history
   */
  static async clearSearchHistory(): Promise<boolean> {
    try {
      const sessionId = this.getOrCreateSessionId();
      await http_post("search-history/clear", { session_id: sessionId });
      return true;
    } catch (error) {
      console.warn("Failed to clear search history:", error);
      return false;
    }
  }

  /**
   * Get or create a session ID for guest users
   */
  private static getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('alsuk_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('alsuk_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await http_get(`search/suggestions?q=${encodeURIComponent(query)}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn("Failed to get search suggestions:", error);
      return [];
    }
  }

  /**
   * Get filter options (price ranges, brands, etc.)
   */
  static async getFilterOptions(categoryId?: number): Promise<{
    priceRanges: Array<{ min: number; max: number; label: string }>;
    brands: string[];
    colors: string[];
    sizes: string[];
  }> {
    try {
      const params: Record<string, string> = {};
      if (categoryId) {
        params.category = String(categoryId);
      }
      const response = await http_get(`filters?${new URLSearchParams(params).toString()}`);
      return response?.data || {
        priceRanges: [],
        brands: [],
        colors: [],
        sizes: []
      };
    } catch (error) {
      console.warn("Failed to get filter options:", error);
      return {
        priceRanges: [],
        brands: [],
        colors: [],
        sizes: []
      };
    }
  }

  // ===== REVIEWS =====

  /**
   * Add product review
   */
  static async addReview(productId: number, reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }): Promise<any> {
    try {
      const response = await http_post(`products/${productId}/reviews`, reviewData);
      ToastService.success("Review submitted successfully");
      return response;
    } catch (error) {
      ToastService.error("Failed to submit review");
      throw error;
    }
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(productId: number, page = 1): Promise<any> {
    try {
      const response = await http_get(`products/${productId}/reviews?page=${page}`);
      return response;
    } catch (error) {
      console.warn("Failed to load reviews:", error);
      return { data: [], total: 0 };
    }
  }

  // ===== USER PROFILE =====

  /**
   * Update user profile
   */
  static async updateProfile(profileData: {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number: string;
    dob?: string;
    sex?: string;
    intro?: string;
    address?: string;
  }): Promise<any> {
    try {
      // Prepare the data object, mapping frontend fields to backend expected fields
      const requestData: any = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number_1: profileData.phone_number, // Backend still expects phone_number_1
      };

      if (profileData.email) {
        requestData.email = profileData.email;
      }
      
      if (profileData.dob) {
        requestData.date_of_birth = profileData.dob; // Backend expects date_of_birth
      }
      
      if (profileData.sex) {
        requestData.gender = profileData.sex; // Backend expects 'gender'
      }
      
      if (profileData.intro) {
        requestData.bio = profileData.intro; // Backend expects 'bio'
      }
      
      if (profileData.address) {
        requestData.address = profileData.address;
      }

      console.log('Sending to backend:', requestData); // Debug log

      const response = await http_post("update-profile", requestData);
      
      if (response?.code === 1) {
        ToastService.success(response.message || "Profile updated successfully!");
        
        // Transform the response data to match frontend field names
        const transformedData = response.data ? {
          ...response.data,
          phone_number_1: response.data.phone_number || response.data.phone_number_1,
          date_of_birth: response.data.dob || response.data.date_of_birth
        } : response.data;
        
        return transformedData;
      } else {
        throw new Error(response?.message || "Failed to update profile");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile";
      ToastService.error(errorMessage);
      throw error;
    }
  }
}

export default ApiService;
