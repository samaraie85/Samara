import styles from './Policies.module.css';
import Image from 'next/image';

interface OrderItem {
    id: string;
    product: string;
    qty: number;
    price: number;
    total_price: number;
    products: {
        id: string;
        name: string;
        image: string;
        price: number;
        discount_price: number;
    };
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    price: number;
    final_price: number;
    first_name: string;
    second_name: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    street: string;
    floor: string;
    landmark: string;
    promocode: string | null;
    discount: number;
    donation: number;
    delivery: number;
    transacation: string;
    notes: string | null;
}

interface PoliciesProps {
    order: Order;
    orderItems: OrderItem[];
}

const Policies: React.FC<PoliciesProps> = ({ order, orderItems }) => {
    console.log('Policies component received order:', order); // Debug log

    const formatPrice = (price: number) => {
        return `€${price.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAddress = () => {
        const parts = [];
        if (order.street) parts.push(order.street);
        if (order.floor) parts.push(`Floor: ${order.floor}`);
        if (order.landmark) parts.push(`Near: ${order.landmark}`);
        if (order.city) parts.push(order.city);
        if (order.country) parts.push(order.country);
        return parts.length > 0 ? parts.join(', ') : 'No address provided';
    };

    return (
        <section className={styles.policies}>
            <div className={styles.container}>
                <div className={styles.orderDetails}>


                    {/* Order Information */}
                    <div className={styles.section}>
                        <h3>Order Information</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <strong>Order ID:</strong>
                                <span>{order.id}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <strong>Order Date:</strong>
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <strong>Status:</strong>
                                <span className={styles.statusBadge}>{order.status}</span>
                            </div>

                        </div>
                        {order.notes && (
                            <div className={styles.notesSection}>
                                <strong>Order Notes:</strong>
                                <p>{order.notes}</p>
                            </div>
                        )}

                    </div>

                    <div className={styles.section0}>
                        {/* Shipping Information */}
                        <div className={styles.section}>
                            <h3>Shipping Information</h3>
                            {/* <div className={styles.shippingInfo}> */}
                            <div className={styles.customerInfo} >
                                <h4>Customer Details</h4>
                                <p><strong>Name:</strong> {order.first_name} {order.second_name}</p>
                                <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                                <p><strong>Email:</strong> {order.email || 'N/A'}</p>
                            </div>

                            {/* </div> */}
                            {/* <div className={styles.shippingInfo}> */}
                            <div className={styles.addressInfo} style={{
                                marginTop: '20px',
                            }}>
                                <h4>Delivery Address</h4>
                                <p>{formatAddress()}</p>
                            </div>
                            {/* </div> */}
                        </div>

                        {/* Order Summary */}
                        <div className={styles.section}>
                            <h3>Order Summary</h3>
                            <div className={styles.summary}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order.price)}</span>
                                </div>
                                {order.delivery > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Delivery Fee:</span>
                                        <span>{formatPrice(order.delivery)}</span>
                                    </div>
                                )}
                                {order.promocode && (
                                    <div className={styles.infoItem}>
                                        <strong>Promo Code:</strong>
                                        <span>{order.promocode}</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Discount:</span>
                                        <span className={styles.discount}>-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                {order.donation > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Donation:</span>
                                        <span>{formatPrice(order.donation)}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                    <span>Total Amount:</span>
                                    <span>{formatPrice(order.final_price)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className={styles.section}>
                        <h3>Order Items</h3>
                        <div className={styles.itemsList}>
                            {orderItems && orderItems.length > 0 ? (
                                orderItems.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div className={styles.itemImage}>
                                            <Image
                                                src={item.products?.image || '/placeholder-image.png'}
                                                alt={item.products?.name || 'Product'}
                                                width={80}
                                                height={80}
                                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h4>{item.products?.name || 'Unknown Product'}</h4>
                                            <p>Quantity: {item.qty}</p>
                                            <p>Price: {formatPrice(item.price)} each</p>
                                            <p className={styles.itemTotal}>Total: {formatPrice(item.total_price)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No items found for this order.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Policies; 