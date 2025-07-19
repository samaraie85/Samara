import styles from './MobileAppSection.module.css';
import Image from 'next/image';
import phoneImage from '../assets/phone-mock-up.png'; 
import appStore from '../assets/appstore.png'; 
import googlePlay from '../assets/googleplay.png'; 

const MobileAppSection = () => {
    return (
        <section className={styles.mobileAppSection}>
            <div className={styles.leftContent}>
                <h1 className={styles.samara}>Samara</h1>
                <h2 className={styles.mobileApp}>Mobile<span> Application</span></h2>
                <p className={styles.description}>
                    Samara is an Arabic brand,specializing in selling high quality Arabic products that are distinguished by their arabic authenticity.Samara Established in 2024 and its goal is to feel good and return to using our authentic arabic products.
                </p>
                <p className={styles.description}>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
                <div className={styles.storeButtons}>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image src={appStore} alt="App Store" width={160} />
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image src={googlePlay} alt="Google Play" width={160} />
                    </a>
                </div>
            </div>
            <div className={styles.rightContent}>
                <div className={styles.phoneWrapper}>
                    <Image src={phoneImage} alt="Samara App on Phone" width={400} className={styles.phoneImage} />

                </div>
            </div>
        </section>
    );
};

export default MobileAppSection; 