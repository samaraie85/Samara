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
            <h2 data-aos="fade-right">Terms and Conditions</h2>
            <h3 data-aos="fade-up">Changes to Terms and Conditions</h3>
            <p data-aos="fade-up">
                We may update or alter these terms and conditions at any time without prior notice. Continued use of shop.company.com and shop.beetle.com.sg after such modifications constitutes your acceptance of the revised terms. We advise you to periodically review these terms whenever you visit our site.
            </p>
            <h3 data-aos="fade-up">Limitation of Liability</h3>
            <p data-aos="fade-up">
                The Company Pte Ltd assumes no responsibility and will not be liable for any damages to or viruses that may affect your computer, telecommunications equipment, or other property arising from your access to, use of, or browsing of this website, or from downloading any materials from it. NEITHER THE COMPANY PRIVATE LIMITED NOR ITS OFFICERS, DIRECTORS, EMPLOYEES, SHAREHOLDERS, AFFILIATES, AGENTS, SUCCESSORS, ASSIGNS, RETAIL PARTNERS, NOR ANY PARTY INVOLVED IN THE CREATION, PRODUCTION, OR TRANSMISSION OF THIS WEBSITE WILL BE LIABLE FOR ANY INDIRECT, SPECIAL, PUNITIVE, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF THE USE, INABILITY TO USE, OR RESULTS OF USE OF THIS WEBSITE, ANY LINKED SITES, OR ANY MATERIALS, INFORMATION, OR SERVICES CONTAINED ON SUCH SITES, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THESE LIMITATIONS OF LIABILITY DO NOT APPLY TO THE EXTENT PROHIBITED BY LAW; PLEASE REFER TO LOCAL LAWS FOR SUCH PROHIBITIONS.
            </p>
            <p data-aos="fade-up">
                IF YOU ENCOUNTER ANY ISSUES WITH THIS WEBSITE OR ITS CONTENT, YOUR SOLE REMEDY IS TO STOP USING THE SITE. FOR PROBLEMS WITH PRODUCTS OR SERVICES PURCHASED THROUGH THIS WEBSITE, YOUR REMEDY IS TO ADDRESS THESE WITH THE MANUFACTURER OR SUPPLIER IN ACCORDANCE WITH THEIR WARRANTY OR TO SEEK A RETURN AND REFUND AS PER OUR RETURNS AND REFUNDS POLICY. PLEASE NOTE THAT THIS SITE MAY CONTAIN INACCURACIES OR ERRORS, AND WE DO NOT WARRANT THAT CONTENT WILL BE ERROR-FREE OR UNINTERRUPTED.
            </p>
            <h3 data-aos="fade-up">Copyright and Trademark</h3>
            <p data-aos="fade-up">
                All materials on this website, including text, images, illustrations, software, audio and video clips, and animations, are protected by the copyright and trademark rights of The Company Private Limited. You may not copy, reproduce, modify, distribute, or transmit any part of this material without our prior written consent. All rights are reserved.
            </p>
            <h3 data-aos="fade-up">Products, Content, and Specifications</h3>
            <p data-aos="fade-up">
                All materials on this website, including text, images, illustrations, software, audio and video clips, and animations, are protected by the copyright and trademark rights of The Company Private Limited. You may not copy, reproduce, modify, distribute, or transmit any part of this material without our prior written consent. All rights are reserved.
            </p>
            <h3 data-aos="fade-up">Shipping Limitations</h3>
            <p data-aos="fade-up">
                All materials on this website, including text, images, illustrations, software, audio and video clips, and animations, are protected by the copyright and trademark rights of The Company Private Limited. You may not copy, reproduce, modify, distribute, or transmit any part of this material without our prior written consent. All rights are reserved.
            </p>
            <h3 data-aos="fade-up">Your Account</h3>
            <p data-aos="fade-up">
                All materials on this website, including text, images, illustrations, software, audio and video clips, and animations, are protected by the copyright and trademark rights of The Company Private Limited. You may not copy, reproduce, modify, distribute, or transmit any part of this material without our prior written consent. All rights are reserved.
            </p>
            <h3 data-aos="fade-up">Exchange and Refund Policy (Online Shop)</h3>
            <p data-aos="fade-up">
                All materials on this website, including text, images, illustrations, software, audio and video clips, and animations, are protected by the copyright and trademark rights of The Company Private Limited. You may not copy, reproduce, modify, distribute, or transmit any part of this material without our prior written consent. All rights are reserved.
            </p>
        </section>
    );
};

export default Policies; 