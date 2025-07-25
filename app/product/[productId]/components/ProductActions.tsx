import styles from './ProductDetail.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface ProductActionsProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onAddToCart: () => void;
    productId: string;
    userId?: string;
}

const ProductActions = ({ quantity, onIncrement, onDecrement, onAddToCart, productId, userId }: ProductActionsProps) => {
    const canDecrement = quantity > 1;
    const router = useRouter();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const checkWishlistStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/wishlist/check?userId=${userId}&productId=${productId}`);
            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.isInWishlist);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    }, [userId, productId]);

    // Check if product is in wishlist on component mount
    useEffect(() => {
        if (userId && productId) {
            checkWishlistStatus();
        }
    }, [userId, productId, checkWishlistStatus]);

 

    const toggleWishlist = async () => {
        if (!userId) {
            // Redirect to login if user is not authenticated
            window.location.href = '/login?redirect=back';
            return;
        }

        setWishlistLoading(true);
        try {
            const endpoint = isInWishlist ? '/api/wishlist/remove' : '/api/wishlist/add';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    userId,
                }),
            });

            if (response.ok) {
                setIsInWishlist(!isInWishlist);
                // You can add a toast notification here
                console.log(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
            } else {
                console.error('Failed to update wishlist');
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleBuyNow = async () => {
        try {
            await onAddToCart();
            router.push('/shopping-cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Still navigate even if there's an error
            router.push('/shopping-cart');
        }
    };

    return (

        <div className={styles.actionsSection}>
          
            <div className={styles.quantityContainer}>
                <span className={styles.quantityLabel}>Quantity</span>
                <div className={styles.quantityControls}>
                    <button
                        className={`${styles.quantityBtn} ${styles.decrementBtn} ${!canDecrement ? styles.disabled : ''}`}
                        onClick={onDecrement}
                        disabled={!canDecrement}
                        aria-label="Decrease quantity"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                    </button>

                    <span className={styles.quantityValue}>{quantity}</span>

                    <button
                        className={`${styles.quantityBtn} ${styles.incrementBtn}`}
                        onClick={onIncrement}
                        aria-label="Increase quantity"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button className={`${styles.actionBtn} ${styles.pointsBtn}`}>
                    Buy With Points <span className={styles.pointsIcon}>
                        <svg width="25" height="22" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.42394 16C6.53394 15.51 6.33394 14.81 5.98394 14.46L3.55394 12.03C2.79394 11.27 2.49394 10.46 2.71394 9.76C2.94394 9.06 3.65394 8.58 4.71394 8.4L7.83394 7.88C8.28394 7.8 8.83394 7.4 9.04394 6.99L10.7639 3.54C11.2639 2.55 11.9439 2 12.6839 2C13.4239 2 14.1039 2.55 14.6039 3.54L16.3239 6.99C16.4539 7.25 16.7239 7.5 17.0139 7.67L6.24394 18.44C6.10394 18.58 5.86394 18.45 5.90394 18.25L6.42394 16Z" fill="white" />
                            <path d="M19.3844 14.4599C19.0244 14.8199 18.8244 15.5099 18.9444 15.9999L19.6344 19.0099C19.9244 20.2599 19.7444 21.1999 19.1244 21.6499C18.8744 21.8299 18.5744 21.9199 18.2244 21.9199C17.7144 21.9199 17.1144 21.7299 16.4544 21.3399L13.5244 19.5999C13.0644 19.3299 12.3044 19.3299 11.8444 19.5999L8.91437 21.3399C7.80437 21.9899 6.85437 22.0999 6.24437 21.6499C6.01437 21.4799 5.84437 21.2499 5.73438 20.9499L17.8944 8.7899C18.3544 8.3299 19.0044 8.1199 19.6344 8.2299L20.6444 8.3999C21.7044 8.5799 22.4144 9.0599 22.6444 9.7599C22.8644 10.4599 22.5644 11.2699 21.8044 12.0299L19.3844 14.4599Z" fill="white" />
                        </svg>
                    </span>
                </button>

                <button
                    className={`${styles.actionBtn} ${styles.buyNowBtn}`}
                    onClick={handleBuyNow}
                >
                    Buy Now <span className={styles.moonIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_160_1295)">
                                <path d="M8.93122 12C8.93119 9.50831 9.91749 7.11788 11.6746 5.35115C13.4317 3.58442 15.8167 2.58506 18.3084 2.57146C16.6225 1.50967 14.6829 0.919294 12.6914 0.861817C10.6999 0.804339 8.72937 1.28187 6.98512 2.24466C5.24087 3.20746 3.78666 4.6203 2.77394 6.33606C1.76123 8.05181 1.22705 10.0077 1.22705 12C1.22705 13.9924 1.76123 15.9483 2.77394 17.664C3.78666 19.3798 5.24087 20.7926 6.98512 21.7554C8.72937 22.7182 10.6999 23.1957 12.6914 23.1383C14.6829 23.0808 16.6225 22.4904 18.3084 21.4286C15.8167 21.415 13.4317 20.4157 11.6746 18.6489C9.91749 16.8822 8.93119 14.4918 8.93122 12Z" fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.1198 6.92578L19.6798 10.0286H22.7827L20.4513 12.4286L21.1884 15.8572L18.1198 14.1429L15.1884 15.8572L15.8055 12.4286L13.4741 10.0286H16.577L18.1198 6.92578Z" fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_160_1295">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </span>
                </button>
            </div>

            <div className={styles.cartWishlistRow}>
                <button
                    className={styles.addToCartBtn}
                     onClick={onAddToCart}
                >
                    Add To Cart
                </button>

                <button
                    className={`${styles.wishlistBtn} ${isInWishlist ? styles.inWishlist : ''}`}
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <FontAwesomeIcon
                        icon={isInWishlist ? faHeartBroken : faHeart}
                        className={styles.wishlistIcon}
                    />
                    {wishlistLoading ? '...' : (isInWishlist ? 'Remove' : 'Wishlist')}
                </button>
            </div>

        </div>
    );
};

export default ProductActions; 