// src/models/ProductModel.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface Stock {
  items_sold: number;
  total_items: number;
}

export interface Specification {
  label: string;
  value: string;
}

export type VariantOptions = Record<string, string[]>;

export class ProductModel {
  // API Fields from Laravel backend
  id: number = 0;
  name: string = "";
  metric: number = 0;
  currency: number = 1;
  description: string | null = null;
  summary: string | null = null;
  price_1: string = "0.00";
  price_2: string = "0.00";
  feature_photo: string = "";
  rates: string = "[]";
  date_added: string = "";
  date_updated: string = "";
  user: number = 1;
  category: number | null = null;
  sub_category: number | null = null;
  supplier: number = 1;
  url: string | null = null;
  status: number = 1;
  in_stock: number = 1;
  keywords: string = "[]";
  p_type: string = "No";
  local_id: string = "";
  updated_at: string = "";
  created_at: string = "";
  stripe_id: string | null = null;
  stripe_price: string | null = null;
  has_colors: string = "No";
  colors: string = "";
  has_sizes: string = "No";
  sizes: string = "";
  category_text: string = "";

  // Backend API fields for tags and attributes
  tags: string = "";
  tags_array: string[] = [];
  attributes_array: { name: string; value: string }[] = [];
  category_attributes: { 
    name: string; 
    is_required: boolean; 
    attribute_type: string; 
    possible_values?: string; 
  }[] = [];

  // Review fields from backend
  review_count: number = 0;
  average_rating: number = 0;

  // Frontend-specific fields for compatibility
  variants: VariantOptions = {};
  images: string[] = [];
  stock: Stock = { items_sold: 0, total_items: 0 };
  rating: number = 0;
  reviewsCount: number = 0;
  specifications: Specification[] = [];

  /**
   * Update fields with provided partial data.
   * @param data Partial data to update the product fields.
   */
  updateProfile(data: Partial<ProductModel>): void {
    Object.assign(this, data);
  }

  /**
   * Converts this instance to a plain JS object.
   */
  toJSON(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  /**
   * Creates a ProductModel instance from a plain object or JSON string.
   * @param data The plain object or JSON string containing product data.
   */
  static fromJson(data: string | Record<string, any>): ProductModel {
    const model = new ProductModel();
    let obj: Record<string, any> = {};

    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model;
      }
    } else {
      obj = data;
    }

    const modelKeys = Object.keys(model);
    for (const key of Object.keys(obj)) {
      if (modelKeys.includes(key)) {
        (model as any)[key] = obj[key];
      }
    }

    // Map review fields for backward compatibility
    if (obj.review_count !== undefined) {
      model.reviewsCount = Number(obj.review_count) || 0;
    }
    if (obj.average_rating !== undefined) {
      model.rating = Number(obj.average_rating) || 0;
    }

    return model;
  }

  /**
   * Helper: Returns the main image URL if `feature_photo` exists,
   * else returns a fallback placeholder.
   */
  getMainImage(): string {
    return this.feature_photo
      ? Utils.img(this.feature_photo)
      : "/media/svg/files/blank-image.svg";
  }

  /**
   * Helper: Parses `rates` JSON to get a second/hover image, if available.
   */
  getHoverImage(): string | null {
    try {
      const parsed = JSON.parse(this.rates || "[]");
      if (Array.isArray(parsed) && parsed[1]?.src) {
        return Utils.img(parsed[1].src);
      }
    } catch (err) {
    }
    return null;
  }

  /**
   * Helper: Returns array of all product images from rates JSON.
   */
  getAllImages(): string[] {
    try {
      const parsed = JSON.parse(this.rates || "[]");
      if (Array.isArray(parsed)) {
        const images = parsed.map(item => item.src).filter(Boolean);
        return images.map(img => Utils.img(img));
      }
    } catch (err) {
    }
    return [this.getMainImage()];
  }

  /**
   * Helper: Returns price_1 formatted to 2 decimals with UGX as currency.
   */
  getFormattedPrice(): string {
    return Utils.moneyFormat(this.price_1);
  }

  /**
   * Helper: Returns price_2 formatted to 2 decimals with UGX as currency.
   */
  getFormattedPrice2(): string {
    return Utils.moneyFormat(this.price_2);
  }

  /**
   * Helper: Check if product is in stock.
   */
  isInStock(): boolean {
    return this.in_stock === 1;
  }

  /**
   * Helper: Check if product is active.
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * Helper: Check if product has colors.
   */
  hasColors(): boolean {
    return this.has_colors === "Yes" && this.colors.length > 0;
  }

  /**
   * Helper: Get array of available colors.
   */
  getColors(): string[] {
    if (!this.hasColors()) return [];
    return this.colors.split(",").map(color => color.trim()).filter(Boolean);
  }

  /**
   * Helper: Check if product has sizes.
   */
  hasSizes(): boolean {
    return this.has_sizes === "Yes" && this.sizes.length > 0;
  }

  /**
   * Helper: Get array of available sizes.
   */
  getSizes(): string[] {
    if (!this.hasSizes()) return [];
    return this.sizes.split(",").map(size => size.trim()).filter(Boolean);
  }

  /**
   * Helper: Parse keywords JSON.
   */
  getKeywords(): Array<{id: string, min_qty: number, max_qty: number, price: string}> {
    try {
      const parsed = JSON.parse(this.keywords || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Helper: Check if product is premium type.
   */
  isPremiumType(): boolean {
    return this.p_type === "Yes";
  }

  /** Fetch a paginated list of products (GET /products). */
  static async fetchProducts(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });
      const response = await http_get(`products?${queryParams.toString()}`);
      
      // Handle both direct data and nested data structure
      const paginatedData: PaginatedResponse<any> = response.data || response;
      
      paginatedData.data = paginatedData.data.map((item: any) =>
        ProductModel.fromJson(item)
      );
      return paginatedData as PaginatedResponse<ProductModel>;
    } catch (error) {
      throw error;
    }
  }

  /** Fetch a single product by ID (GET /products/:id). */
  static async fetchProductById(id: string | number): Promise<ProductModel> {
    try {
      const response = await http_get(`products/${id}`);
      return ProductModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Fetch products by category (GET /products?category=:id). */
  static async fetchProductsByCategory(
    categoryId: number,
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await this.fetchProducts(page, { ...params, category: categoryId });
    } catch (error) {
      throw error;
    }
  }

  /** Search products (GET /products?search=:term). */
  static async searchProducts(
    searchTerm: string,
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await this.fetchProducts(page, { ...params, search: searchTerm });
    } catch (error) {
      throw error;
    }
  }

  /** Create a new product (POST /products). */
  static async createProduct(
    productData: Partial<ProductModel>
  ): Promise<ProductModel> {
    try {
      const response = await http_post("products", productData);
      return ProductModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Update product (PUT /products/:id). */
  static async updateProduct(
    id: string | number,
    productData: Partial<ProductModel>
  ): Promise<ProductModel> {
    try {
      const response = await http_post(
        `products/${id}?_method=PUT`,
        productData
      );
      return ProductModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Delete product (DELETE /products/:id). */
  static async deleteProduct(id: string | number): Promise<boolean> {
    try {
      await http_post(`products/${id}?_method=DELETE`, {});
      return true;
    } catch (error) {
      throw error;
    }
  }
}
export default ProductModel; 