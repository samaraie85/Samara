'use client'
import styles from './ProductDetail.module.css';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

interface RecipeSectionProps {
    recipes?: string;
    productImage?: string;
}

const RecipeSection = ({ recipes, productImage }: RecipeSectionProps) => {
    // Default recipe if none provided
    const recipeText = recipes || "";

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    return (
        <div className={styles.recipeSectionhead}>
            <div data-aos="fade-right" className={styles.recipeSection}>
                <h2 className={styles.sectionTitle}>Various Recipes:</h2>
                <div className={styles.recipeContainer}>
                    <p className={styles.recipeText}>{recipeText}</p>
                </div>
            </div>
            {productImage && (
                <div data-aos="fade-left" className={styles.productImageContainer}>
                    <Image src={productImage} alt="Product Image" width={100} height={100} />
                </div>
            )}
        </div>
    );
};

export default RecipeSection; 