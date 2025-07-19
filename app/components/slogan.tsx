'use client'
import Image from 'next/image';
import styles from './slogan.module.css';
import slogan from '../assets/mandala-left.png';
import logo from '../assets/logo.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

const Slogan = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    return (
        <section className={styles.sologan}>
            <Image data-aos="fade-right" className={styles.sloganImage} src={slogan} alt="slogan" />
            <h1 data-aos="fade-up">
                <span>
                    Samara...&nbsp;
                </span>
                Brand Speaks Arabic
            </h1>
            <Image data-aos="fade-left" className={styles.logo} src={logo} alt="slogan" />
        </section>
    );
};

export default Slogan; 