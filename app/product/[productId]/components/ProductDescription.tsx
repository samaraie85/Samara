import styles from './ProductDetail.module.css';

interface ProductDescriptionProps {
    description: string;
}

const ProductDescription = ({ description }: ProductDescriptionProps) => {
    return (
        <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Description:</h2>
            <p className={styles.descriptionText}>
                {description || `
          Egyptian strawberry First Class.
          
          Strawberries are considered a delicious and refreshing fruit that
          belongs to the Rosaceae family, and is characterized by its
          bright red colour and sweet and sour taste. Strawberries are one
          of the most popular summer fruits, and are considered a rich
          source of many essential vitamins and minerals that support
          overall body health. It also contains powerful antioxidants that
          help protect the body from chronic diseases.
        `}
            </p>
        </div>
    );
};

export default ProductDescription; 