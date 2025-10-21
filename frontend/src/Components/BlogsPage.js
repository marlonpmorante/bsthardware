// src/pages/BlogsPage.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
// Import blog background images
import bg1Image from "../bg1.jpg";
import bg2Image from "../bg2.jpg";
import bg3Image from "../bg3.jpg";
import bg4Image from "../bg4.jpg";
import bg5Image from "../bg5.jpg";
import bg6Image from "../bg6.jpg";

export const BlogsPage = () => {
  const blogData = [
    { id: 1, title: "Top 5 DIY Home Repairs", image: bg1Image, description: "Learn essential home repair techniques to save time and money." },
    { id: 2, title: "Choosing the Right Tools", image: bg2Image, description: "A guide to selecting the best tools for your next project." },
    { id: 3, title: "Sustainable Construction Tips", image: bg3Image, description: "Explore eco-friendly methods for building and renovating." },
    { id: 4, title: "Painting 101", image: bg4Image, description: "Master the art of painting with these beginner-friendly tips." },
    { id: 5, title: "Electrical Safety Basics", image: bg5Image, description: "Stay safe with these key electrical safety guidelines." },
    { id: 6, title: "Plumbing Hacks", image: bg6Image, description: "Quick fixes and hacks for common plumbing issues." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % blogData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + blogData.length) % blogData.length);
  };

  return (
    <div className="page-content">
      <h2>Blogs</h2>
      <div className="blog-slider">
        <button className="slider-btn prev" onClick={prevSlide} aria-label="Previous blog post">
          <ChevronLeft size={24} />
        </button>
        <div className="blog-card">
          <img src={blogData[currentIndex].image} alt={blogData[currentIndex].title} className="blog-image" />
          <div className="blog-content">
            <h3>{blogData[currentIndex].title}</h3>
            <p>{blogData[currentIndex].description}</p>
          </div>
        </div>
        <button className="slider-btn next" onClick={nextSlide} aria-label="Next blog post">
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="blog-indicators">
        {blogData.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to blog post ${index + 1}`}
          ></span>
        ))}
      </div>
    </div>
  );
};