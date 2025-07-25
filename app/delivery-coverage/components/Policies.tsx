'use client'
import styles from './Policies.module.css';
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
            <h2 data-aos="fade-right">Delivery Coverage and Policy – Samara 🚚</h2>
            <p data-aos="fade-up">
                At Samara, we care deeply about your convenience and satisfaction. That’s why we’ve designed a delivery system that is safe, reliable, and tailored to your needs.<br /><br />
                <strong>Where We Deliver 📍</strong><br />
                Currently, we offer delivery services across Dublin County, including:
            </p>
            <ul>
                <li data-aos="fade-up">Dublin City Centre (Dublin 1, 2, 4)</li>
                <li data-aos="fade-up">North Dublin (Dublin 3, 5, 7, 9, 11, 13, 15)</li>
                <li data-aos="fade-up">South Dublin (Dublin 6, 6W, 8, 10, 12, 14, 16, 18, 20, 22, 24)</li>
                <li data-aos="fade-up">Surrounding areas within Dublin County</li>
            </ul>
            <p data-aos="fade-up">
                We are actively working to expand our delivery coverage across all counties in Ireland to make it easier for everyone to access their favorite Egyptian products — delivered fresh, and at fair prices.<br /><br />
                <strong>Delivery Times 🕒</strong><br />
            </p>
            <ul>
                <li data-aos="fade-up">Operating Days: Weekend Only (Saturday, Sunday)</li>
                <li data-aos="fade-up">Delivery Hours: From 10:00 AM to 07:00 PM</li>
                <li data-aos="fade-up">Orders placed after 6:00 PM may be scheduled for next weekend-days delivery.</li>
            </ul>
            <p data-aos="fade-up">
                <strong>Delivery Timeframe⏱️</strong><br />
            </p>
            <ul>
                <li data-aos="fade-up">Most orders are delivered within 48 hours of shipment arrival.</li>
                <li data-aos="fade-up">During peak times or in bad weather, slight delays may occur — we’ll keep you informed every step of the way.</li>
            </ul>
            <p data-aos="fade-up">
                <strong>Delivery Fees 💶</strong><br />
            </p>
            <ul>
                <li data-aos="fade-up">Free delivery on all orders above €50</li>
                <li data-aos="fade-up">For orders below €50, a €4.99 flat fee applies</li>
            </ul>
            <p data-aos="fade-up">
                <strong>Additional Notes 🛒</strong><br />
            </p>
            <ul>
                <li data-aos="fade-up">All items are packed with care to maintain freshness and quality.</li>
                <li data-aos="fade-up">Please ensure your address and contact number are correct to avoid delays.</li>
                <li data-aos="fade-up">If delivery cannot be completed due to incorrect details or no one being available to receive the order, a redelivery fee may apply.</li>
            </ul>
        </section>
    );
};

export default Policies; 