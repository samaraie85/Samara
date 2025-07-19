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
            <h2 data-aos="fade-right">Delivery Policies</h2>
            <p data-aos="fade-up">
                <br />
                At <strong>Samara</strong> we are committed to providing reliable and convenient delivery services. Please read our delivery policy below:
            </p>

            <p data-aos="fade-up">
                <strong>1. Main Delivery Country :</strong><br />
            </p>
            <p data-aos="fade-up">
                Our primary delivery location is the Republic of Ireland.
            </p>

            <p data-aos="fade-up">
                <strong>2. Current Delivery Coverage :</strong><br />
            </p>
            <p data-aos="fade-up">
                As a newly established company, we currently deliver only within County Dublin. We are actively working on expanding our delivery coverage to serve all of Ireland in the near future.            </p>
            <p>
                <strong>3. Delivery Charges :</strong><br />
            </p>
            <p data-aos="fade-up">
                We offer a flat delivery fee of €5 for all orders, regardless of size or weight.
            </p>


            <p data-aos="fade-up">
                <strong>4. Delivery Schedule :</strong><br />
            </p>
            <p data-aos="fade-up">
                Deliveries are scheduled for weekends only (Saturday and Sunday). Please make sure someone is available to receive the delivery during these days.            </p>


            <p data-aos="fade-up">
                <strong>5. Free Delivery Offer :</strong><br />
            </p>
            <p data-aos="fade-up"       >
                Enjoy free delivery on orders over €50 – no code required, the discount will be applied automatically at checkout.
            </p>


            <p data-aos="fade-up">
                <strong>6. Order Tracking :</strong><br />
            </p>

            <ul className={styles.policies}>
                <li>
                    <p data-aos="fade-up">
                        You can track the status of your order by logging into your account and visiting the &quot;My Orders&quot; section as follows...Account/ My orders.
                    </p>
                </li>
                <li>
                    <p data-aos="fade-up">
                        After your order has shipped, you will receive an email with tracking details which will allow you to view the status of your delivery.
                    </p>
                </li>
            </ul>


            <p data-aos="fade-up">
                <strong>7. Account Requirement :</strong><br />
            </p>
            <p data-aos="fade-up">
                Please note that you must be registered and logged in to view and track your orders.
            </p>

            <p data-aos="fade-up">
                <strong>Note:</strong> At the moment, we can not deliver Perishable foods such as meat, chilled items, and frozen items.
            </p>

            <p data-aos="fade-up">
                If you have any questions or need further assistance, feel free to contact our customer support team.
            </p>
            <p data-aos="fade-up">
                <a className={styles.email} href="mailto:Support@samarahub.ie">Support@samarahub.ie </a>
            </p>
        </section>
    );
};

export default Policies; 