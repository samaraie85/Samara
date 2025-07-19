"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Products.module.css';
import loadingGif from '../../../assets/loading_1.gif'; // Fallback image
import { useAuth } from '@/lib/authContext';
import ProductCard from '@/app/shared_components/ProductCard';
import AOS from 'aos';
import 'aos/dist/aos.css';
import VegetablesPopup from './VegetablesPopup';
import NewsletterDialog from '@/app/shared_components/NewsletterDialog';

// Define interfaces
interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: number;
    categoryName: string;
    min_qty: number;
    discount_price: number;
    unitName: string;
    qty_per_unit: number;
}

interface Category {
    id: number;
    name: string;
}



interface ProductsProps {
    categoryId: string;
}

const Products = ({ categoryId }: ProductsProps) => {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Start with no categories selected
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const [tempMinPrice, setTempMinPrice] = useState(0);
    const [tempMaxPrice, setTempMaxPrice] = useState(500);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 9;
    const { isAuthenticated, user } = useAuth();
    const [showVegetablesPopup, setShowVegetablesPopup] = useState(false);
    const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);

    // Fetch products from API route
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Build query params
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: productsPerPage.toString(),
                    minPrice: minPrice.toString(),
                    maxPrice: maxPrice.toString()
                });

                // Add category filter if selected
                if (selectedCategories.length > 0) {
                    params.append('categoryIds', selectedCategories.join(','));
                }

                // Fetch products from API route
                const response = await fetch(`/api/products/hotdeals?${params.toString()}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data.products);
                setTotalPages(data.pagination.totalPages);
                setTotalProducts(data.pagination.total);

            } catch (error) {
                console.error('Error fetching products:', error);
                setError(error instanceof Error ? error.message : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, selectedCategories, minPrice, maxPrice, currentPage]);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    // Fetch categories from API route
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories/all');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch categories');
                }

                const data = await response.json();
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

        // Check if current category is vegetables and show popup
        useEffect(() => {

            // Check if any selected category from filter is vegetables
            const isSelectedCategoryVegetables = selectedCategories.some(categoryId => {
                const category = categories.find(cat => cat.id === categoryId);
                return category && category.name.toLowerCase() === 'vegetables';
            });
    
            if ((isSelectedCategoryVegetables) && !loading) {
                // Add a small delay to ensure the page is fully loaded
                const timer = setTimeout(() => {
                    setShowVegetablesPopup(true);
                }, 1000);
    
                return () => clearTimeout(timer);
            }
        }, [selectedCategories, categories, loading]);
        
    // Toggle category selection
    const toggleCategory = (categoryId: number) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Apply price filter
    const applyPriceFilter = () => {
        setMinPrice(tempMinPrice);
        setMaxPrice(tempMaxPrice);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Add to cart
    const handleAddToCart = async (product: Product) => {
        try {
            if (!isAuthenticated || !user) {
                window.location.href = '/login?redirect=back';
                return;
            }

            // Call API route to add item to cart
            const response = await fetch(`/api/cart/add?user=${user.id}&product=${product.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add item to cart');
            }

            console.log(`Added ${product.name} to cart`);
            // You could add a toast notification here instead of alert

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Add to cart (sync wrapper for ProductCard)
    const handleAddToCartSync = (product: {
        id: number;
        name: string;
        image: string;
        categoryName: string;
        price: number;
        qty_per_unit: number;
        unitName: string;
        discount_price?: number;
    }) => {
        const fullProduct = products.find(p => p.id === product.id);
        if (fullProduct) {
            handleAddToCart(fullProduct);
        }
    };

    // Fix the loading state by properly returning the loading UI
    if (loading && products.length === 0) {
        return (
            <div className={styles.productsSection}>
                <div className={styles.productsHeader}>
                    <h2 data-aos="fade-right" className={styles.productsTitle}>
                        All <span className={styles.categoryName}>Products</span> <span className={styles.productCount}>({totalProducts} Products)</span>
                    </h2>
                </div>

                <div className={styles.productsContainer}>
                    <div className={styles.categoriesLoading}>
                        <Image
                            src={loadingGif}
                            alt="Loading products..."
                            width={100}
                            className={styles.loadingGif}
                        />
                        <p>Loading Products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.productsSection}>
            <div data-aos="fade-right" className={styles.productsHeader}>
                <h2 data-aos="fade-right" className={styles.productsTitle}>
                    All <span className={styles.categoryName}>Products</span> <span className={styles.productCount}>({totalProducts} Products)</span>
                </h2>
            </div>

            <div className={styles.productsContainer}>
                <div className={styles.productsList}>
                    {loading ? (
                        <div className={styles.productsLoadingOverlay}>
                            <Image
                                src={loadingGif}
                                alt="Updating products..."
                                width={80}
                                className={styles.loadingGif}
                            />
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.noProductsFound}>
                            <p>No products found matching your criteria.</p>
                        </div>
                    ) : (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCartSync}
                            />
                        ))
                    )}
                </div>

                <div data-aos="fade-left" className={styles.filterSection}>
                    <div className={styles.filterCard}>
                        <h3 className={styles.filterTitle}>Filter</h3>

                        <div className={styles.filterGroup}>
                            <h4 className={styles.filterSubtitle}>Category:</h4>
                            <div className={styles.categoryButtons}>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        className={`${styles.categoryBtn} ${selectedCategories.includes(category.id) ? styles.active : ''}`}
                                        onClick={() => toggleCategory(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h4 className={styles.filterSubtitle}>Price:</h4>
                            <div className={styles.priceFilter}>
                                <div className={styles.priceInputs}>
                                    <div className={styles.priceInput}>
                                        <label>Min: €</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={tempMaxPrice}
                                            value={tempMinPrice}
                                            onChange={(e) => setTempMinPrice(Math.min(parseInt(e.target.value) || 0, tempMaxPrice))}
                                            className={styles.numberInput}
                                        />
                                    </div>
                                    <div className={styles.priceInput}>
                                        <label>Max: €</label>
                                        <input
                                            type="number"
                                            min={tempMinPrice}
                                            max="10000"
                                            value={tempMaxPrice}
                                            onChange={(e) => setTempMaxPrice(Math.max(parseInt(e.target.value) || 0, tempMinPrice))}
                                            className={styles.numberInput}
                                        />
                                    </div>
                                </div>
                                <div className={styles.rangeSlider}>
                                    <div
                                        className={styles.priceRangeTrack}
                                        style={{
                                            left: `${(tempMinPrice / 1000) * 100}%`,
                                            width: `${((tempMaxPrice - tempMinPrice) / 1000) * 100}%`
                                        }}
                                    ></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={tempMinPrice}
                                        onChange={(e) => setTempMinPrice(Math.min(parseInt(e.target.value), tempMaxPrice))}
                                        className={styles.slider}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={tempMaxPrice}
                                        onChange={(e) => setTempMaxPrice(Math.max(parseInt(e.target.value), tempMinPrice))}
                                        className={styles.slider}
                                    />
                                    <div className={styles.priceLabels}>
                                        <span>€{tempMinPrice}</span>
                                        <span>€{tempMaxPrice}</span>
                                    </div>
                                </div>
                                <button
                                    className={styles.applyFilterBtn}
                                    onClick={applyPriceFilter}
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.paginationArrow}
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        // Show first page, last page, current page and 1 page on each side
                        if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={pageNum}
                                    className={`${styles.paginationBtn} ${currentPage === pageNum ? styles.activePage : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        } else if (
                            (pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                            return <span key={pageNum} className={styles.paginationEllipsis}>...</span>;
                        }
                        return null;
                    })}

                    <button
                        className={styles.paginationArrow}
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            )}


            {/* Vegetables Popup */}
            <VegetablesPopup
                isOpen={showVegetablesPopup}
                onClose={() => setShowVegetablesPopup(false)}
                onNewsletterSignup={() => setShowNewsletterDialog(true)}
            />

            {/* Newsletter Dialog */}
            <NewsletterDialog
                isOpen={showNewsletterDialog}
                onClose={() => setShowNewsletterDialog(false)}
            />
        </div>
    );
};

export default Products; 