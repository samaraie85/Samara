import styles from './Hero.module.css';
import Navbar from '../../shared_components/Navbar';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <Navbar />
            <h1>Delivery Deal</h1>
             
        </section>
    );
};

export default Hero; 