import React from 'react';
import styles from '../Cart.module.css';

interface CartInfoHeaderProps {
    itemCount: number;
}

const CartInfoHeader: React.FC<CartInfoHeaderProps> = ({ itemCount }) => (
    <div className={styles.cartInfoHeader}>
        <h2><span style={{ color: '#FFD54A' }}>Cart</span> Info</h2>
        <div className={styles.cartInfoCount}>({itemCount}) Items</div>
    </div>
);

export default CartInfoHeader; 