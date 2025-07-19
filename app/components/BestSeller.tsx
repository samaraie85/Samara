"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './BestSeller.module.css';
import loadingGif from '../assets/loading_1.gif';
import { useAuth } from '@/lib/authContext';
import ProductCard from '../shared_components/ProductCard';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Define interfaces
interface Product {
    id: number;
    name: string;
    price: number;
    discount_price: number;
    image: string;
    category: number;
    categoryName: string;
    qty_per_unit: number;
    unitName: string;
}

const BestSeller = () => {
    // State for products and UI
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    // Fetch best selling products
    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);

                // Fetch products from API route - adjust endpoint as needed
                const response = await fetch('/api/products/bestsellers');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch best sellers');
                }

                const data = await response.json();
                setProducts(data.products);
            } catch (error) {
                console.error('Error fetching best sellers:', error);
                setError(error instanceof Error ? error.message : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

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

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
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

    return (
        <section className={styles.bestSeller} >
            <h1 className={styles.sectionTitle} data-aos="fade-right">
                <span className={styles.best}>Best</span> Seller
            </h1>

            <div className={styles.productSlider}>
                <button className={styles.sliderButton} data-aos="fade-right" aria-label="Previous">
                    <FontAwesomeIcon icon={faChevronLeft} className={styles.sliderIcon} />
                </button>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Image
                            src={loadingGif}
                            alt="Loading products..."
                            width={80}
                            className={styles.loadingGif}
                        />
                    </div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <div className={styles.productGrid} >
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCartSync}
                                data-aos="fade-up"
                            />
                        ))}
                    </div>
                )}

                <button className={styles.sliderButton} data-aos="fade-left" aria-label="Next">
                    <FontAwesomeIcon icon={faChevronRight} className={styles.sliderIcon} />
                </button>
            </div>
        </section>
    );
};

export default BestSeller; 