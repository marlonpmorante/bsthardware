import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import "./AuthForm.css";
import "./Cart.css";
import bbImage from "./bb.jpg";
import { AdminDashboard } from "./Admin";
import AuthForm from "./AuthForm";
import Cart from "./Cart";
import LogoutModal from "./Logout"; // Import the new LogoutModal component

// Import product images
import cementImage from "./cement.jpg";
import sandImage from "./sand.jpg";
import hollow_blocksImage from "./hollow_blocks.jpg";
import woodImage from "./wood.jpg";
import steel_barsImage from "./steel_bars.jpg";
import nailsImage from "./nails.jpg";
import screwsImage from "./screws.jpg";
import paintImage from "./paint.jpg";
import thinnerImage from "./thinner.jpg";
import brushImage from "./brush.jpg";
import rollerImage from "./roller.jpg";
import masking_tape from "./masking_tape.jpg";
import pvc_pipesImage from "./pvc_pipes.jpg";
import faucetImage from "./faucet.jpg";
import fittingsImage from "./fittings.jpg";
import sealantImage from "./sealant.jpg";
import wiresImage from "./wires.jpg";
import switchImage from "./switch.jpg";
import outletImage from "./outlet.jpg";
import breakerImage from "./breaker.jpg";
import light_bulbsImage from "./light_bulbs.jpg";
import batteryImage from "./battery.jpg";
import door_knobsImage from "./door_knobs.jpg";
import hingesImage from "./hinges.jpg";
import padlockImage from "./padlock.jpg";
import shelvesImage from "./shelves.jpg";
import drillsImage from "./drills.jpg";
import grindersImage from "./grinders.jpg";
import sawsImage from "./saws.jpg";
import welding_machinesImage from "./welding_machines.jpg";
import hammersImage from "./hammers.jpg";
import wrenchImage from "./wrench.jpg";
import screwdsImage from "./screwds.jpg";
import pliersImage from "./pliers.jpg";
import measuring_tapeImage from "./measuring_tape.jpg";

