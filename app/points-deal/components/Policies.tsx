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
            <h2 data-aos="fade-right">Earn Points with Every Purchase… and Redeem Them for Real Products!��</h2>
            <p data-aos="fade-up">
                Now, every time you shop on our website, you’re not just getting great products delivered to your door — you’re also earning reward points that you can turn into real money to shop again! 👇
            </p>
            <p data-aos="fade-up">
                <strong>How Do You Earn Points? 💡</strong>
            </p>
            <ul>
                <li data-aos="fade-up">✔️ If products costs €5, you get 1 point</li>
                <li data-aos="fade-up">✔️ If the product costs between €5 and €10, you get 2 points</li>
                <li data-aos="fade-up">✔️ If the product costs €10, you get 2 points</li>
                <li data-aos="fade-up">✔️ If the product costs €15, you get 3 points</li>
                <li data-aos="fade-up">✔️ And so on… Every extra €5 earns you 1 additional point</li>
            </ul>
            <p data-aos="fade-up">
                So the more you shop, the more points you collect!🎯
            </p>
            <p data-aos="fade-up">
                <strong>How to Use Your Points?🎁</strong>
            </p>
            <p data-aos="fade-up">
                Once your balance reaches 300 points, you can redeem them for €10 credit, which you can use directly on your next purchase!
            </p>
            <p data-aos="fade-up">
                <strong>Do Points Expire?⏳</strong>
            </p>
            <p data-aos="fade-up">
                Not at all!✅<br />
                Your points never expire, so you can keep them as long as you want and use them whenever you’re ready.
            </p>
        </section>
    );
};

export default Policies; 