import Image from 'next/image';
import styles from './LoadingUI.module.css';
import loadingGif from '../assets/loading_1.gif';

const LoadingUI = () => {
    return (
        <div className={styles.loadingContainer}>
            <Image
                src={loadingGif}
                alt="Loading..."
                width={100}
                height={100}
                className={styles.loadingImage}
            />
            <p className={styles.loadingText}>Loading...</p>
        </div>
    );
};

export default LoadingUI; 