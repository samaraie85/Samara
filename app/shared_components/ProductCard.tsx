'use client'
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import styles from './ProductCard.module.css';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        image: string;
        categoryName: string;
        price: number;
        qty_per_unit: number;
        unitName: string;
        discount_price?: number;
    };
    onAddToCart?: (product: ProductCardProps['product']) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
    const [showPopup, setShowPopup] = useState(false);
    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(product);
            setShowPopup(true);
        }
    };
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    }, []);

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 1800);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    return (
        <>
            {showPopup && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#4BB543" />
                            <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" fill="none" />
                        </svg>
                        <span>Added to cart!</span>
                    </div>
                </div>
            )}
            <Link href={`/product/${product.id}`} className={styles.productLink}>
                <div data-aos="fade-up" className={styles.container}>
                    <div className={styles.image_container}>
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={280}
                            height={150}
                            className={styles.productImage}
                        />
                        {/* <button
                            className={styles.wishlistButton}
                            aria-label="Add to wishlist"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product.id);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={isFavorite ? faHeartSolid : faHeart}
                                className={styles.wishlistIcon}
                            />
                        </button> */}
                    </div>
                    <div className={styles.middle_container}>
                        <div className={styles.middle_info_box}>
                            <p className={styles.productName}>{product.name}</p>
                            <div className={styles.categoryContainer}>
                                <p className={styles.productCategory}>{product.categoryName}</p>
                                <div className={styles.productRate}>
                                    <FontAwesomeIcon icon={faStar} />
                                    &nbsp;&nbsp;<span className={styles.productRateNumber}>245</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.concave_box}></div>
                    </div>
                    <div className={styles.last_container}>

                        <div className={styles.last_info_box}>
                            {product.discount_price && product.discount_price !== 0 ? (
                                <div className={styles.priceContainer}>
                                    <span className={styles.oldPrice}>€{product.price.toFixed(2)}</span>
                                    <span className={styles.discountPrice}>€{product.discount_price.toFixed(2)} &nbsp;&nbsp;
                                        <span className={styles.perKg}>
                                            €{(product.discount_price && product.discount_price !== 0 ? product.discount_price : product.price).toFixed(2)} per {product.qty_per_unit} {product.unitName}
                                        </span></span>
                                </div>
                            ) : (
                                <span className={styles.price}>€{product.price.toFixed(2)}&nbsp;&nbsp;
                                    <span className={styles.perKg}>
                                        €{(product.discount_price && product.discount_price !== 0 ? product.discount_price : product.price).toFixed(2)} per {product.qty_per_unit} {product.unitName}
                                    </span></span>
                            )}

                        </div>
                        <div className={styles.concave_box}></div>
                        <div className={styles.square1} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart();
                        }} aria-label="Add to cart">
                            <div className={styles.square2}>
                                <svg className={styles.addbtn} width="35" height="34" viewBox="0 0 35 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M26.2084 25.1459H11.1208C9.71835 25.1459 8.37251 24.5509 7.42334 23.5167C6.47418 22.4825 5.99252 21.0942 6.10586 19.6917L7.28169 5.58171C7.32419 5.14254 7.16835 4.71755 6.87085 4.39172C6.57335 4.06588 6.16252 3.89587 5.72335 3.89587H3.27252C2.69169 3.89587 2.21002 3.41421 2.21002 2.83337C2.21002 2.25254 2.69169 1.77087 3.27252 1.77087H5.73753C6.7717 1.77087 7.74918 2.21004 8.44335 2.96087C8.82585 3.38587 9.10918 3.88171 9.26502 4.43421H26.9592C28.39 4.43421 29.7075 5.00087 30.6708 6.02087C31.62 7.05504 32.1017 8.40088 31.9884 9.83171L31.2233 20.4567C31.0675 23.0492 28.8009 25.1459 26.2084 25.1459ZM9.33585 6.54503L8.23086 19.8617C8.16002 20.6834 8.42919 21.4625 8.98169 22.0717C9.53419 22.6809 10.2992 23.0067 11.1208 23.0067H26.2084C27.6817 23.0067 29.0134 21.7601 29.1267 20.2867L29.8917 9.66172C29.9483 8.82588 29.6792 8.03255 29.1267 7.45172C28.5742 6.85672 27.8092 6.53085 26.9733 6.53085H9.33585V6.54503Z" fill="white" />
                                    <path d="M23.46 32.2292C21.9017 32.2292 20.6267 30.9542 20.6267 29.3958C20.6267 27.8375 21.9017 26.5625 23.46 26.5625C25.0184 26.5625 26.2934 27.8375 26.2934 29.3958C26.2934 30.9542 25.0184 32.2292 23.46 32.2292ZM23.46 28.6875C23.0634 28.6875 22.7517 28.9992 22.7517 29.3958C22.7517 29.7925 23.0634 30.1042 23.46 30.1042C23.8567 30.1042 24.1684 29.7925 24.1684 29.3958C24.1684 28.9992 23.8567 28.6875 23.46 28.6875Z" fill="white" />
                                    <path d="M12.1267 32.2292C10.5684 32.2292 9.2934 30.9542 9.2934 29.3958C9.2934 27.8375 10.5684 26.5625 12.1267 26.5625C13.6851 26.5625 14.9601 27.8375 14.9601 29.3958C14.9601 30.9542 13.6851 32.2292 12.1267 32.2292ZM12.1267 28.6875C11.7301 28.6875 11.4184 28.9992 11.4184 29.3958C11.4184 29.7925 11.7301 30.1042 12.1267 30.1042C12.5234 30.1042 12.8351 29.7925 12.8351 29.3958C12.8351 28.9992 12.5234 28.6875 12.1267 28.6875Z" fill="white" />
                                    <path d="M30.1892 12.3959H13.1892C12.6084 12.3959 12.1267 11.9142 12.1267 11.3334C12.1267 10.7525 12.6084 10.2709 13.1892 10.2709H30.1892C30.77 10.2709 31.2517 10.7525 31.2517 11.3334C31.2517 11.9142 30.77 12.3959 30.1892 12.3959Z" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default ProductCard; 