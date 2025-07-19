'use client'

import Link from 'next/link';
import styles from './SimilarProducts.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import loadingGif from '../../../assets/loading_1.gif';
import { useAuth } from '@/lib/authContext';
import ProductCard from '@/app/shared_components/ProductCard';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface SimilarProductsProps {
    category: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: number;
    categoryName: string;
    min_qty: number;
    unitName: string;
    description: string;
    qty_per_unit: number;
}

const SimilarProducts = ({ category }: SimilarProductsProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    // Fetch similar products
    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    limit: '8',
                    categoryIds: category
                });

                const response = await fetch(`/api/products?${params.toString()}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch similar products');
                }

                const data = await response.json();
                setProducts(data.products);
            } catch (error) {
                console.error('Error fetching similar products:', error);
                setError(error instanceof Error ? error.message : 'Failed to load similar products');
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarProducts();
    }, [category]);

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

    if (loading) {
        return (
            <section className={styles.similarProducts}>
                <div className={styles.similarProductsContainer}>
                    <h1 data-aos="fade-right"><span>Similar</span> Products</h1>
                </div>
                <div className={styles.similarProductsList}>
                    <div className={styles.loadingContainer}>
                        <Image
                            src={loadingGif}
                            alt="Loading similar products..."
                            width={100}
                            className={styles.loadingGif}
                        />
                        <p>Loading Similar Products...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.similarProducts}>
                <div className={styles.similarProductsContainer}>
                    <h1><span>Similar</span> Products</h1>
                </div>
                <div className={styles.error}>Error: {error}</div>
            </section>
        );
    }

    return (
        <section className={styles.similarProducts}>
            <div className={styles.similarProductsContainer}>
                <h1 data-aos="fade-right"><span>Similar</span> Products</h1>
                <Link data-aos="fade-left" href={`/category/${category}`} className={styles.viewAll}>View All <span><FontAwesomeIcon icon={faArrowRight} /></span></Link>
            </div>
            <div className={styles.similarProductsList}>
                {products.length === 0 ? (
                    <div className={styles.noProductsFound}>
                        <p>No similar products found.</p>
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
        </section>
    );
};

export default SimilarProducts; 