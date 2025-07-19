'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faTimes, faStarAndCrescent } from '@fortawesome/free-solid-svg-icons';
import styles from './PaymentDialog.module.css';

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSubmit: (paymentData: PaymentData) => void;
    totalAmount: number;
    loading?: boolean;
}

export interface PaymentData {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
    isOpen,
    onClose,
    onPaymentSubmit,
    totalAmount,
    loading = false
}) => {
    const [paymentData, setPaymentData] = useState<PaymentData>({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    const [errors, setErrors] = useState<Partial<PaymentData>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof PaymentData]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<PaymentData> = {};

        if (!paymentData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
            newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        if (!paymentData.cardholderName.trim()) {
            newErrors.cardholderName = 'Cardholder name is required';
        }

        if (!paymentData.expiryMonth || !paymentData.expiryYear) {
            newErrors.expiryMonth = 'Expiry date is required';
        }

        if (!paymentData.cvv.match(/^\d{3,4}$/)) {
            newErrors.cvv = 'Please enter a valid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onPaymentSubmit(paymentData);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setPaymentData(prev => ({
            ...prev,
            cardNumber: formatted
        }));
        if (errors.cardNumber) {
            setErrors(prev => ({
                ...prev,
                cardNumber: ''
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <FontAwesomeIcon icon={faCreditCard} className={styles.titleIcon} />
                        <h2>Payment Details</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.amountDisplay}>
                        <span>Total Amount:</span>
                        <span className={styles.amount}>€{totalAmount.toFixed(2)}</span>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.paymentForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={paymentData.cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
                            />
                            {errors.cardNumber && <span className={styles.errorText}>{errors.cardNumber}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cardholderName">Cardholder Name</label>
                            <input
                                type="text"
                                id="cardholderName"
                                name="cardholderName"
                                value={paymentData.cardholderName}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                className={`${styles.input} ${errors.cardholderName ? styles.error : ''}`}
                            />
                            {errors.cardholderName && <span className={styles.errorText}>{errors.cardholderName}</span>}
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label htmlFor="expiryMonth">Expiry Month</label>
                                <select
                                    id="expiryMonth"
                                    name="expiryMonth"
                                    value={paymentData.expiryMonth}
                                    onChange={handleInputChange}
                                    className={`${styles.select} ${errors.expiryMonth ? styles.error : ''}`}
                                >
                                    <option value="">MM</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month.toString().padStart(2, '0')}>
                                            {month.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="expiryYear">Expiry Year</label>
                                <select
                                    id="expiryYear"
                                    name="expiryYear"
                                    value={paymentData.expiryYear}
                                    onChange={handleInputChange}
                                    className={`${styles.select} ${errors.expiryYear ? styles.error : ''}`}
                                >
                                    <option value="">YY</option>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                        <option key={year} value={year.toString().slice(-2)}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="cvv">CVV</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    value={paymentData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    maxLength={4}
                                    className={`${styles.input} ${styles.cvvInput} ${errors.cvv ? styles.error : ''}`}
                                />
                                {errors.cvv && <span className={styles.errorText}>{errors.cvv}</span>}
                            </div>
                        </div>

                        {/* <div className={styles.securityNote}>
                            <FontAwesomeIcon icon={faLock} className={styles.lockIcon} />
                            <span>Your payment information is secure and encrypted</span>
                        </div> */}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        Pay €{totalAmount.toFixed(2)}
                                        <FontAwesomeIcon icon={faStarAndCrescent} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentDialog; 