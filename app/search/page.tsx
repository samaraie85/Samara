'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import ProductCard from '../shared_components/ProductCard';
import styles from './search.module.css';
import Navbar from '../shared_components/Navbar';

interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    discount_price?: number;
    categoryName: string;
    qty_per_unit: number;
    unitName: string;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!query.trim()) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                const allProducts = data.products || [];

                // Filter products based on search query
                const filteredProducts = allProducts.filter((product: Product) =>
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.categoryName.toLowerCase().includes(query.toLowerCase())
                );

                setProducts(filteredProducts);
            } catch (err) {
                setError('Failed to load search results');
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    if (loading) {
        return (
            <div className={styles.searchPage}>
                <Navbar />

                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Searching for &quot;{query}&quot;...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.searchPage}>
                <Navbar />

                <div className={styles.error}>
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.searchPage}>
            <Navbar />

            <div className={styles.searchHeader}>
                <h1>Search Results</h1>
                {query && (
                    <p className={styles.searchQuery}>
                        Showing results for: <strong>{query}</strong>
                    </p>
                )}

                {!loading && products.length === 0 && query && (
                    <div className={styles.noResults}>
                        <h2>No products found</h2>
                        <p>Try searching with different keywords or browse our categories.</p>
                    </div>
                )}

                {products.length > 0 && (
                    <div className={styles.productsGrid}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className={styles.searchPage}>
                <Navbar />
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
} 