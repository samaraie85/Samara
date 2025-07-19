'use client'
import styles from './Partners.module.css';
import Image from 'next/image';
import partner1 from '../assets/partner/partner1.png';
import partner2 from '../assets/partner/partner2.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


const partners = [
    { name: 'Tariq Halal', logo: partner1, description: 'Tariq Halal is a renowned supplier of halal products in the UAE, specializing in organic and sustainably sourced ingredients. Their extensive portfolio includes fresh produce, dairy products, and artisanal foods.' },
    { name: 'Green Valley', logo: partner2, description: 'Green Valley is a renowned supplier of halal products in the UAE, specializing in organic and sustainably sourced ingredients. Their extensive portfolio includes fresh produce, dairy products, and artisanal foods.' },
];

const Partners = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    return (

        <section className={styles.partnersSection}>
            <div className={styles.partnersLabel} data-aos="fade-up">Our Partners</div>
            <h2 className={styles.partnersTitle} data-aos="fade-up" >We work with the best partners</h2>
            <div className={styles.partnersGrid}>
                {partners.map((partner, idx) => (
                    <div data-aos="fade-up" className={styles.partnerCard} key={idx}>
                        <div className={styles.logoInfoWrapper}>
                            <Image
                                src={partner.logo}
                                alt={partner.name + ' logo'}
                                className={styles.partnerLogo}
                                width={120}
                                height={40}
                            />
                            <div className={styles.partnerInfo}>
                                <div className={styles.partnerName}>{partner.name}</div>
                                {partner.description && (
                                    <div className={styles.partnerDescription}>{partner.description}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
export default Partners; 