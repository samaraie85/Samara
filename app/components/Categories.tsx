"use client";

import Image from 'next/image';
import Link from 'next/link';
import styles from './Categories.module.css';
import { useState, useEffect } from 'react';
import upperArt from '../assets/upperArt.png';
import groceryImg from '../assets/test/image.png'; // Fallback image
import AOS from 'aos';
import 'aos/dist/aos.css';

// Define interface for category data
interface Category {
    id: number;
    name: string;
    image_url?: string;
    created_at?: string;
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    if (loading) {
        return (
            <section className={styles.categories}>
                <div className={styles.upperArtContainer}>
                    <Image
                        src={upperArt}
                        alt="Decorative Art"
                        className={styles.upperArt2}
                        width={200}
                        height={100}
                    />
                </div>
                <div className={styles.container}>
                    <div className={styles.loading}>Loading categories...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.categories}>
                <div className={styles.container}>
                    <div className={styles.error}>Error: {error}</div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.categories}>
            <div className={styles.upperArtContainer} >
                <Image
                    src={upperArt}
                    alt="Decorative Art"
                    className={styles.upperArt2}
                    width={200}
                    height={100}
                />
            </div>
            <div className={styles.container} >
                <div className={styles.grid}>
                    {categories.map((category) => (
                        <Link href={`/category/${category.id}`} key={category.id}
                            className={styles.categoryCard}>

                            <div className={styles.circleImageWrapper}>
                                <Image
                                    src={category.image_url || groceryImg}
                                    alt={category.name}
                                    width={110}
                                    height={110}
                                    className={styles.circleImage}
                                    sizes="110px"
                                />
                            </div>

                            <p className={styles.categoryName}>{category.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
            <Image
                src={upperArt}
                alt="Decorative Art"
                className={styles.upperArt}
                width={300}
                height={100}
            />
        </section>
    );
};

export default Categories; 