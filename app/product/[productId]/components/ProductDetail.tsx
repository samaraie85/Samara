"use client";

import { useState, useEffect } from 'react';
import styles from './ProductDetail.module.css';
import ProductHeader from './ProductHeader';
import ProductActions from './ProductActions';
import ProductBenefits from './ProductBenefits';
import ProductUses from './ProductUses';
import NutritionTable from './NutritionTable';
import RecipeSection from './RecipeSection';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import loadingGif from '../../../assets/loading_1.gif';
import SimilarProducts from './SimilarProducts';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface ProductDetailProps {
    productId: string;
}

interface ProductImage {
    image: string;
}

interface Product {
    name: string;
    price: number;
    discount_price: number;
    unitPrice: number;
    unitName: string;
    qty_per_unit: number;
    supplier: string;
    desc: string;
    benefits: string;
    uses: string;
    image: string;
    sold_amount: number;
    remaining_amount: number;
    images: ProductImage[];
    category: string;
    plan: NutritionItem[];
    recipes: string;
}

interface NutritionItem {
    point: string;
    value: number;
    unit: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const { isAuthenticated, user } = useAuth();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                // Fetch product from API
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();
                setProduct(data.product);
                // Set initial quantity to min_qty
                setQuantity(data.product.min_qty || 1);

                // Set the first image as selected image if there are images
                if (data.product.images && data.product.images.length > 0) {
                    setSelectedImage(data.product.images[0].image);
                } else {
                    setSelectedImage(data.product.image);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 1800);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);
    
    const handleAddToCart = async () => {
        if (!isAuthenticated || !user) {
            window.location.href = '/login?redirect=back';
            return;
        }

        try {
            // Call API route to add item to cart with exact quantity
            const response = await fetch(`/api/cart/add?user=${user.id}&product=${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity: quantity,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            setShowPopup(true);
            // console.log(`Added ${product?.name} to cart with quantity ${quantity}`);
            // Add success notification here
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Add error notification here
        }
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    if (loading || !product) {
        return <div className={styles.loading}>
            <Image src={loadingGif} alt="Loading" width={100} height={100} />
            Loading product details...
        </div>;
    }

    // Get all images for the product - main image plus any additional images
    const allImages = [
        product?.image,
        ...(product?.images && product?.images.length > 0
            ? product?.images.map((img: ProductImage) => img.image)
            : [])
    ].filter(Boolean); // Remove any nulls/undefined



    return (
        <div className={styles.productDetail}>
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

            <div className={styles.mainContent}>

                <div data-aos="fade-right" className={styles.productInfo} >
                    <ProductHeader
                        name={product.name}
                        price={product.price}
                        discountPrice={product.discount_price}
                        unitPrice={product.unitPrice}
                        unit={product.unitName}
                        qty_per_unit={product.qty_per_unit}
                        supplier={product.supplier || "Egypt"}
                        description={product.desc}
                        rating={245}
                        sold_amount={product.sold_amount || 0}
                        remaining_amount={product.remaining_amount || 0}
                    />


                    <ProductActions
                        quantity={quantity}
                        onIncrement={incrementQuantity}
                        onDecrement={decrementQuantity}
                        onAddToCart={handleAddToCart}
                        productId={productId}
                        userId={user?.id}
                    />
                </div>

                <div data-aos="fade-left" className={styles.productImageGallery}>
                    <div className={styles.mainImage}>
                        <Image
                            src={selectedImage || product?.image}
                            alt={product?.name}
                            width={500}
                            height={500}
                            className={styles.productImage}
                        />
                    </div>
                    {allImages.length > 1 && (
                        <div className={styles.thumbnails}>
                            {allImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`${styles.thumbnail} ${img === selectedImage ? styles.activeThumbnail : ''}`}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        width={100}
                                        height={100}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div data-aos="fade-up"

                style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#B0B0B0',
                    margin: '40px 0'
                }} />

            <div className={styles.additionalInfo}>
                <div data-aos="fade-up" className={styles.benefitsUsesSection}>
                    <ProductBenefits benefits={product.benefits} />
                    <ProductUses uses={product.uses} />
                </div>
                <div data-aos="fade-up" style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#B0B0B0',
                    margin: '40px 0'
                }} />

                <NutritionTable
                    nutritionData={product.plan}
                    productName={product.name}
                />
                <div data-aos="fade-up" style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#B0B0B0',
                    margin: '40px 0'
                }} />

                <RecipeSection
                    recipes={product.recipes}
                    productImage={product.image}
                />
                <div data-aos="fade-up" style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#B0B0B0',
                    margin: '40px 0'
                }} />
            </div>
            <SimilarProducts category={product.category} />
        </div>
    );
};

export default ProductDetail; 