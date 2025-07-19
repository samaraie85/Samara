import styles from './ProductDetail.module.css';

interface ProductUsesProps {
    uses?: string;
}

const ProductUses = ({ uses }: ProductUsesProps) => {
    // If uses are provided as a string, try to parse as JSON or use as is
    let usesList = [];
    if (uses) {
        try {
            const parsed = JSON.parse(uses);
            usesList = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error parsing uses:', errorMessage);
            // If it's not valid JSON, use the string as a single use
            usesList = [uses];
        }
    }

    // Default uses if none provided
    if (!usesList.length) {
        usesList = [
            "Strawberries can be eaten fresh as a snack.",
            "It can be added to smoothies and refreshing drinks.",
            "They can be used to prepare desserts such as tiramisu and cakes.",
            "Strawberry jam can be prepared or added to yogurt."
        ];
    }

    return (
        <div className={styles.usesSection}>
            <h2 className={styles.sectionTitle}>Uses:</h2>
            <div className={styles.usesList}>
                {usesList.map((use, index) => (
                    <p key={index}>{use}</p>
                ))}
            </div>
        </div>
    );
};

export default ProductUses; 