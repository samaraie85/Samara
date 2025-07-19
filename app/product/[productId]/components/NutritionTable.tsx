'use client'
import styles from './ProductDetail.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


// Nutrition data structure
interface NutritionItem {
    point: string;
    value: number;
    unit: string;
}

interface NutritionTableProps {
    nutritionData?: NutritionItem[];
    productName: string;
}

const NutritionTable = ({ nutritionData = [], productName }: NutritionTableProps) => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });


    return (
        <div className={styles.nutritionSection}>
            <h2 data-aos="fade-up" className={styles.sectionTitle}>Nutritional value per 100 grams of {productName}:</h2>

            <div data-aos="fade-up" className={styles.nutritionTableContainer}>
                <table className={styles.nutritionTable}>
                    <thead>
                        <tr>
                            <th className={styles.nutrientHeader}>Nutrient</th>
                            <th className={styles.amountHeader}>Amount per 100g</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nutritionData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                <td className={styles.nutrientCell}>{item.point}</td>
                                <td className={styles.amountCell}>{item.value} {item.unit}</td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutritionTable; 