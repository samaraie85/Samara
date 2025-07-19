'use client'
import Image from 'next/image';
import styles from './How.module.css';
import logo from '../../assets/logo1.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

const How = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    return (
        <section className={styles.how}>
            <div className={styles.textContent}>
                <h2 data-aos="fade-right" className={styles.title}>Who Are We ?</h2>
                <p data-aos="fade-right" className={styles.description}>
                    Samara is an Arabic brand,specializing in selling high quality Arabic products that are distinguished by their arabic authenticity.Samara Established in 2024 and its goal is to feel good and return to using our authentic arabic products.<br /><br />
                    At Samara, we believe in the beauty of tradition and the power of high-quality, natural ingredients. Our carefully curated selection of products is designed to reconnect people with their cultural roots, promoting a lifestyle that is both luxurious and deeply meaningful.
                </p>
            </div>
            <div data-aos="fade-left" className={styles.imageWrapper}>
                <Image
                    src={logo}
                    alt="Samara Logo"
                    width={700}
                    className={styles.modelImage}
                    priority
                />
            </div>
        </section>
    );
};

export default How; 