'use client'
import styles from './Partners.module.css';
import Image from 'next/image';
import partner1 from '../assets/partner/partner1.png';
import partner2 from '../assets/partner/partner2.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


const partners = [
    { name: 'Tariq Halal', logo: partner1 },
    { name: 'Green Valley', logo: partner2 },
];

const Partners = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    // Duplicate partners array to create seamless infinite scroll
    const duplicatedPartners = [...partners, ...partners, ...partners];

    return (

        <section className={styles.partnersSection}>
            <div className={styles.partnersLabel} data-aos="fade-up">Our Partners</div>
            <h2 className={styles.partnersTitle} data-aos="fade-up" >We work with the best partners</h2>
            <div className={styles.partnersContainer}>
                <div className={styles.partnersTrack}>
                    {duplicatedPartners.map((partner, idx) => (
                        <div data-aos="fade-up" className={styles.partnerCard} key={idx}>
                            <div className={styles.logoInfoWrapper}>
                                <Image
                                    src={partner.logo}
                                    alt={partner.name + ' logo'}
                                    className={styles.partnerLogo}
                                    width={120}
                                    height={40}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
export default Partners; 