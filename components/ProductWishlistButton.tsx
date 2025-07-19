'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { useWishlist } from '@/lib/wishlistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

type ProductWishlistButtonProps = {
    productId: number;
    className?: string;
};

const ProductWishlistButton: React.FC<ProductWishlistButtonProps> = ({ productId, className = '' }) => {
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();

    const inWishlist = isInWishlist(productId);

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Redirect to login or show login prompt
            window.location.href = '/login?redirect=back';
            return;
        }

        if (loading) return;

        if (inWishlist) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    return (
        <button
            onClick={handleToggleWishlist}
            className={`wishlist-btn ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <FontAwesomeIcon
                icon={inWishlist ? solidHeart : regularHeart}
                className={`transition-all ${inWishlist ? 'text-red-500' : 'text-gray-500'}`}
            />
        </button>
    );
};

export default ProductWishlistButton; 