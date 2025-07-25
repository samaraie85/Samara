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
            <h2 data-aos="fade-right">Frequently Asked Questions (FAQs)</h2>
            <div data-aos="fade-up">
                <p><strong>1. How can I order fruits, vegetables and groceries through your store?</strong><br />
                    You can order fruits, vegetables and groceries through our website or app, just browse the different categories, choose the products you want and add them to the shopping cart, then complete the payment process and choose the appropriate delivery method.</p>

                <p><strong>2. Are orders delivered on the same day?</strong><br />
                    Yes, in many cases orders are delivered on the same day if they are available in stock, otherwise the delivery period is up to a week, due to importing them from abroad.</p>

                <p><strong>3. Is there a minimum order?</strong><br />
                    No, there is no minimum order.</p>

                <p><strong>4. Can I customize the quantities or size of fruits, vegetables and groceries?</strong><br />
                    Yes, you can specify the quantities you need of fruits, vegetables and groceries, such as specifying the weight or number of pieces, and if the products come in specific packages, you can choose the number of packages.</p>

                <p><strong>5. Can I modify or cancel my order after it is confirmed?</strong><br />
                    Once the order is confirmed, the products are prepared quickly. So, if you want to modify or cancel the order, you should contact customer service as soon as possible, and if the order has already been shipped, modifications may not be possible.</p>

                <p><strong>6. How can I be sure of the quality of fruits and vegetables?</strong><br />
                    We are keen to provide fresh and high-quality products. However, if there is any quality problem, you can contact customer service to find a quick solution, such as replacing the product or refunding the amount.</p>

                <p><strong>7. Does the store offer discounts or special offers?</strong><br />
                    Yes, the store offers discounts and special offers from time to time, whether on special occasions or through Newsletter email subscriptions to receive updates on exclusive offers, to subscribe for free from here…</p>

                <p><strong>8. Are there additional delivery fees?</strong><br />
                    Yes, there is a fixed delivery fee of €5 regardless of your location.</p>

                <p><strong>9. Can I choose the delivery time?</strong><br />
                    Yes, you can choose the delivery time that suits you, when the delivery worker contacts you by phone on the day of delivery.</p>

                <p><strong>10. Can I track the status of my order?</strong><br />
                    Yes, you can track the status of your order through the website or application using the tracking number provided to you after the order is shipped. This will allow you to know where your order is and when it will arrive.</p>

                <p><strong>11. What happens if I am not home when the driver arrives?</strong><br />
                    If you are not present when the driver arrives, the delivery may be rescheduled for a later time.</p>

                <p><strong>12. Do you offer non-food products such as cleaning products and household supplies?</strong><br />
                    No, but we will work to provide them in case of increased demand.</p>

                <p><strong>13. Can I order products that are not currently available?</strong><br />
                    No</p>

                <p><strong>14. Are frozen or refrigerated products delivered?</strong><br />
                    No, at the moment, but we will inform you when they are available in our store, or you can subscribe to our newsletter to receive updates first, to subscribe for free from here… We put the email</p>

                <p><strong>15. Can I exchange or return the products?</strong><br />
                    If the products are unsatisfactory or damaged, you can return or exchange them according to the store’s return policy. We usually give 24 hours to return unopened or unused products, as they are fresh products and more susceptible to rapid spoilage.</p>

                <p><strong>16. Can I pay upon receipt of the order?</strong><br />
                    No, online payment is only available at the moment.</p>

                <p><strong>17. Are orders delivered on holidays?</strong><br />
                    Yes</p>

                <p><strong>18. How long does it take to deliver the order?</strong><br />
                    It may take up to a week from the date of order execution, due to the import of products from abroad.</p>

                <p><strong>19. How can I contact customer service?</strong><br />
                    You can contact customer service via the contact form on our website, email, or through the support service via social media (WhatsApp, Messenger, Instagram)</p>

                <p><strong>20. Can I add or remove products after submitting the order?</strong><br />
                    Since orders are processed quickly, adding or removing products after submitting the order may not be possible, you should contact customer service as soon as possible if you wish to modify the order.</p>

                <p><strong>21. Are seasonal products provided?</strong><br />
                    Yes, seasonal fruits and vegetables are provided according to the local season. You can find these products in the seasonal sections within the website or application.</p>

                <p><strong>22. What are the available payment methods?</strong><br />
                    Our store provides several different payment methods such as: -Payment using different credit cards such as (Revue, Visa, MasterCard, etc.) -Payment via electronic wallets such as (Google Pay, Apple Pay)</p>

                <p><strong>23. Can I get an electronic invoice?</strong><br />
                    Yes, you can get an electronic invoice once the payment process is completed, you can download it from your account on the website or receive it via email.</p>
            </div>
        </section>
    );
};

export default Policies; 