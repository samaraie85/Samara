"use client";

import styles from './categories.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import groceryImg from '../../assets/test/image.png'; // Fallback image
import left from '../../assets/cateleft.png'; // Fallback image
import right from '../../assets/cateright.png'; // Fallback image
import loadingGif from '../../assets/loading_1.gif'; // Fallback image
import Image from 'next/image';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Category {
    id: number;
    name: string;
    image_url?: string;
}


const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);

                // Fetch categories from the API route
                const response = await fetch('/api/categories');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch categories');
                }

                const data = await response.json();
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError(error instanceof Error ? error.message : 'Failed to load categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className={styles.categories}>
                <h1 data-aos="fade-right">All <span>Categories</span></h1>
                <div className={styles.categoriesLoading}>
                    <Image
                        src={loadingGif}
                        alt="Loading categories..."
                        width={100}
                        className={styles.loadingGif}
                    />
                    <p>Loading . . .</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.categories}>
                <h1 data-aos="fade-right">All <span>Categories</span></h1>
                <div className={styles.categoriesLoading}>
                    <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        style={{ color: "#FFD54A", width: "100px", height: "100px" }}
                    />
                    <p>Error: {error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.categories}>
            <h1 data-aos="fade-right">All <span>Categories</span></h1>

            <div className={styles.categoriesGrid}>
                {categories.map((category) => (

                    <Link data-aos="fade-up" href={`/category/${category.id}`} key={category.id}
                        className={styles.categoryItem}>

                        <div className={styles.imageWrapper}>
                            <Image
                                src={category.image_url || groceryImg}
                                alt={category.name}
                                width={160}
                                height={160}
                                className={styles.image}

                            />
                        </div>

                        <div className={styles.categoryInfo}>
                            <Image
                                src={left}
                                alt={category.name}
                                className={styles.left}

                            />
                            <p className={styles.categoryName}>{category.name}</p>
                            <Image
                                src={right}
                                alt={category.name}
                                className={styles.right}

                            />
                        </div>

                    </Link>

                ))}
            </div>
        </section>
    );
};

export default Categories; 