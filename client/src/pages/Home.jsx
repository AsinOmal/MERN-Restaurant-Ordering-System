import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">🍔</span> FoodFlow
                    </div>
                    <h1>
                        Quickest <span className="highlight-text">Food</span><br />
                        <span className="highlight-text">Delivery</span> in Town
                    </h1>
                    <p className="hero-description">
                        We will deliver your food within 30 minutes in your town,
                        If we would fail, we will give the food free.
                    </p>
                    <div className="hero-actions">
                        <Link to="/restaurants" className="btn-primary-lg">Order your Food</Link>
                        <Link to="/restaurants" className="btn-secondary-lg">View Restaurants</Link>
                    </div>

                    <div className="hero-social-proof">
                        <div className="trust-badge">
                            <span className="gold-medal">🥇</span>
                            <div>
                                <strong>#1 National Food Service</strong>
                                <p>2021 Best Service Award</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-image-container">
                    <img src="/assets/hero-plate.png" alt="Delicious Food" className="hero-main-image" />
                    {/* Floating Food Elements */}
                    <img src="/assets/floating-burger.png" alt="Burger" className="floating-food burger-float" />
                    <img src="/assets/floating-fries.png" alt="Fries" className="floating-food fries-float" />
                    <img src="/assets/floating-pizza.png" alt="Pizza" className="floating-food pizza-float" />
                    <div className="floating-element leaf-1">🍃</div>
                    <div className="floating-element chili-1">🌶️</div>
                </div>
            </section>

            {/* Popular Categories */}
            <section className="categories-section">
                <div className="section-header">
                    <h2>Customer Favorites</h2>
                    <span className="subtitle">Popular Categories</span>
                </div>
                <div className="categories-grid">
                    <div className="category-card">
                        <div className="category-image-wrapper">
                            <img src="/assets/category-pizza.png" alt="Pizza" className="category-image" />
                        </div>
                        <h3>Pizza</h3>
                        <p>Starting at $12</p>
                    </div>
                    <div className="category-card">
                        <div className="category-image-wrapper">
                            <img src="/assets/category-burger.png" alt="Burger" className="category-image" />
                        </div>
                        <h3>Burger</h3>
                        <p>Starting at $8</p>
                    </div>
                    <div className="category-card">
                        <div className="category-image-wrapper">
                            <img src="/assets/category-sushi.png" alt="Sushi" className="category-image" />
                        </div>
                        <h3>Sushi</h3>
                        <p>Starting at $15</p>
                    </div>
                    <div className="category-card">
                        <div className="category-image-wrapper">
                            <img src="/assets/category-asian.png" alt="Asian" className="category-image" />
                        </div>
                        <h3>Asian</h3>
                        <p>Starting at $10</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section">
                <div className="section-header center">
                    <span className="subtitle">How It Works</span>
                    <h2>Easy Steps</h2>
                </div>
                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">01</div>
                        <h3>Choose your favorite food</h3>
                        <p>Browse through our extensive menu of delicious dishes.</p>
                    </div>
                    <div className="step-arrow">➝</div>
                    <div className="step-item">
                        <div className="step-number">02</div>
                        <h3>Pay securely online</h3>
                        <p>Quick and secure payment methods for your convenience.</p>
                    </div>
                    <div className="step-arrow">➝</div>
                    <div className="step-item">
                        <div className="step-number">03</div>
                        <h3>Enjoy your meal</h3>
                        <p>Food is delivered hot and fresh to your doorstep.</p>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section className="contact-section">
                <div className="contact-content">
                    <div className="contact-info">
                        <span className="subtitle">Contact Us</span>
                        <h2>Get in Touch</h2>
                        <p>Have questions or feedback? We'd love to hear from you. Reach out to our team.</p>

                        <div className="contact-details">
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <strong>Location</strong>
                                    <p>123 Food Street, Tasty Town, FL 321</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <strong>Email</strong>
                                    <p>support@foodflow.com</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <strong>Phone</strong>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form">
                        <div className="form-group">
                            <input type="text" placeholder="Your Name" required />
                        </div>
                        <div className="form-group">
                            <input type="email" placeholder="Your Email" required />
                        </div>
                        <div className="form-group">
                            <textarea placeholder="Your Message" rows="4" required></textarea>
                        </div>
                        <button type="submit" className="btn-primary-lg" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>Send Message</button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
