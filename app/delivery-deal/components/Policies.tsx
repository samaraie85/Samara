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
            <h2 data-aos="fade-right">Free Delivery? Oh Yes – No Strings Attached! 🚚✨</h2>
            <div data-aos="fade-up">
                <p><strong>1. Order Freely, Delivery’s On Us!</strong><br />
                    Craving your favorite goodies? Spend €50 or more, and we’ll deliver your order absolutely FREE!</p>

                <p><strong>2. Full Cart = Fast & Free Delivery!</strong><br />
                    Fill up your basket with deliciousness worth €50+, and enjoy zero delivery charges – save your cash for more treats!</p>

                <p><strong>3. The More You Shop, the More You Save!</strong></p>

                <p><strong>4.</strong> Place an order over €50, and we’ll take care of the delivery – simple as that!</p>

                <p><strong>5. Treat Yourself… We’ll Handle Delivery!</strong><br />
                    Shop your favorites from Samara and enjoy FREE home delivery when your total hits €50 or more.</p>

                <p><strong>6. An Offer That Doubles the Joy!</strong><br />
                    ✅ Spend over €50<br />
                    ✅ Get free delivery<br />
                    ✅ Taste the savings – sweet and simple!</p>

                <p><strong>7. Shop Smart – Plan Right!</strong><br />
                    Combine your needs, or team up with family or neighbors – once your cart hits €50, we’ll deliver it FREE of charge!</p>
            </div>
        </section>
    );
};

export default Policies; 