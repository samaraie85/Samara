import React from 'react';
import styles from '../Cart.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStarAndCrescent } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
interface OrderSummaryProps {
    totalItems: number;
    subtotal: number;
    tax: number;
    delivery: number;
    total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalItems, subtotal, tax, delivery, total }) => (
    <div className={styles.orderSummary}>
        <h3><span style={{ color: '#CDA00D' }}>Order</span> Summary</h3>
        <div className={styles.orderSummaryRow}>Total Items <span style={{ color: '#CDA00D' }}>{totalItems}</span></div>
        <div className={styles.orderSummaryRow}>Subtotal <span style={{ color: '#CDA00D' }}>{subtotal} <span style={{ color: '#000' }}>€</span></span></div>
        <div className={styles.orderSummaryRow}>Tax <span style={{ color: '#CDA00D' }}>{tax} <span style={{ color: '#000' }}>€</span></span></div>
        <div className={styles.orderSummaryRow}>Delivery <span style={{ color: '#CDA00D' }}>{delivery} <span style={{ color: '#000' }}>€</span></span></div>
        <div className={`${styles.orderSummaryRow} ${styles.orderSummaryTotal}`}>Total <span style={{ color: '#CDA00D' }}>{total} <span style={{ color: '#000' }}>€</span></span></div>
        <Link href="/check-out" className={styles.orderSummaryBuy}>Buy now <FontAwesomeIcon icon={faStarAndCrescent} /></Link>
    </div>
);

export default OrderSummary; 