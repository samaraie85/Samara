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
            <h2 data-aos="fade-right">Refund Policy – Samara Store</h2>
            <p data-aos="fade-up">
                At Samara, your satisfaction is our top priority. We are committed to delivering fresh, high-quality food products and understand the importance of trust when shopping online for groceries. That’s why we offer a clear and reasonable refund policy designed to protect both our customers and our business.
            </p>
            <hr />
            <p data-aos="fade-up"><strong>Items Eligible for Return or Replacement:✅</strong></p>
            <p data-aos="fade-up">When Can You Request a Refund or Replacement?</p>
            <ul>
                <li data-aos="fade-up">You received a damaged or spoiled product.</li>
                <li data-aos="fade-up">The product received is different from what you ordered.</li>
                <li data-aos="fade-up">Delivery was delayed by more than 48 hours without prior notice or coordination.</li>
            </ul>
            <hr />
            <p data-aos="fade-up"><strong>Items Not Eligible for Return: ❌</strong></p>
            <ul>
                <li data-aos="fade-up">Items that have been opened or partially used.</li>
                <li data-aos="fade-up">Fresh or chilled products (e.g., fruits, vegetables, dairy, meats) unless they are spoiled or damaged.</li>
                <li data-aos="fade-up">Any product that was delivered correctly and matches the description.</li>
            </ul>
            <hr />
            <p data-aos="fade-up"><strong>Timeframe to Request a Refund:⏳</strong></p>
            <ul>
                <li data-aos="fade-up">Refund requests must be submitted within 24 hours of receiving your order.</li>
                <li data-aos="fade-up">Requests made after this period will not be accepted due to the perishable nature of our products.</li>
            </ul>
            <hr />
            <p data-aos="fade-up"><strong>Refund Conditions:📦</strong></p>
            <ul>
                <li data-aos="fade-up">A clear photo of the damaged or incorrect product must be provided.</li>
                <li data-aos="fade-up">The product must be in its original condition (unopened and unused).</li>
                <li data-aos="fade-up">Our customer service team will review the request within 24 hours.</li>
            </ul>
            <hr />
            <p data-aos="fade-up"><strong>Refund Method:💰</strong></p>
            <ul>
                <li data-aos="fade-up">The amount will be refunded to the original payment method within 7 business days.</li>
            </ul>
            <hr />
            <p data-aos="fade-up"><strong>How to Request a Return: 💬</strong></p>
            <p data-aos="fade-up">To request a refund please follow as it shown below…</p>
            <ul>
                <li data-aos="fade-up">Contact us via WhatsApp, email, or the support section on our website.</li>
                <li data-aos="fade-up">Provide your order number and clear images of the issue.</li>
                <li data-aos="fade-up">We will review and respond within 24 hours.</li>
                <li data-aos="fade-up">Email: support@samarahub.ie</li>
                <li data-aos="fade-up">WhatsApp: 0894-641-409</li>
            </ul>
            <hr />
            <p data-aos="fade-up">Thank you for choosing Samara. We’re proud to bring the taste of home to your doorstep – right here in Ireland 🇮🇪.</p>
        </section>
    );
};

export default Policies; 