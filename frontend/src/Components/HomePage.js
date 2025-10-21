// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Import your background images as needed
import bg1Image from "../bg1.jpg";
import bg2Image from "../bg2.jpg";
import bg3Image from "../bg3.jpg";
import { Box, Info, Phone, Book } from "lucide-react";


export const HomePage = ({ setCurrentPage }) => {
  const blogHighlights = [
    { id: 1, title: "Top 5 DIY Home Repairs", image: bg1Image, description: "Learn essential home repair techniques to save time and money." },
    { id: 2, title: "Choosing the Right Tools", image: bg2Image, description: "A guide to selecting the best tools for your next project." },
    { id: 3, title: "Sustainable Construction Tips", image: bg3Image, description: "Explore eco-friendly methods for building and renovating." },
  ];

  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);

  useEffect(() => {
    const blogInterval = setInterval(() => {
      setCurrentBlogIndex((prev) => (prev + 1) % blogHighlights.length);
    }, 7000);
    return () => clearInterval(blogInterval);
  }, [blogHighlights.length]);

  const nextBlogSlide = () => {
    setCurrentBlogIndex((prev) => (prev + 1) % blogHighlights.length);
  };

  const prevBlogSlide = () => {
    setCurrentBlogIndex((prev) => (prev - 1 + blogHighlights.length) % blogHighlights.length);
  };

  return (
    <div className="home-container">
      <section className="blog-highlights">
        <h2>Blog Highlights</h2>
        <div className="blog-carousel">
          <button className="carousel-btn prev" onClick={prevBlogSlide} aria-label="Previous blog post">
            <ChevronLeft size={24} />
          </button>
          <div className="blog-card">
            <img
              src={blogHighlights[currentBlogIndex].image}
              alt={blogHighlights[currentBlogIndex].title}
              className="blog-image"
            />
            <div className="blog-content">
              <h3>{blogHighlights[currentBlogIndex].title}</h3>
              <p>{blogHighlights[currentBlogIndex].description}</p>
              <button
                className="read-more-btn"
                onClick={() => setCurrentPage("blogs")}
              >
                Read More
              </button>
            </div>
          </div>
          <button className="carousel-btn next" onClick={nextBlogSlide} aria-label="Next blog post">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="carousel-indicators">
          {blogHighlights.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentBlogIndex ? "active" : ""}`}
              onClick={() => setCurrentBlogIndex(index)}
              aria-label={`Go to blog post ${index + 1}`}
            ></span>
          ))}
        </div>
      </section>

      <section className="hero">
        <h1>Welcome to BST Hardware Supply</h1>
        <p className="tagline">
          Your one-stop shop for high-quality construction materials, tools, and
          home improvement essentials. Whether you're a professional contractor
          or a DIY enthusiast, we're here to support your goals with top-notch
          products and customer service.
        </p>
        <div className="cta-box">
          <button onClick={() => setCurrentPage("products")}>
            Explore Products
          </button>
        </div>
      </section>

      <section className="sections-preview">
        <h2>Explore Our Sections</h2>
        <div className="preview-grid">
          <div className="preview-card" onClick={() => setCurrentPage("products")}>
            <Box size={24} />
            <h3>Products</h3>
            <p>Discover our wide range of hardware materials.</p>
          </div>
          <div className="preview-card" onClick={() => setCurrentPage("about")}>
            <Info size={24} />
            <h3>About Us</h3>
            <p>Learn about our commitment to quality and service.</p>
          </div>
          <div className="preview-card" onClick={() => setCurrentPage("contact")}>
            <Phone size={24} />
            <h3>Contact Us</h3>
            <p>Get in touch with us for support or inquiries.</p>
          </div>
          <div className="preview-card" onClick={() => setCurrentPage("blogs")}>
            <Book size={24} />
            <h3>Blogs</h3>
            <p>Read our latest tips and industry insights.</p>
          </div>
        </div>
      </section>
    </div>
  );
};