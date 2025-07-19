import styles from './Hero.module.css';
import Navbar from '../../shared_components/Navbar';

// Define the Category interface
interface Category {
    id: number;
    name: string;
    desc?: string;
    image?: string;
    image_url?: string;
}

interface HeroProps {
    category: Category | null;
}

const Hero = ({ category }: HeroProps) => {
    return (
        <section className={styles.hero}>
            <Navbar />
            <div className={styles.heroContent}>
                <h1 className={styles.title}>
                    {category ? category.name : 'All Products'}
                </h1>

            </div>
        </section>
    );
};

export default Hero; 