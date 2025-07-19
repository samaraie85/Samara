'use client'
import Image from 'next/image';
import styles from './Policies.module.css';
import donate from '../../assets/logo.png';
import health from '../../assets/healthimage.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

const Policies = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    return (
        <section className={styles.policies}>
            <h2 data-aos="fade-right">Health and wellbeing At <span>Samara</span></h2>
            <div data-aos="fade-up" className={styles.health}>
                <Image data-aos="fade-left" className={styles.donate} src={donate} alt="Humanity First" width={250} height={250} />
                <Image data-aos="fade-right" className={styles.donate} src={health} alt="Humanity First" width={250} height={250} />
            </div>

            <p data-aos="fade-up">
                Dear Valued Customer,
            </p>
            <p data-aos="fade-up">
                At Samara, your health, satisfaction, and safety are at the heart of everything we do.<br />
                We are committed to providing you with high-quality food products that meet the highest standards. However, as individual dietary needs and sensitivities may vary, we kindly urge you to carefully review the ingredients listed on each product before consumption.
            </p>
            <p data-aos="fade-up">
                If you have any known allergies or sensitivities, we strongly advise verifying that the product is suitable for your needs.<br />
                Your wellbeing is our priority, and we are always here to support you with any inquiries you may have.
            </p>
            <p data-aos="fade-up">
                Thank you for your trust.
            </p>
            <p data-aos="fade-up">
                Warm regards,
            </p>
            <p data-aos="fade-up"><strong>Samara Team</strong></p>

        </section>
    );
};

export default Policies; 