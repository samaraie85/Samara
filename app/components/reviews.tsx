"use client"

import styles from './reviews.module.css';
import p from '../assets/review.png';
import Image from 'next/image';
import Link from 'next/link';
import { faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Review {
    id: number;
    commnet?: string;
    comment?: string;
    text?: string;
    rating?: number;
    createdAt?: string;
    created_at?: string;
    app_users?: {
        full_name?: string;
        image?: string;
    };
}

function getInitials(name: string) {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
}

function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) === 1 ? '' : 's'} ago`;
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) === 1 ? '' : 's'} ago`;
}

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            const res = await fetch('/api/reviews');
            const result = await res.json();
            if (res.ok) setReviews(result.reviews);
            setLoading(false);
        };
        fetchReviews();
    }, []);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    return (
        <section className={styles.reviews}>
            <Image src={p} className={styles.pattern1} alt="reviews" width={100} height={100} />
            <Image src={p} className={styles.pattern2} alt="reviews" width={100} height={100} />
            <div className={styles.hotdealsContent}>
                <h1 data-aos="fade-right"><span>Customers</span> Reviewes</h1>
                <Link data-aos="fade-left" className={styles.viewAll} href="/reviews">View All <FontAwesomeIcon className={styles.arrowIcon} icon={faArrowRight} /></Link>
            </div>
            <div className={styles.reviewsContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    reviews.map((review) => {
                        const user = review.app_users || {};
                        const name = user.full_name || 'Anonymous';
                        const image = user.image;
                        const comment = review.commnet || review.comment || review.text || '';
                        const rating = review.rating || 0;
                        const date = review.createdAt || review.created_at;
                        return (
                            <div data-aos="fade-up" key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    {image ? (
                                        <Image src={image} alt={name} className={styles.avatar} width={40} height={40} />
                                    ) : (
                                        <div className={styles.avatar}>{getInitials(name)}</div>
                                    )}
                                    <div>
                                        <div className={styles.reviewerName}>{name}</div>
                                        <div className={styles.reviewDate}>{date ? timeAgo(date) : ''}</div>
                                        <div className={styles.stars}>
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesomeIcon key={i} icon={faStar} color={i < rating ? '#F1B901' : '#e0e0e0'} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.reviewText}>{comment}</div>
                            </div>
                        );
                    })
                )}
            </div>
            <Link data-aos="fade-up" className={styles.addReview} href="/reviews">
                Add Review
            </Link>
        </section>
    );
}