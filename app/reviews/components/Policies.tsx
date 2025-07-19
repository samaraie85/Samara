"use client"
import styles from './Policies.module.css';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
const PAGE_SIZE = 8;

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

const Policies = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/reviews/all?page=${page}&pageSize=${PAGE_SIZE}`)
            .then(res => res.json())
            .then(data => {
                console.log('API response:', data);
                setReviews(data.reviews || []);
                setTotal(data.total || 0);
                setLoading(false);
            });
    }, [page]);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <section className={styles.policies}>
            <h2 data-aos="fade-down">ِ<span>All</span> Reviews <span style={{ fontSize: '1rem', color: '#FFD54A' }}>({total} Reviews)</span></h2>
            <div className={styles.reviewsGrid} data-aos="fade-up">
                {loading ? (
                    <p style={{ color: '#fff' }}>Loading...</p>
                ) : reviews.length === 0 ? (
                    <p style={{ color: '#fff' }}>No reviews yet.</p>
                ) : (
                    reviews.map((review, idx) => {
                        const user = review.app_users || {};
                        const name = user.full_name || 'Anonymous';
                        const image = user.image;
                        const comment = review.commnet || '';
                        const rating = review.rating || 0;
                        const date = review.createdAt || review.created_at;
                        return (
                            <div key={review.id || idx} className={styles.reviewCard} data-aos="zoom-in">
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
            {totalPages > 1 && (
                <div className={styles.pagination} data-aos="fade-up">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={page === i + 1 ? styles.activePage : ''}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Policies; 