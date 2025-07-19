"use client"
import Image from 'next/image';
import styles from './Policies.module.css';
import donate from '../../assets/logo.png';
import p from '../../assets/contact-form2.png';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const Policies = () => {
    const [form, setForm] = useState({
        fullname: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
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
        try {
            const { error } = await supabase.from('messages').insert([
                {
                    fullname: form.fullname,
                    phone: form.phone,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                },
            ]);
            if (error) throw error;
            setSuccess('Your message has been sent successfully!');
            setForm({ fullname: '', phone: '', email: '', subject: '', message: '' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.policies}>

            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
                <Image src={p} className={styles.pattern} alt="Humanity First" width={250} height={250} />
                <div className={styles.logo}>
                    <Image src={donate} alt="Humanity First" width={250} height={250} />
                </div>
                <div className={styles['form-row']}>
                    <input
                        type="text"
                        name="fullname"
                        placeholder="Full Name"
                        className={styles.input}
                        value={form.fullname}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        className={styles.input}
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles['form-row']}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className={styles.input}
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        className={styles.input}
                        value={form.subject}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles['form-row']}>
                    <textarea
                        name="message"
                        placeholder="Message"
                        className={styles.textarea}
                        value={form.message}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className={styles.button} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
                </div>

                {success && <p className={styles.success}>{success}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </form>
        </section>
    );
};

export default Policies; 