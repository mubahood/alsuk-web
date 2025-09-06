// src/app/components/HomePage/HeroSection.tsx
import React from "react";
import CategoryList from "./CategoryList";
import HeroCarousel from "./HeroCarousel";

// Inline styles for HeroSection following professional boxed design
const heroSectionStyles = `
  .hero-section {
    margin: 8px 0;
    padding: 0;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 8px;
    padding-right: 8px;
  }

  .hero-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .hero-categories-col {
    flex: 0 0 280px;
    min-height: 450px;
  }

  .hero-carousel-col {
    flex: 1;
    min-height: 450px;
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
      margin: 6px 0;
      padding-left: 6px;
      padding-right: 6px;
    }
    
    .hero-carousel-col {
      min-height: 280px;
    }
  }

  @media (max-width: 575.98px) {
    .hero-section {
      margin: 4px 0;
      padding-left: 4px;
      padding-right: 4px;
    }
    
    .hero-carousel-col {
      min-height: 220px;
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
