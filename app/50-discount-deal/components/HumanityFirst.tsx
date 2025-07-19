"use client";

import Image from 'next/image';
import styles from './HumanityFirst.module.css';
import donate from '../../assets/donate.png';
import Masjid from '../../assets/Masjid.png';
import Church from '../../assets/Church.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

const HumanityFirst = () => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    const downloadPdf = (path: string, filename: string) => {
        const link = document.createElement('a');
        link.href = path;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className={styles.humanityFirst}>
            <h2 data-aos="fade-right"><span>Humanity</span> First</h2>
            <Image data-aos="fade-left" className={styles.donate} src={donate} alt="Humanity First" width={200} height={200} />
            <p data-aos="fade-up">
                Samara Company believes in its humanitarian mission and its effective role in society, and is committed to providing assistance to every individual in society, especially those suffering from difficult economic circumstances. It has agreed with Places of worship such as mosques, churches, etc. to launch a community cooperation initiative aimed at supporting needy families and alleviating their burdens in light of the challenges they face daily.
            </p>
            <p data-aos="fade-up">
                This protocol is not limited to merely offering a discount; rather, it represents a noble humanitarian message that Samara Company embodies through its deep commitment to standing by those in need of support, based on its belief in the importance of solidarity and social cohesion.
            </p>
            <h3 data-aos="fade-up">Get a Free Copy:</h3>
            <div data-aos="fade-up" className={styles.contanier}>
                <div data-aos="fade-right" className={styles.types}>
                    <Image className={styles.Masjid} src={Masjid} alt="Masjid" width={150} height={150} />
                    <h4>Masjid Copy</h4>
                    <button
                        className={styles.downloadBtn}
                        onClick={() => downloadPdf("/docs/Samara-Masjid.pdf", "Samara-Masjid")}
                    >
                        Download
                    </button>
                </div>
                <div data-aos="fade-left" className={styles.types}>
                    <Image className={styles.Church} src={Church} alt="Church" width={150} height={150} />
                    <h4>Church Copy</h4>
                    <button
                        className={styles.downloadBtn}
                        onClick={() => downloadPdf("/docs/Samara-Church.pdf", "Samara-Church")}
                    >
                        Download
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HumanityFirst; 