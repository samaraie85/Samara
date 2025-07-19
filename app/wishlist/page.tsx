'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useWishlist } from '@/lib/wishlistContext';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/shared_components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { checkAuthStatus } from '@/lib/supabase';
import { DebugInfo } from 'next/dist/client/components/react-dev-overlay/types';

export default function WishlistPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        wishlistItems,
        loading: wishlistLoading,
        error,
        removeFromWishlist,
        refreshWishlist
    } = useWishlist();

    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [showDebug, setShowDebug] = useState(false);

    const checkAuth = async () => {
        const status = await checkAuthStatus();
        setDebugInfo(status as unknown as DebugInfo);
        setShowDebug(true);
    };

    useEffect(() => {
        // Redirect if not authenticated and not loading
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/wishlist');
        }

        // Refresh wishlist when component mounts
        if (isAuthenticated) {
            refreshWishlist();
        }
    }, [isAuthenticated, authLoading, router, refreshWishlist]);

    const handleRemoveItem = async (productId: number) => {
        await removeFromWishlist(productId);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

                {wishlistLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                        <div className="mt-2">
                            <button
                                onClick={checkAuth}
                                className="text-sm underline hover:no-underline"
                            >
                                Check Authentication Status
                            </button>
                        </div>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                        <Link
                            href="/shop"
                            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.product} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <Link href={`/product/${item.product}`} className="block relative">
                                    <div className="aspect-square relative">
                                        {item.products.image ? (
                                            <Image
                                                src={item.products.image}
                                                alt={item.products.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">{item.products.name}</h3>
                                        <p className="text-gray-600 mb-4">${item.products.price.toFixed(2)}</p>

                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={`/product/${item.product}`}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRemoveItem(item.product);
                                                }}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                                aria-label="Remove from wishlist"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {showDebug && debugInfo && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-bold">Debug Info</h3>
                            <button
                                onClick={() => setShowDebug(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                        <pre className="text-xs overflow-auto bg-gray-800 text-white p-4 rounded">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <button
                        onClick={checkAuth}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Check Authentication
                    </button>
                </div>
            </div>
        </div>
    );
} 