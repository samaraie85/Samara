"use client"
import Image from 'next/image';
import styles from './ReviewForm.module.css';
import p from '../../assets/contact-form2.png';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ReviewForm = () => {
    const [form, setForm] = useState({
        user: '',
        rating: 0,
        commnet: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        if (form.rating === 0) {
            setError('Please select a rating.');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: form.user,
                    rating: form.rating,
                    commnet: form.commnet,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit review');
            setSuccess('Your review has been submitted successfully!');
            setForm({ user: '', rating: 0, commnet: '' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setForm(prev => ({ ...prev, user: user?.id || '' }));
        };
        getUser();
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    return (
        <section className={styles.policies} >
            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
                <Image src={p} className={styles.pattern} alt="Humanity First" width={250} height={250} data-aos="zoom-in" />
                <div className={styles.logo} data-aos="fade-down">
                    <h2><span>Add</span> Review</h2>
                </div>
                <div className={styles['form-row']} data-aos="fade-up">
                    <div className={styles.starRating} data-aos="zoom-in">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={star <= form.rating ? styles.filledStar : styles.emptyStar}
                                onClick={() => setForm({ ...form, rating: star })}
                                style={{ cursor: 'pointer', fontSize: '2rem', color: star <= form.rating ? '#F1B901' : '#e0e0e0' }}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setForm({ ...form, rating: star }) }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className={styles['form-row']} data-aos="fade-up">
                    <textarea
                        name="commnet"
                        placeholder="Review"
                        className={styles.textarea}
                        value={form.commnet}
                        onChange={handleChange}
                        required
                        data-aos="fade-up"
                    />
                    <button type="submit" className={styles.button} disabled={loading} data-aos="fade-up">{loading ? 'Sending...' : 'Send'}</button>
                </div>
                {success && <p className={styles.success}>{success}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </form>
        </section>
    );
};

export default ReviewForm; 