'use client'
import React, { useEffect, useState, useMemo } from 'react';
import styles from '../profile.module.css';
import { User } from '@supabase/supabase-js';
import ProductCard from '@/app/shared_components/ProductCard';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import loadinga from '../../assets/loading_1.gif';

interface MyWishlistProps {
    user: User;
}

interface WishlistProduct {
    product: string;
    products: {
        id: number;
        name: string;
        image: string;
        price: number;
        discount_price?: number;
        qty_per_unit: number;
        unitName?: string;
        categoryName?: string;
    };
}

const PRODUCTS_PER_PAGE = 6;

const MyWishlist: React.FC<MyWishlistProps> = ({ user }) => {
    const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    }, [wishlist, currentPage]);
    useEffect(() => {
        const fetchWishlist = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/wishlist?userId=${user.id}`);
                const data = await response.json();
                if (response.ok) {
                    setWishlist(data.wishlist || []);
                } else {
                    setWishlist([]);
                }
            } catch {
                setWishlist([]);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchWishlist();
    }, [user]);

    // Filtered and mapped products for ProductCard
    const filteredProducts = useMemo(() => {
        const filtered = wishlist.filter(item =>
            item.products?.name?.toLowerCase().includes(search.toLowerCase())
        );

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            const priceA = a.products.discount_price && a.products.discount_price > 0
                ? a.products.discount_price
                : a.products.price;
            const priceB = b.products.discount_price && b.products.discount_price > 0
                ? b.products.discount_price
                : b.products.price;

            switch (sortOrder) {
                case 'highest':
                    return priceB - priceA;
                case 'lowest':
                    return priceA - priceB;
                case 'oldest':
                    // For oldest, we'll sort by product ID (assuming lower ID = older)
                    return a.products.id - b.products.id;
                case 'newest':
                default:
                    // For newest, we'll sort by product ID (assuming higher ID = newer)
                    return b.products.id - a.products.id;
            }
        });

        return sorted.map(item => ({
            id: item.products.id,
            name: item.products.name,
            image: item.products.image,
            price: item.products.price,
            discount_price: item.products.discount_price,
            qty_per_unit: item.products.qty_per_unit,
            unitName: item.products.unitName || '',
            categoryName: item.products.categoryName || '',
        }));
    }, [wishlist, search, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    // Reset to first page on search or sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, sortOrder]);

    if (loading) return <div className={styles.loading}><Image src={loadinga} alt="loading" width={100} height={100} /></div>;

    return (
        <div data-aos="fade-up">
            <div className={styles.wishlistSearchRow}>
                <input
                    type="text"
                    className={styles.wishlistSearchInput}
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className={styles.wishlistSortSelect}
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Price</option>
                    <option value="lowest">Lowest Price</option>
                </select>
            </div>
            {filteredProducts.length === 0 ? (
                <div data-aos="fade-in" className={styles.emptyState}>No wishlist items found.</div>
            ) : (
                <>
                    <div data-aos="fade-up" className={styles.wishlistGrid}>
                        {paginatedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div data-aos="fade-up" className={styles.pagination}>
                            <button
                                className={styles.paginationArrow}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                // Show first, last, current, and neighbors
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`${styles.paginationBtn} ${currentPage === pageNum ? styles.activePage : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
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
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyWishlist; 