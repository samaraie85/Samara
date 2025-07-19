import React from 'react';
import styles from '../Cart.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
// import imageplaceholder from '../../assets/test/image.png';

interface CartItemProps {
    image: string;
    name: string;
    category: string;
    supplier: string;
    price: number;
    discount_price: number;
    unit: string;
    unitShortName: string;
    qty_per_unit: number;
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ image, name, supplier, price, discount_price, category, quantity, unitShortName, qty_per_unit, onIncrement, onDecrement, onRemove }) => (
    <div className={styles.cartItem}>
        <Image src={image} width={300} height={265} alt={name} className={styles.cartItemImage} />
        <div className={styles.cartItemInfo}>
            <div className={styles.cartItemTitleRow}>
                <div className={styles.cartItemTitle}>{name}</div>
                <button className={styles.cartItemRemove} onClick={onRemove} title="Remove">
                    <FontAwesomeIcon icon={faTrashCan} />
                </button>
            </div>
            <div className={styles.cartItemColumn}>

                <div className={styles.cartItemCategory}>{category}</div>
                <div className={styles.cartItemSupplier}>Country of Origin: <span style={{ color: '#DCA900' }}>{supplier}</span></div>

            </div>
            <div className={styles.cartItemPriceRow}>
                <div className={styles.cartItemPrice}>
                    {(discount_price && discount_price !== 0) ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{
                                    textDecoration: 'line-through',
                                    color: '#E92B2B',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    €{price.toFixed(2)}
                                </span>
                                <span className={styles.cartItemPriceMain} style={{ color: '#4CAF50', fontWeight: '600' }}>
                                    €{discount_price.toFixed(2)}
                                    <span className={styles.cartItemPriceUnit}>, €{discount_price.toFixed(2)} per {qty_per_unit} {unitShortName}</span>
                                </span>

                            </div>
                        </>
                    ) : (
                        <>
                            <span className={styles.cartItemPriceMain}>€{price.toFixed(2)}</span>
                            <span className={styles.cartItemPriceUnit}>, €{price.toFixed(2)} per {qty_per_unit} {unitShortName}</span>
                        </>
                    )}
                </div>
                <div className={styles.cartItemQuantityRow}>
                    <span>Quantity :</span>
                    <div className={styles.cartItemQuantityControls}>
                        <button
                            onClick={onDecrement}
                            disabled={quantity <= 1}
                            className={styles.cartItemQtyBtndec}
                            title={`Decrease by 1`}
                        >
                            <FontAwesomeIcon icon={faMinus} style={{ fontSize: '0.9rem' }} />
                        </button>
                        <span className={styles.cartItemQtyValue} title={`Min: ${1}, Step: ${1}`}>
                            {quantity}
                        </span>
                        <button
                            onClick={onIncrement}
                            className={styles.cartItemQtyBtninc}
                            title={`Increase by 1`}
                        >
                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.9rem' }} />
                        </button>
                    </div>

                </div>
            </div>


        </div>

    </div>
);

export default CartItem; 