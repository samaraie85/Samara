"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hotdeals.module.css';
import { faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    savings: number;
}

const Hotdeals = () => {
    // State for products and UI
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    // Fetch hot deals products
    useEffect(() => {
        const fetchHotDeals = async () => {
            try {
                setLoading(true);

                // Fetch products from API route
                const response = await fetch('/api/products/hotdeals');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch hot deals');
                }

                const data = await response.json();
                setProducts(data.products);
            } catch (error) {
                console.error('Error fetching hot deals:', error);
                setError(error instanceof Error ? error.message : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchHotDeals();
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
        <section className={styles.hotdeals}>
            <div className={styles.hotdealsContent}>
                <h1 className={styles.sectionTitle} data-aos="fade-right">
                    <FontAwesomeIcon icon={faStar} className={styles.starIcon} style={{ color: "#FFD700", fontSize: "1.2rem" }} />
                    <span>Hot</span> Deals
                </h1>
                <Link data-aos="fade-left" className={styles.viewAll} href="/category/hot-deals">View All <FontAwesomeIcon className={styles.arrowIcon} icon={faArrowRight} /></Link>
            </div>
            <div className={styles.hotdealsProducts}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Image
                            src={loadingGif}
                            alt="Loading hot deals..."
                            width={80}
                            className={styles.loadingGif}
                        />
                    </div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : products.length === 0 ? (
                    <div className={styles.noProducts}>No hot deals available at the moment</div>
                ) : (
                    <div className={styles.productGrid}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCartSync}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Hotdeals; 