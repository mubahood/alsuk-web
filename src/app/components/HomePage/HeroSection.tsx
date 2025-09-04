// src/app/components/HomePage/HeroSection.tsx
import React from "react";
import CategoryList from "./CategoryList";
import HeroCarousel from "./HeroCarousel";

// Inline styles for HeroSection following the unified design system
const heroSectionStyles = `
  .hero-section {
    margin: 2rem 0;
    padding: 0;
  }

  .hero-row {
    display: flex;
    gap: 1rem;
    align-items: stretch;
  }

  .hero-categories-col {
    flex: 0 0 280px;
    min-height: 400px;
  }

  .hero-carousel-col {
    flex: 1;
    min-height: 400px;
  }

  @media (max-width: 991.98px) {
    .hero-categories-col {
      display: none;
    }
    
    .hero-row {
      gap: 0;
    }
  }

  @media (max-width: 767.98px) {
    .hero-section {
      margin: 1rem 0;
    }
  }
`;

const HeroSection: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroSectionStyles }} />
      <section className="hero-section">
        <div className="hero-row">
          {/* Left Column for Categories */}
          <div className="hero-categories-col">
            <CategoryList />
          </div>

          {/* Right Column for Carousel */}
          <div className="hero-carousel-col">
            <HeroCarousel />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
