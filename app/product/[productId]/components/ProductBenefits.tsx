import styles from './ProductDetail.module.css';

interface ProductBenefitsProps {
    benefits?: string;
}

const ProductBenefits = ({ benefits }: ProductBenefitsProps) => {
    // If benefits are provided as a string, try to parse as JSON or use as is
    let benefitsList = [];
    if (benefits) { 
        try {
            const parsed = JSON.parse(benefits);
            benefitsList = Array.isArray(parsed) ? parsed : [benefits];
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error parsing benefits:', errorMessage);
            // If it's not valid JSON, use the string as a single benefit
            benefitsList = [benefits];
        }
    }

    return (
        <div className={styles.benefitsSection}>
            <h2 className={styles.sectionTitle}>Benefits:</h2>
            <div className={styles.benefitsList}>
                {benefitsList.map((benefit, index) => (
                    <p key={index}>{benefit}</p>
                ))}
            </div>
        </div>
    );
};

export default ProductBenefits; 