import {
  Home,
  Box,
  Info,
  Phone,
  Search,
  X,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const imageMap = {
  Cement: cementImage,
  Sand: sandImage,
  "Hollow Blocks": hollow_blocksImage,
  Wood: woodImage,
  "Steel Bars": steel_barsImage,
  Nails: nailsImage,
  Screws: screwsImage,
  Paint: paintImage,
  Thinner: thinnerImage,
  Brush: brushImage,
  Roller: rollerImage,
  "Masking Tape": masking_tape,
  "PVC Pipes": pvc_pipesImage,
  Faucet: faucetImage,
  Fittings: fittingsImage,
  Sealant: sealantImage,
  Wires: wiresImage,
  Switch: switchImage,
  Outlet: outletImage,
  Breaker: breakerImage,
  "Light Bulb": light_bulbsImage,
  Battery: batteryImage,
  "Door Knobs": door_knobsImage,
  Hinges: hingesImage,
  Padlocks: padlockImage,
  Shelves: shelvesImage,
  Drills: drillsImage,
  Grinders: grindersImage,
  Saws: sawsImage,
  "Welding Machines": welding_machinesImage,
  Hammer: hammersImage,
  Wrench: wrenchImage,
  Screwdriver: screwdsImage,
  Pliers: pliersImage,
  "Measuring Tape": measuring_tapeImage,
};

const productData = [
  {
    category: "Construction Materials",
    items: [
      { id: 1, name: "Cement", price: 350 },
      { id: 2, name: "Sand", price: 1500 },
      { id: 3, name: "Hollow Blocks", price: 15 },
      { id: 4, name: "Wood", price: 80 },
      { id: 5, name: "Steel Bars", price: 1200 },
      { id: 6, name: "Nails", price: 100 },
      { id: 7, name: "Screws", price: 150 },
    ],
  },
  {
    category: "Paint & Finishing",
    items: [
      { id: 8, name: "Paint", price: 750 },
      { id: 9, name: "Thinner", price: 200 },
      { id: 10, name: "Brush", price: 80 },
      { id: 11, name: "Roller", price: 150 },
      { id: 12, name: "Masking Tape", price: 60 },
    ],
  },
  {
    category: "Plumbing Tools",
    items: [
      { id: 13, name: "PVC Pipes", price: 120 },
      { id: 14, name: "Faucet", price: 250 },
      { id: 15, name: "Fittings", price: 40 },
      { id: 16, name: "Sealant", price: 180 },
    ],
  },
  {
    category: "Electrical Tools",
    items: [
      { id: 17, name: "Wires", price: 950 },
      { id: 18, name: "Switch", price: 120 },
      { id: 19, name: "Outlet", price: 150 },
      { id: 20, name: "Breaker", price: 450 },
      { id: 21, name: "Light Bulb", price: 300 },
      { id: 22, name: "Battery", price: 100 },
    ],
  },
  {
    category: "Home Hardware",
    items: [
      { id: 23, name: "Door Knobs", price: 350 },
      { id: 24, name: "Hinges", price: 90 },
      { id: 25, name: "Padlocks", price: 200 },
      { id: 26, name: "Shelves", price: 1000 },
    ],
  },
  {
    category: "Power Tools",
    items: [
      { id: 27, name: "Drills", price: 2500 },
      { id: 28, name: "Grinders", price: 2000 },
      { id: 29, name: "Saws", price: 1800 },
      { id: 30, name: "Welding Machines", price: 6000 },
    ],
  },
  {
    category: "Hand Tools",
    items: [
      { id: 31, name: "Hammer", price: 250 },
      { id: 32, name: "Wrench", price: 300 },
      { id: 33, name: "Screwdriver", price: 120 },
      { id: 34, name: "Pliers", price: 180 },
      { id: 35, name: "Measuring Tape", price: 100 },
    ],
  },
];

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token") || !!localStorage.getItem("userToken"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New state for modal

  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const searchInputRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products. Please try again later.");
    }
  }, [setProducts, setError]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || userRole !== "user") return;
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      setCart(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Unable to load cart. Please try again later.");
    }
  }, [isAuthenticated, userRole, setCart, setError]);

  useEffect(() => {
    if (currentPage === "products" || currentPage === "adminDashboard" || (currentPage === "home" && products.length === 0)) {
      fetchProducts();
      if (currentPage === "products" && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
    if (isAuthenticated && userRole === "user") {
      fetchCart();
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserId(decoded.id);
        } catch (err) {
          console.error("Error decoding token:", err);
        }
      }
    }
    const role = localStorage.getItem("role");
    if (role) setUserRole(role);
  }, [currentPage, products.length, isAuthenticated, userRole, fetchProducts, fetchCart]);

  // Add an effect to navigate to products page on successful authentication for users
  useEffect(() => {
    if (isAuthenticated && userRole === "user" && currentPage === "auth") {
      setCurrentPage("products");
    }
  }, [isAuthenticated, userRole, currentPage]);

  const categorizedProducts = products.length > 0
    ? productData.map((defaultCategory) => {
        const matchedItems = products.filter((product) =>
          defaultCategory.items.some((item) => item.name === product.name)
        );
        const allItems = defaultCategory.items.map((defaultItem) => {
          const matched = matchedItems.find((item) => item.name === defaultItem.name);
          return {
            ...defaultItem,
            ...(matched ? { id: matched.id, price: matched.price, image_url: matched.image_url, category: matched.category } : {}),
          };
        });
        return {
          category: defaultCategory.category,
          items: allItems,
        };
      })
    : productData;

  const filteredData = categorizedProducts.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      (!selectedCategory || category.category === selectedCategory) &&
      item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ),
  }));

  const handleClearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCancel = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleLogout = async () => {
    if (userRole === "user") {
      try {
        const response = await fetch(`${API_URL}/cart/checkout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to clear cart");
      } catch (err) {
        console.error("Error clearing cart on logout:", err);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole("");
    setUserId(null);
    setCart([]);
    setCurrentPage("home");
    setIsLogoutModalOpen(false); // Close the modal after logout
  };

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage("products");
    setIsProductsDropdownOpen(false);
  };


  const HomePage = () => {
    const categoriesForCarousel = categorizedProducts.filter(cat => cat.items.length > 0);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    useEffect(() => {
      if (categoriesForCarousel.length === 0) return;

      const categoryInterval = setInterval(() => {
        setCurrentCategoryIndex((prev) => (prev + 1) % categoriesForCarousel.length);
      }, 5000);
      return () => clearInterval(categoryInterval);
    }, [categoriesForCarousel.length]);

    const nextCategorySlide = () => {
      setCurrentCategoryIndex((prev) => (prev + 1) % categoriesForCarousel.length);
    };

    const prevCategorySlide = () => {
      setCurrentCategoryIndex((prev) => (prev - 1 + categoriesForCarousel.length) % categoriesForCarousel.length);
    };

    return (
      <div className="home-container">
        <section className="hero">
          <h1>Welcome to BST Hardware Supply</h1>
          <p className="tagline">
            Your one-stop shop for high-quality construction materials, tools, and
            home improvement essentials. Whether you're a professional contractor
            or a DIY enthusiast, we're here to support your goals with top-notch
            products and customer service.
          </p>
        </section>

        {categoriesForCarousel.length > 0 && (
          <section className="product-carousel-section">
            <h2>Featured Products by Category: {categoriesForCarousel[currentCategoryIndex]?.category || ''}</h2>
            <div className="product-carousel-container">
              <button className="carousel-btn prev" onClick={prevCategorySlide}>
                <ChevronLeft size={24} />
              </button>
              <div className="all-categories-carousel-wrapper" style={{ transform: `translateX(-${currentCategoryIndex * 100}%)` }}>
                {categoriesForCarousel.map((category, catIdx) => (
                  <div key={category.category} className="product-carousel-category-slide">
                    {category.items.map((product) => (
                      <div key={product.id} className="product-card-carousel">
                        <div className="product-image-container-carousel">
                          <img
                            src={imageMap[product.name] || "/placeholder.jpg"}
                            alt={product.name}
                            className="product-image-carousel"
                          />
                        </div>
                        <div className="product-info-carousel">
                          <h3 className="product-name-carousel">{product.name}</h3>
                          <p className="product-category-carousel">
                            Category: {category.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <button className="carousel-btn next" onClick={nextCategorySlide}>
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="carousel-indicators">
              {categoriesForCarousel.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${index === currentCategoryIndex ? "active" : ""}`}
                  onClick={() => setCurrentCategoryIndex(index)}
                ></span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const ProductsPage = ({ setCart }) => {
    const addToCart = async (product) => {
      try {
        const response = await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add to cart");
        }
        const cartResponse = await fetch(`${API_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!cartResponse.ok) throw new Error("Failed to fetch cart");
        const cartData = await cartResponse.json();
        setCart(cartData);
        setError(null);
      } catch (err) {
        console.error("Error adding to cart:", err);
        setError(err.message || "Failed to add to cart. Please try again.");
      }
    };

    return (
      <div className="materials-container">
        <h2>
          Available Hardware Materials{" "}
          {selectedCategory ? `- ${selectedCategory}` : ""}
        </h2>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            ref={searchInputRef}
            className="search-bar"
            type="text"
            placeholder="Search for materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
          />
          {searchTerm && (
            <button className="clear-button" onClick={handleClearSearch}>
              <X size={16} />
            </button>
          )}
          {(searchTerm || selectedCategory) && (
            <button className="clear-button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
        {filteredData.map((category, idx) => (
          <div key={idx} className="category-section">
            <h3>{category.category}</h3>
            {category.items.length > 0 ? (
              <ul>
                {category.items.map((item) => (
                  <li key={item.id}>
                    <div className="product-image-container">
                      <img
                        src={imageMap[item.name] || "/placeholder.jpg"}
                        alt={item.name}
                        className="product-image"
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{item.name}</h4>
                      <p className="product-price">Price: ₱{item.price}</p>
                      {userRole !== "admin" && (
                        <button
                          className="add-to-cart-button"
                          onClick={() => addToCart(item)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">
                No products found in this category.
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const AboutPage = () => (
    <div className="page-content">
      <h2>About Us</h2>
      <p className="mission">
        At BST Hardware, we are dedicated to providing top-quality construction
        supplies and tools. Whether you're building, repairing, or upgrading, we're
        here to support you every step of the way.
      </p>
    </div>
  );

  const ContactPage = () => (
    <div className="page-content">
      <h2>Contact Us</h2>
      <ul className="features-list">
        <li>Smart: 09052569859</li>
        <li>Globe: 09985418625</li>
        <li>Email: bsthardware@gmail.com</li>
        <li>Address: Parang B.del Mundo, Mansalay, Oriental Mindoro</li>
      </ul>
    </div>
  );

  const ServicesPage = () => (
    <div className="page-content">
      <h2>Our Services</h2>
      <p>Free Shipping!</p>
    </div>
  );

  const SpecialOffersPage = () => (
    <div className="page-content">
      <h2>Special Offers</h2>
      <p>Discover our latest discounts and exclusive promotions on hardware supplies.</p>
    </div>
  );

  const ReviewsPage = () => (
    <div className="page-content">
      <h2>Customer Reviews</h2>
      <p>See what our satisfied customers are saying about their experiences with BST Hardware.</p>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <img src={bbImage} alt="BST Hardware Logo" className="logo" />
        <h1>BST Hardware Supply</h1>
        <nav className="navbar">
          <button onClick={() => setCurrentPage("home")}>
            <Home size={16} /> Home
          </button>
          {isAuthenticated && (
            <div className="dropdown">
              <button onClick={toggleProductsDropdown}>
                <Box size={16} /> Products <ChevronDown size={16} />
              </button>
              {isProductsDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => handleCategorySelect(null)}>All Products</button>
                  {categorizedProducts.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCategorySelect(cat.category)}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={() => setCurrentPage("about")}>
            <Info size={16} /> About Us
          </button>
          <button onClick={() => setCurrentPage("contact")}>
            <Phone size={16} /> Contact
          </button>
          {isAuthenticated && userRole !== "admin" && (
            <button onClick={() => setCurrentPage("cart")}>
              <ShoppingCart size={16} /> Cart ({cart.length})
            </button>
          )}
          {isAuthenticated ? (
            <>
              {userRole === "admin" && (
                <button onClick={() => setCurrentPage("adminDashboard")}>
                  <User size={16} /> Dashboard
                </button>
              )}
              <button onClick={() => setIsLogoutModalOpen(true)}> {/* Updated to open modal */}
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <button onClick={() => setCurrentPage("auth")}>
              <User size={16} /> Log In
            </button>
          )}
        </nav>
      </header>

      <main>
        {currentPage === "auth" && !isAuthenticated && (
          <AuthForm
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
            setUserRole={setUserRole}
          />
        )}
        {currentPage === "home" && <HomePage />}
        {currentPage === "products" && isAuthenticated && (
          <ProductsPage setCart={setCart} />
        )}
        {currentPage === "about" && <AboutPage />}
        {currentPage === "contact" && <ContactPage />}
        {currentPage === "services" && <ServicesPage />}
        {currentPage === "specialOffers" && <SpecialOffersPage />}
        {currentPage === "reviews" && <ReviewsPage />}
        {currentPage === "cart" && isAuthenticated && userRole !== "admin" && (
          <Cart
            cart={cart}
            setCart={setCart}
            imageMap={imageMap}
            userId={userId}
            setError={setError}
          />
        )}
        {currentPage === "adminDashboard" && isAuthenticated && userRole === "admin" && (
          <AdminDashboard
            products={products}
            setProducts={setProducts}
            error={error}
            setError={setError}
            handleLogout={handleLogout}
            fetchProducts={fetchProducts}
            imageMap={imageMap}
          />
        )}
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BST Hardware Supply</h3>
            <p>© 2025 BST Hardware Supply. All rights reserved.</p>
            <p>Parang B del Mundo, Mansalay, Oriental Mindoro</p>
          </div>
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <ul className="social-links">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;