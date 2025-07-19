import styles from './Hero.module.css';
import Navbar from '../../shared_components/Navbar';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <Navbar />
            <h1>Health and wellbeing</h1>
             
        </section>
    );
};

export default Hero; 