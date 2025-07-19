import React from 'react';
import CartItem from './CartItem';
import styles from '../Cart.module.css';

interface CartItemData {
    id: number;
    image: string;
    name: string;
    supplier: string;
    price: number;  
    unit: string;
    unitShortName: string;
    discount_price: number;
    qty_per_unit: number;
    quantity: number;
    category: string;
}

interface CartItemListProps {
    items: CartItemData[];
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
    onRemove: (id: number) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ items, onIncrement, onDecrement, onRemove }) => (
    <div className={styles.cartItemList}>
        {items.map(item => (
            <CartItem
                key={item.id}
                image={item.image}
                name={item.name}
                supplier={item.supplier}
                price={item.price}
                discount_price={item.discount_price}
                unit={item.unit}
                unitShortName={item.unitShortName}
                qty_per_unit={item.qty_per_unit}
                quantity={item.quantity}
                category={item.category}
                onIncrement={() => onIncrement(item.id)}
                onDecrement={() => onDecrement(item.id)}
                onRemove={() => onRemove(item.id)}
            />
        ))}
    </div>
);

export default CartItemList; 