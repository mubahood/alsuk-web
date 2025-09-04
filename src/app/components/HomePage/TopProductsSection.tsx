// src/app/components/HomePage/TopProductsSection.tsx
import React, { useEffect, useState } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProductCardSimple from "../shared/ProductCardSimple";
import ProductModel from "../../models/ProductModel";
import { useGetProductsQuery } from "../../services/realProductsApi";

// Inline styles for TopProductsSection following the unified design system
const topProductsSectionStyles = `
  .top-products-section-wrapper {
    background: var(--white);
    border-radius: var(--border-radius);
    margin: 2rem 0;
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .top-products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .top-products-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color-dark);
    margin: 0;
  }

  .view-all-top-products-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .view-all-top-products-link:hover {
    color: var(--primary-color-dark);
    text-decoration: none;
  }

  .top-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 767.98px) {
    .top-products-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    
    .top-products-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 575.98px) {
    .top-products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

const TopProductsSection: React.FC = () => {
  // Fetch products for Top Products section
  const { data: productsResponse, isLoading } = useGetProductsQuery({
    page: 1,
    limit: 24,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const products = productsResponse?.data || [];
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: topProductsSectionStyles }} />
      <section className="top-products-section-wrapper my-0 px-0 pt-0 pt-md-4">
        <Container className="px-4">
          <div className="top-products-header mb-1">
            <h2 className="top-products-title text-color-dark">
              Top 24 Products
            </h2>
            <Link
              to="/products?sort_by=rating&sort_order=desc"
              className="view-all-top-products-link text-primary fw-600"
            >
              View More <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
          <div className="top-products-grid">
            {isLoading && (
              <div className="d-flex justify-content-center p-4">
                <Spinner animation="border" />
              </div>
            )}
            {!isLoading && products.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No top products available at the moment.</p>
              </div>
            )}
            {!isLoading && products.length > 0 && products.map((product) => (
              <ProductCardSimple key={product.id} product={product} />
            ))}
          </div>
          {/* Optional: Load More button or pagination */}
          {!isLoading && products.length > 0 && (
            <div className="text-center mt-5">
              <Link to="/products" className="btn btn-outline-primary btn-lg">
                View All Products
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
};

export default TopProductsSection;
