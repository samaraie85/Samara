'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './authContext';
import { wishlistOperations } from './supabase';

// Define wishlist item type
type WishlistItem = {
    id?: number;
    product: number;
    products: {
        id: number;
        name: string;
        image: string;
        price: number;
    };
};

// Define wishlist context type
type WishlistContextType = {
    wishlistItems: WishlistItem[];
    loading: boolean;
    error: string | null;
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    refreshWishlist: () => Promise<void>;
};

// Create the wishlist context with default values
const WishlistContext = createContext<WishlistContextType>({
    wishlistItems: [],
    loading: false,
    error: null,
    addToWishlist: async () => { },
    removeFromWishlist: async () => { },
    isInWishlist: () => false,
    refreshWishlist: async () => { },
});

// Custom hook to use the wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Wishlist provider component
export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, user } = useAuth();

    // Refresh wishlist items
    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setError('User not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data } = await wishlistOperations.getWishlist();

            setWishlistItems(data || []);
        } catch (err: unknown) {
            console.error('Error fetching wishlist:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlist';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch wishlist items when user authenticates
    useEffect(() => {
        if (isAuthenticated && user) {
            refreshWishlist();
        } else {
            // Clear wishlist if user logs out
            setWishlistItems([]);
        }
    }, [isAuthenticated, user, refreshWishlist]);

    // Add item to wishlist
    const addToWishlist = async (productId: number) => {
        if (!isAuthenticated) {
            setError('User not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await wishlistOperations.addToWishlist(productId.toString());

            // Refresh the wishlist to get updated data
            await refreshWishlist();

        } catch (err: unknown) {
            console.error('Error adding to wishlist:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add item to wishlist';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Remove item from wishlist
    const removeFromWishlist = async (productId: number) => {
        if (!isAuthenticated) {
            setError('User not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await wishlistOperations.removeFromWishlist(productId.toString());

            // Update the local state
            setWishlistItems(wishlistItems.filter(
                item => item.product !== productId
            ));

        } catch (err: unknown) {
            console.error('Error removing from wishlist:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from wishlist';
            setError(errorMessage);

            // Refresh to ensure consistency
            await refreshWishlist();
        } finally {
            setLoading(false);
        }
    };

    // Check if a product is in the wishlist
    const isInWishlist = (productId: number): boolean => {
        return wishlistItems.some(item => item.product === productId);
    };

    const value = {
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}; 