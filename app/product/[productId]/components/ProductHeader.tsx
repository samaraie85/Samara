import styles from './ProductDetail.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar } from '@fortawesome/free-solid-svg-icons';

interface ProductHeaderProps {
    name: string;
    price: number;
    discountPrice: number;
    unitPrice?: number;
    unit: string;
    supplier: string;
    rating: number;
    qty_per_unit: number;
    description: string;
    sold_amount: number;
    remaining_amount: number;
}

const ProductHeader = ({ sold_amount, remaining_amount, name, price, discountPrice, unitPrice, unit, supplier, rating, qty_per_unit, description }: ProductHeaderProps) => {
    return (
        <div className={styles.productHeader}>
            <div className={styles.titleContainer}>
                <Link href="/category" className={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <h1 className={styles.productTitle}>{name}</h1>
                <div className={styles.priceTag}>
                    <FontAwesomeIcon icon={faStar} />
                    <span className={styles.pointsValue}>{rating} pt</span>
                </div>
            </div>

            <div className={styles.productDescription}>
                <h1 className={styles.descriptionTitle}>Description:</h1>
                <p className={styles.descriptionText}>{description}</p>
                <div className={styles.priceContainer}>
                    {discountPrice && discountPrice > 0 ? (
                        <>
                            <span className={styles.originalPrice}>€{price.toFixed(2)}</span>
                            <span className={styles.discountPrice}>€{discountPrice.toFixed(2)}</span>
                            {unitPrice && <span className={styles.unitPrice}>, €{(discountPrice).toFixed(2)} per {qty_per_unit} {unit}</span>}
                        </>
                    ) : (
                        <>
                            <span className={styles.price}>€{price.toFixed(2)}</span>
                            {unitPrice && <span className={styles.unitPrice}>, €{unitPrice.toFixed(2)} per {qty_per_unit} {unit}</span>}
                        </>
                    )}
                </div>

                <div className={styles.supplierContainer}>
                    <span className={styles.supplierLabel}>Country of Origin: </span>
                    <span className={styles.supplierValue}>{supplier}</span>
                </div>
                <div className={styles.inventoryContainer}>
                    <div className={styles.soldContainer}>
                        <span className={styles.soldLabel}>Sold: </span>
                        <span className={styles.soldValue}>{sold_amount}</span>
                    </div>
                    <div className={styles.remainingContainer}>
                        <span className={styles.remainingLabel}>Remaining: </span>
                        <span className={styles.remainingValue}>{remaining_amount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductHeader; 