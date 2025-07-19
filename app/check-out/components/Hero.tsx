import styles from './Hero.module.css';
import Navbar from '../../shared_components/Navbar';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';


const Hero = () => {
    return (
        <section className={styles.hero}>
            <Navbar />
            <div className={styles.heroContent}>
                <h1 className={styles.title}>
                    Check Out
                </h1>
                <div className={styles.breadcrumbs}>
                    <Link href="/">
                        <span>Home</span>
                    </Link>
                    <FontAwesomeIcon icon={faAngleRight} />
                    <Link href="/shopping-cart">
                        <span>Cart</span>
                    </Link>
                    <FontAwesomeIcon icon={faAngleRight} />
                    <span className={styles.active}>Check Out</span>
                </div>
            </div>
        </section>
    );
};

export default Hero; 