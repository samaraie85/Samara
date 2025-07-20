'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './checkout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStarAndCrescent, faLocationDot, faTrashCan, faExclamationTriangle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mapImg from '../../assets/map.png';
import paymentMethodIcon from '../../assets/image.png';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import PaymentDialog, { PaymentData } from './PaymentDialog';
import AOS from 'aos';
import 'aos/dist/aos.css';


interface City {
    id: string;
    name: string;
    is_active: string; // Changed to only handle string values "Y" or "N"
}
interface Address {
    id: string;
    user: string;
    country: string;
    city_id: string;
    city: string; // City name for display
    street: string;
    floor: string;
    landmark: string;
}



const Checkout = () => {
    const router = useRouter();

    // Contact info form state
    const [contactFormData, setContactFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });
    // Address form state
    const [addressFormData, setAddressFormData] = useState({
        country: 'Ireland',
        city_id: '',
        city: '',
        street: '',
        floor: '',
        landmark: ''
    });

    // Order summary state
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        tax: 0,
        delivery: 0,
        total: 0,
        items: 0
    });

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showCityWarning, setShowCityWarning] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    // const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [notes, setNotes] = useState('');
    const [promoCodeStatus, setPromoCodeStatus] = useState<{ verified: boolean; message: string; discount?: number }>({ verified: false, message: '' });
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [donationActive, setDonationActive] = useState(false);
    const [charityDiscount, setCharityDiscount] = useState<{ active: boolean; percentage: number }>({ active: false, percentage: 0 });
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);

    // Add derived state for out-of-service
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    const selectedCityObj = selectedAddress ? cities.find(c => c.name.toLowerCase() === selectedAddress.city.toLowerCase()) : null;
    const isOutOfService = selectedCityObj && selectedCityObj.is_active !== 'Y';

    // Calculate discount amount and final total
    const discountAmount = promoCodeStatus.verified && promoCodeStatus.discount
        ? (orderSummary.subtotal * promoCodeStatus.discount) / 100
        : 0;
    const charityDiscountAmount = charityDiscount.active
        ? (orderSummary.subtotal * charityDiscount.percentage) / 100
        : 0;
    const donationAmount = donationActive ? 0.50 : 0;

    // If both can apply, use sum:
    const totalDiscount = discountAmount + charityDiscountAmount;

    // Validate orderSummary before calculation
    const validOrderSummary = orderSummary &&
        typeof orderSummary.total === 'number' &&
        !isNaN(orderSummary.total) &&
        orderSummary.total >= 0;

    // Use one of the following:
    const finalTotal = validOrderSummary
        ? Math.max(0, orderSummary.total - totalDiscount + donationAmount)
        : 0;

    // Debug logging for calculation
    if (process.env.NODE_ENV === 'development') {
        console.log('Checkout Calculation Debug:', {
            orderSummary: orderSummary,
            validOrderSummary: validOrderSummary,
            discountAmount: discountAmount,
            charityDiscountAmount: charityDiscountAmount,
            donationAmount: donationAmount,
            finalTotal: finalTotal,
            promoCodeStatus: promoCodeStatus,
            charityDiscount: charityDiscount,
            donationActive: donationActive
        });
    }

    const handlePlaceOrder = () => {
        if (isOutOfService) return;
        setShowAddressConfirmation(true);
    };

    const handleConfirmAddress = () => {
        setShowAddressConfirmation(false);
        setShowPaymentDialog(true);
    };

    const handleCancelAddress = () => {
        setShowAddressConfirmation(false);
    };

    // Fetch cart summary and user session
    useEffect(() => {
        const fetchCartSummaryAndUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                if (!userId) {
                    setOrderSummary({ subtotal: 0, tax: 0, delivery: 0, total: 0, items: 0 });
                    setUser(null);
                    return;
                }
                setUser(session.user);

                const response = await fetch(`/api/cart/summary?user=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrderSummary({
                        subtotal: data.subtotal || 0,
                        tax: data.tax || 0,
                        delivery: data.delivery || 0,
                        total: data.total || 0,
                        items: data.items || 0
                    });
                }
            } catch {
                setOrderSummary({ subtotal: 0, tax: 0, delivery: 0, total: 0, items: 0 });
            }
        };
        fetchCartSummaryAndUser();
    }, []);

    // Fetch addresses and cities when user is available
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            try {
                const response = await fetch(`/api/users/address?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setAddresses(data.addresses || []);
                }
            } catch {
                // Handle error silently
            }
        };
        const fetchCities = async () => {
            try {
                const { data, error } = await supabase.from('cities').select('id, name, is_active').order('name', { ascending: true });
                if (error) throw error;
                setCities(data || []);
            } catch {
                // Handle error silently
            }
        };
        fetchAddresses();
        fetchCities();
    }, [user]);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    // Contact info change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Address form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddressFormData({ ...addressFormData, [name]: value });
    };

    const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const city = cities.find(c => c.id === value);
        setAddressFormData({
            ...addressFormData,
            city_id: value,
            city: city?.name || '' // Set the city name when selecting
        });
        setSelectedCity(city || null);
        setShowCityWarning(city?.is_active !== 'Y');
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setAddressFormData({ country: 'Ireland', city_id: '', city: '', street: '', floor: '', landmark: '' });
        setShowForm(true);
    };

    const handleClosePaymentDialog = () => {
        setShowPaymentDialog(false);
        setPaymentLoading(false);
    };

    // Generate unique random reference
    const generateUniqueReference = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `REF-${timestamp}-${random}`.toUpperCase();
    };

    async function getSHA512(input: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await window.crypto.subtle.digest("SHA-512", data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    const getToken = async () => {
        try {
            const nonce = new Date().toISOString();
            const appKeySecret = process.env.BOIPA_APP_KEY_SECRET;
            const secretInput = nonce + appKeySecret;
            const secret = await getSHA512(secretInput);

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("X-GP-Version", "2021-03-22");

            const raw = JSON.stringify({
                app_id: process.env.BOIPA_APP_ID,
                secret,
                grant_type: "client_credentials",
                nonce
            });

            const res = await fetch("https://apis.sandbox.boipagateway.com/ucp/accesstoken", {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow" as RequestRedirect
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            return json.token;
        } catch (err) {
            return (err as Error).message;
        }
    };

    const handlePaymentSubmit = async (paymentData: PaymentData) => {
        setPaymentLoading(true);
        try {
            // Validate required data
            if (!user || !selectedAddressId) {
                throw new Error('Missing user or address information');
            }

            // Validate finalTotal before sending to payment gateway
            if (typeof finalTotal !== 'number' || isNaN(finalTotal) || finalTotal <= 0) {
                throw new Error(`Invalid final total: ${finalTotal}. Please refresh the page and try again.`);
            }

            // Ensure finalTotal is properly formatted (2 decimal places for currency)
            const formattedAmount = parseFloat(finalTotal.toFixed(2));

            // Additional validation for payment gateway requirements
            if (formattedAmount < 0.01) {
                throw new Error('Order total must be at least €0.01');
            }

            if (formattedAmount > 999999.99) {
                throw new Error('Order total cannot exceed €999,999.99');
            }

            // Debug logging
            // console.log('Payment Debug Info:', {
            //     orderSummary: orderSummary,
            //     discountAmount: discountAmount,
            //     charityDiscountAmount: charityDiscountAmount,
            //     donationAmount: donationAmount,
            //     finalTotal: finalTotal,
            //     formattedAmount: formattedAmount,
            //     amountString: formattedAmount.toString(),
            //     amountValidation: {
            //         isNumber: typeof formattedAmount === 'number',
            //         isFinite: isFinite(formattedAmount),
            //         isPositive: formattedAmount > 0,
            //         hasValidRange: formattedAmount >= 0.01 && formattedAmount <= 999999.99
            //     }
            // });

            // Generate unique reference for this transaction
            const uniqueReference = generateUniqueReference();

            // Get payment token
            const token = await getToken();
            if (typeof token === 'string' && token.includes('Error')) {
                throw new Error(`Failed to get payment token: ${token}`);
            }

            // Process payment with real card data
            const paymentResponse = await fetch("https://apis.sandbox.boipagateway.com/ucp/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "X-GP-Version": "2021-03-22"
                },
                body: JSON.stringify({
                    account_name: "transaction_processing",
                    channel: "CNP",
                    capture_mode: "AUTO",
                    type: "SALE",
                    amount: formattedAmount.toString(),
                    currency: "EUR",
                    reference: uniqueReference,
                    country: "IE",
                    payment_method: {
                        "name": paymentData.cardholderName,
                        "entry_mode": "ECOM",
                        "card": {
                            "number": paymentData.cardNumber.replace(/\s/g, ''),
                            "expiry_month": paymentData.expiryMonth,
                            "expiry_year": paymentData.expiryYear,
                            "cvv": paymentData.cvv,
                            "cvv_indicator": "PRESENT",
                            "avs_address": "",
                            "avs_postal_code": "",
                        }
                    }
                })
            });

            const paymentResult = await paymentResponse.text();

            let paymentJson;
            try {
                paymentJson = JSON.parse(paymentResult);
            } catch {
                throw new Error('Invalid payment response format');
            }

            // Check if payment was successful
            if (!paymentResponse.ok || paymentJson.status !== 'CAPTURED') {
                throw new Error(`Payment failed: ${paymentJson.message || 'Unknown error'}`);
            }

            // Prepare order data for database
            const orderData = {
                userId: user.id,
                addressData: selectedAddress,
                contactInfo: contactFormData,
                promoCode: promoCodeStatus.verified ? promoCode : null,
                discount: discountAmount,
                charityDiscount: charityDiscountAmount,
                donation: donationAmount,
                notes: notes,
                transactionCode: paymentJson.id,
                finalTotal: finalTotal,
                orderSummary: {
                    subtotal: orderSummary.subtotal,
                    tax: orderSummary.tax,
                    delivery: orderSummary.delivery,
                    total: orderSummary.total,
                    items: orderSummary.items
                },
            };

            // Create order in your database
            const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const orderResult = await orderResponse.json();

            // Close dialog and show success
            setShowPaymentDialog(false);
            setPaymentLoading(false);

            // Show success message with transaction details
            alert(`Payment successful! Order placed with reference: ${orderResult.orderId}`);
            router.push(`/order-details/${orderResult.orderId}`);

        } catch (error) {
            setPaymentLoading(false);
            alert(`Payment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
        }
    };



    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setAddressFormData({
            country: 'Ireland',
            city_id: address.city_id || '',
            city: address.city || '',
            street: address.street || '',
            floor: address.floor || '',
            landmark: address.landmark || ''
        });
        setShowForm(true);
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const response = await fetch(`/api/users/address?userId=${user.id}&addressId=${addressId}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete address');
            // Refresh the addresses list
            const res = await fetch(`/api/users/address?userId=${user.id}`);
            const addrData = await res.json();
            setAddresses(addrData.addresses || []);
        } catch {
            alert('Failed to delete address. Please try again.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const addressData = { ...addressFormData, id: editingAddress?.id };
            if (!addressFormData.city_id || addressFormData.city_id === 'new-city') {
                if (!addressFormData.city.trim()) {
                    alert('Please enter a city name');
                    return;
                }
            }
            const response = await fetch('/api/users/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, addressData })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save address');
            setShowForm(false);
            // Refresh addresses and cities
            const res = await fetch(`/api/users/address?userId=${user.id}`);
            const addrData = await res.json();
            setAddresses(addrData.addresses || []);
            const { data: citiesData } = await supabase.from('cities').select('id, name, is_active').order('name', { ascending: true });
            setCities(citiesData || []);
        } catch {
            alert('Failed to save address. Please try again.');
        }
    };

    const handleVerifyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoCodeStatus({ verified: false, message: 'Please enter a promo code' });
            return;
        }

        if (!user) {
            setPromoCodeStatus({ verified: false, message: 'Please log in to verify promo code' });
            return;
        }

        // Check if the promocode is "charity" (case insensitive)
        if (promoCode.trim().toLowerCase() === 'charity') {
            if (finalTotal > 100) {
                setPromoCodeStatus({
                    verified: false,
                    message: 'Charity discount is only available for orders under €100'
                });
                return;
            }

            setPromoCodeLoading(true);
            try {
                const response = await fetch(`/api/charity/check-discount?userId=${user.id}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.eligible) {
                        setCharityDiscount({ active: true, percentage: 50 });
                        setPromoCodeStatus({
                            verified: true,
                            message: 'Charity discount applied! 50% off',
                            discount: 0 // Set to 0 since charity discount is handled separately
                        });
                    } else {
                        setPromoCodeStatus({
                            verified: false,
                            message: data.message || 'You are not eligible for charity discount'
                        });
                    }
                } else {
                    setPromoCodeStatus({
                        verified: false,
                        message: 'Failed to verify charity eligibility'
                    });
                }
            } catch {
                setPromoCodeStatus({
                    verified: false,
                    message: 'Failed to verify charity eligibility'
                });
            } finally {
                setPromoCodeLoading(false);
            }
            return;
        }

        setPromoCodeLoading(true);
        setPromoCodeStatus({ verified: false, message: '' });

        try {
            const response = await fetch(`/api/promocode/verify?code=${promoCode}&userId=${user.id}`);
            const data = await response.json();

            if (!response.ok) {
                setPromoCodeStatus({ verified: false, message: data.message || 'Failed to verify promo code' });
                return;
            }

            if (data.valid) {
                setPromoCodeStatus({
                    verified: true,
                    message: `Promo code applied! ${data.discount_value}% off`,
                    discount: data.discount_value
                });
            } else {
                setPromoCodeStatus({ verified: false, message: data.message || 'Invalid promo code' });
            }
        } catch {
            setPromoCodeStatus({ verified: false, message: 'Failed to verify promo code. Please try again.' });
        } finally {
            setPromoCodeLoading(false);
        }
    };

    const handleDonationToggle = () => {
        setDonationActive(!donationActive);
    };

    const handleRemovePromoCode = () => {
        setPromoCode('');
        setPromoCodeStatus({ verified: false, message: '' });
        setCharityDiscount({ active: false, percentage: 0 });
    };

    return (
        <section className={styles.checkout}>
            <h2 data-aos="fade-down"><span>purchase</span> product</h2>
            <div className={styles.checkoutDivider}>
                <div className={styles.checkoutDividerLeft} data-aos="fade-right">
                    <div className={styles.contactInfo} data-aos="fade-up">
                        <h3>
                            <span>Contact</span> Information
                        </h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">
                                    First Name<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Type Your First Name"
                                    value={contactFormData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">
                                    Last Name<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Type Your Last Name"
                                    value={contactFormData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">
                                    Phone Number<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="Type Your Phone number"
                                    value={contactFormData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">
                                    Email<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Type Your Email"
                                    value={contactFormData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.addressInfo} data-aos="fade-up">
                        <h3>
                            <span>Select</span> Address
                        </h3>
                        <div className={styles.addressList}>
                            {addresses.length === 0 && !showForm ? (
                                <div>No addresses found.</div>
                            ) : (
                                <>
                                    {isOutOfService && (
                                        <div className={styles.cityWarning}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
                                            <span>The chosen area is out of service right now. Please select an available address.</span>
                                        </div>
                                    )}
                                    {!showForm && (
                                        <>
                                            {addresses.map(address => (
                                                <div
                                                    key={address.id}
                                                    className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.selectedAddressCard : ''}`}
                                                    onClick={() => {
                                                        setSelectedAddressId(address.id);
                                                    }}
                                                    tabIndex={0}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={styles.addressContent}>
                                                        <Image src={mapImg} width={90} height={90} alt="map" />
                                                        <div className={styles.addressHeader}>
                                                            <p className={styles.addressName}>{address.country} <span> ({address.city}) </span></p>
                                                            <p className={styles.addressLine}>{address.floor} {address.street},  {address.city}</p>
                                                            {address.landmark && (
                                                                <p className={styles.addressLine}>{address.landmark}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.addressActions}>
                                                        <div className={`${styles.addressAction} ${styles.editAction}`} onClick={e => { e.stopPropagation(); handleEditAddress(address); }}>Edit</div>
                                                        <div className={`${styles.addressAction} ${styles.deleteAction}`} onClick={e => { e.stopPropagation(); handleDeleteAddress(address.id); }}><FontAwesomeIcon icon={faTrashCan} /></div>
                                                        {selectedAddressId === address.id ? (
                                                            <div className={styles.selectedCheck}>
                                                                <div className={styles.selectedCheckInner}></div>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.unselectedCheck}>
                                                                <div className={styles.unselectedCheckInner}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button className={styles.addAddressButton} onClick={handleAddAddress}>
                                                Add New Address <FontAwesomeIcon icon={faLocationDot} />
                                            </button>

                                        </>
                                    )}
                                    {showForm && (
                                        <form className={styles.addressForm} onSubmit={handleFormSubmit}>
                                            <div className={styles.formField}>
                                                <label className={styles.formLabel}>Country</label>
                                                <input type="text" name="country" value="Ireland" className={styles.formInput} disabled required />
                                            </div>
                                            <div className={styles.formField}>
                                                <label className={styles.formLabel}>City</label>
                                                <select name="city_id" value={addressFormData.city_id || ''} onChange={handleCitySelectChange} className={styles.formInput} required>
                                                    <option className={styles.option} value="" disabled>Select a city</option>
                                                    {cities.map(city => (
                                                        <option className={styles.option} key={city.id} value={city.id}>{city.name}</option>
                                                    ))}
                                                </select>
                                                {showCityWarning && (
                                                    <div className={styles.cityWarning}>
                                                        <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
                                                        <span>Warning: we are not available in {selectedCity?.name} at the moment</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.formField}>
                                                <label className={styles.formLabel}>Street</label>
                                                <input type="text" name="street" value={addressFormData.street} onChange={handleInputChange} className={styles.formInput} required />
                                            </div>
                                            <div className={styles.formField}>
                                                <label className={styles.formLabel}>Floor</label>
                                                <input type="text" name="floor" value={addressFormData.floor} onChange={handleInputChange} className={styles.formInput} required />
                                            </div>
                                            <div className={styles.formField}>
                                                <label className={styles.formLabel}>Landmark (Optional)</label>
                                                <input type="text" name="landmark" value={addressFormData.landmark} onChange={handleInputChange} className={styles.formInput} />
                                            </div>
                                            <div className={styles.formActions}>
                                                <button type="submit" className={styles.submitButton}>{editingAddress ? 'Update Address' : 'Add Address'}</button>
                                                <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.paymentDetails} data-aos="fade-up">
                        <h3>
                            <span>Payment</span> Details
                        </h3>

                        <div className={styles.paymentMethodItem}>
                            <div className={styles.paymentMethodIcon}>
                                <div className={styles.selectedCheck2}>
                                    <div className={styles.selectedCheckInner2}></div>
                                </div>
                                <Image src={paymentMethodIcon} alt="payment method" width={100} />
                            </div>
                        </div>

                    </div>
                </div>
                <div className={styles.checkoutDividerRight} data-aos="fade-left">
                    <div className={styles.orderSummary} data-aos="fade-up">
                        <h3><span style={{ color: '#CDA00D' }}>Order</span> Summary</h3>
                        <div className={styles.orderSummaryRow}>Total Items <span style={{ color: '#CDA00D' }}>
                            {orderSummary.items}
                        </span></div>
                        <div className={styles.orderSummaryRow}>Subtotal <span style={{ color: '#CDA00D' }}>
                            {orderSummary.subtotal}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        <div className={styles.orderSummaryRow}>Tax <span style={{ color: '#CDA00D' }}>
                            {orderSummary.tax}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        <div className={styles.orderSummaryRow}>Delivery <span style={{ color: '#CDA00D' }}>
                            {orderSummary.delivery}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        {charityDiscount.active && (
                            <div className={styles.orderSummaryRow} style={{ color: '#9C27B0' }}>
                                Charity Discount ({charityDiscount.percentage}%)
                                <span style={{ color: '#9C27B0' }}>
                                    -{charityDiscountAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        {promoCodeStatus.verified && promoCodeStatus.discount && (
                            <div className={styles.orderSummaryRow} style={{ color: '#4CAF50' }}>
                                Discount ({promoCodeStatus.discount}%)
                                <span style={{ color: '#4CAF50' }}>
                                    -{discountAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        {donationActive && (
                            <div className={styles.orderSummaryRow} style={{ color: '#E92B2B' }}>
                                Donation
                                <span style={{ color: '#E92B2B' }}>
                                    {donationAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        <div className={`${styles.orderSummaryRow} ${styles.orderSummaryTotal}`}>Total <span style={{ color: '#CDA00D' }}>
                            {finalTotal.toFixed(2)}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        <button
                            onClick={handlePlaceOrder}
                            className={styles.orderSummaryBuy}
                            disabled={isOutOfService || !selectedAddressId}
                            style={{
                                pointerEvents: isOutOfService ? 'none' : 'auto',
                                opacity: isOutOfService ? 0.5 : 1,
                                cursor: isOutOfService ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Place Order  <FontAwesomeIcon icon={faStarAndCrescent} />
                        </button>
                    </div>
                    <button
                        className={styles.donateButton}
                        onClick={handleDonationToggle}
                        style={{
                            opacity: donationActive ? 1 : 0.8,
                            transform: donationActive ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease'
                        }}
                        data-aos="zoom-in"
                    >
                        <span>{donationActive ? 'Remove Donation' : 'Donate To Gaza'}</span>
                        <span>50 Cent</span>
                    </button>
                    <div className={styles.extraFields} data-aos="fade-up">
                        <div className={`${styles.formGroup} ${styles.promocodeGroup}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="text"
                                id="promoCode"
                                name="promoCode"
                                placeholder="Add Your Coupon"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className={styles.formInput}
                                style={{ color: '#000', flex: 1 }}
                            />
                            <button
                                type="button"
                                className={styles.verifyButton}
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={handleVerifyPromoCode}
                                disabled={promoCodeLoading}
                            >
                                {promoCodeLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                        {promoCodeStatus.message && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: promoCodeStatus.verified ? '#e8f5e8' : '#ffeaea',
                                border: `1px solid ${promoCodeStatus.verified ? '#4CAF50' : '#f44336'}`,
                                color: promoCodeStatus.verified ? '#2e7d2e' : '#c62828',
                                fontSize: '14px',
                                fontWeight: '500',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <FontAwesomeIcon
                                    icon={promoCodeStatus.verified ? faCheckCircle : faTimesCircle}
                                    style={{ fontSize: '16px' }}
                                />
                                <span style={{ flex: 1, color: promoCodeStatus.verified ? '#2e7d2e' : '#c62828' }}>{promoCodeStatus.message}</span>
                                {promoCodeStatus.verified && (
                                    <button
                                        onClick={handleRemovePromoCode}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #2e7d2e',
                                            color: '#2e7d2e',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <textarea
                                id="notes"
                                name="notes"
                                placeholder="Notes..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className={styles.formInput}
                                rows={5}
                                style={{ resize: 'none', backgroundColor: '#fff', color: '#000' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Confirmation Popup */}
            {showAddressConfirmation && selectedAddress && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'slideIn 0.3s ease-out',
                        border: '2px solid #CDA00D'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#CDA00D',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                boxShadow: '0 4px 15px rgba(205, 160, 13, 0.3)'
                            }}>
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    style={{
                                        fontSize: '24px',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#333',
                                marginBottom: '5px'
                            }}>
                                Confirm <span style={{ color: '#CDA00D' }}>Delivery Address</span>
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                Please review your delivery address before proceeding
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '15px',
                            padding: '25px',
                            marginBottom: '25px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <Image
                                    src={mapImg}
                                    width={50}
                                    height={50}
                                    alt="map"
                                    style={{ marginRight: '15px' }}
                                />
                                <div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>
                                        Delivery Address
                                    </h4>
                                    <p style={{
                                        margin: '5px 0 0',
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        Your order will be delivered to this address
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Country:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.country}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>City:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.city}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Street:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.street}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Floor:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.floor}</span>
                                </div>

                                {selectedAddress.landmark && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 15px',
                                        backgroundColor: '#fff',
                                        borderRadius: '10px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: '#CDA00D',
                                            minWidth: '80px',
                                            fontSize: '14px'
                                        }}>Landmark:</span>
                                        <span style={{
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>{selectedAddress.landmark}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={handleCancelAddress}
                                style={{
                                    padding: '12px 25px',
                                    border: '2px solid #6c757d',
                                    backgroundColor: 'transparent',
                                    color: '#6c757d',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6c757d';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6c757d';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAddress}
                                style={{
                                    padding: '12px 25px',
                                    border: 'none',
                                    backgroundColor: '#CDA00D',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px',
                                    boxShadow: '0 4px 15px rgba(205, 160, 13, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(205, 160, 13, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(205, 160, 13, 0.3)';
                                }}
                            >
                                Confirm & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Dialog */}
            <PaymentDialog
                isOpen={showPaymentDialog}
                onClose={handleClosePaymentDialog}
                onPaymentSubmit={handlePaymentSubmit}
                totalAmount={finalTotal}
                loading={paymentLoading}
            />
        </section>
    )
}

export default Checkout;