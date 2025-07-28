'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faStarAndCrescent,
    faAngleLeft,
    faAngleRight,
} from '@fortawesome/free-solid-svg-icons';

import modelImage from '../assets/model-image.png';
import heroImage from '../assets/home-pattren.png';
import discountImage from '../assets/discountdeal.png';
import donationImage from '../assets/donationbg.png';
import deliveryImage from '../assets/delivery.png';
import pointsImage from '../assets/points.png';

import Navbar from '../shared_components/Navbar';

interface SlideData {
    id: number;
    title: string;
    description: string;
    buttonText: string;
    buttonIcon: IconDefinition;
    buttonColor?: string;
    theme: 'brand' | 'discount' | 'donation' | 'delivery' | 'points';
    buttonLink: string;
    image: string;
}

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const slides: SlideData[] = [
        {
            id: 1,
            title: "Samara",
            description: "Samara is an Arabic brand specializing in selling high quality Arabic products that are distinguished by their arabic authenticity. Samara Established in 2024 and its goal is to feel good and return to using our authentic arabic products.",
            buttonText: "View Products",
            buttonIcon: faStarAndCrescent,
            theme: 'brand',
            buttonLink: '/category',
            image: heroImage.src
        },
        {
            id: 2,
            title: "50% discount deal",
            description: "Helping hand, open heart – take 50% off, because no one should feel left behind.",
            buttonText: "Read More",
            buttonIcon: faStarAndCrescent,
            theme: 'discount',
            buttonLink: '/50-discount-deal',
            image: discountImage.src
        },
        {
            id: 3,
            title: "Gaza Donation",
            description: "Even small coins can carry big compassion. Donate 50 cents for Gaza today.",
            buttonText: "",
            buttonIcon: faStarAndCrescent,
            theme: 'donation',
            buttonLink: '',
            image: donationImage.src
        },
        {
            id: 4,
            title: "Delivery Deal",
            description: "Enjoy FREE delivery on all orders over €50 – no hidden fees, just great deals",
            buttonText: "Shop Now",
            buttonIcon: faStarAndCrescent,
            theme: 'delivery',
            buttonLink: '/category',
            image: deliveryImage.src
        },
        {
            id: 5,
            title: "Points Deal",
            description: "Swipe. Earn. Repeat. Your points = money in the shopping bank! Earn points on every product and turn them into instant discount!",
            buttonText: "Explore Products",
            buttonIcon: faStarAndCrescent,
            theme: 'points',
            buttonLink: '/category',
            image: pointsImage.src
        }
    ];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Touch handlers for swipe functionality
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    // Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 10000);

        return () => clearInterval(interval);
    }, [nextSlide]);

    const currentSlideData = slides[currentSlide];

    return (
        <section
            className={styles.hero}
            style={{ backgroundImage: ` linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1)),url(${currentSlideData.image})` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <Navbar />
            <div className={styles.textContent}>
                <div className={styles.supTextContent} style={{ width: currentSlideData.theme !== 'brand' ? '90%' : 'max-content' }}>
                    <h1 className={`${styles.title} ${styles[currentSlideData.theme]}`}>
                        {currentSlideData.title}
                    </h1>
                    <p className={styles.description}>
                        {currentSlideData.description}
                    </p>
                    <div className={styles.buttons}>
                        {currentSlideData.theme !== 'donation' && (<Link
                            href={currentSlideData.buttonLink}
                            className={styles.viewProducts}
                            style={{
                                color: "#ffffff",
                                background: "linear-gradient(to right, #F1B901, #CE9E00)"
                            }}
                        >
                            {currentSlideData.buttonText}
                            <FontAwesomeIcon icon={currentSlideData.buttonIcon} style={{ color: "#ffffff" }} />
                        </Link>)}
                        {currentSlideData.theme === 'brand' && (
                            <Link
                                href={currentSlideData.buttonLink}
                                className={styles.learnMore}
                            >
                                Learn More
                            </Link>
                        )}
                    </div>
                    {/* Slide indicators */}
                    <div className={styles.slideIndicators}>
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.sliderButtons}>
                <button className={styles.sliderButton} onClick={prevSlide}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                <button className={styles.sliderButton} onClick={nextSlide}>
                    <FontAwesomeIcon icon={faAngleRight} />
                </button>
            </div>

            {currentSlideData.theme === 'brand' && (
                <div className={styles.imageWrapper}>
                    <Image
                        src={modelImage}
                        alt="Samara Model"
                        width={500}
                        className={styles.modelImage}
                        priority
                    />
                </div>)}
        </section>
    );
};

export default Hero; 