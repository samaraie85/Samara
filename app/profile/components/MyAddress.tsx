'use client'
import React, { useState, useEffect, useCallback } from 'react';
import styles from './MyAddress.module.css';
import { User } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mapImg from '../../assets/map.png';
import { supabase } from '@/lib/supabase';
import AOS from 'aos';
import 'aos/dist/aos.css';
import loadinga from '../../assets/loading_1.gif';

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

interface MyAddressProps {
    user: User;
}

const MyAddress: React.FC<MyAddressProps> = ({ user }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showCityWarning, setShowCityWarning] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        country: 'Ireland',
        city_id: '',
        city: '',
        street: '',
        floor: '',
        landmark: ''
    });
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/address?userId=${user.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch addresses');
            }

            setAddresses(data.addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError(error instanceof Error ? error.message : 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    }, [user.id]);
    // Fetch addresses when component mounts
    useEffect(() => {
        fetchAddresses();
        fetchCities();
    }, [user.id, fetchAddresses]);



    const fetchCities = async () => {
        try {
            const { data, error } = await supabase
                .from('cities')
                .select('id, name, is_active')
                .order('name', { ascending: true });

            if (error) {
                throw error;
            }

            console.log('Cities loaded from DB:', data); // Debug: Check what cities are loaded
            setCities(data || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Don't set global error for cities fetch failure
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        // Find the selected city to check if it's active
        const city = cities.find(c => c.id.toString() === value);

        setFormData({
            ...formData,
            city_id: value,
        });

        // Check if city is active and show warning if not
        if (city) {
            console.log('Selected city:', city, 'Active status:', city?.is_active);
            setSelectedCity(city);
            setShowCityWarning(city?.is_active !== 'Y');
        } else {
            console.log('No city selected');

            setSelectedCity(null);
            setShowCityWarning(false);
        }
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setFormData({
            country: 'Ireland',
            city_id: '',
            city: '',
            street: '',
            floor: '',
            landmark: ''
        });
        setShowForm(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            country: 'Ireland',
            city_id: address.city_id || '',
            city: '',
            street: address.street || '',
            floor: address.floor || '',
            landmark: address.landmark || ''
        });
        setShowForm(true);
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/address?userId=${user.id}&addressId=${addressId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete address');
            }

            // Refresh the addresses list
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address. Please try again.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create a new object with correct field naming for the API
            const addressData = {
                ...formData,
                id: editingAddress?.id
            };

            // If a new city is being added, include both the name and clear any city_id
            if (!formData.city_id || formData.city_id === 'new-city') {
                if (!formData.city.trim()) {
                    alert('Please enter a city name');
                    return;
                }
            }

            console.log('Submitting address data:', addressData);

            const response = await fetch('/api/users/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    addressData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save address');
            }

            // Close form and refresh addresses
            setShowForm(false);
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
        }
    };

    if (loading) {
        return <div className={styles.loading}><Image src={loadinga} alt="loading" width={100} height={100} /></div>;

    }

    if (error) {
        return (
            <div className={styles.profileInfo}>
                <div className={styles.error}>Error: {error}</div>
                <button className={styles.addAddressButton} onClick={handleAddAddress}>
                    <FontAwesomeIcon icon={faPlus} /> Add New Address
                </button>
            </div>
        );
    }

    return (
        <div data-aos="fade-up" className={styles.profileInfo}>

            {addresses.length === 0 && !showForm ? (
                <div className={styles.noAddresses}>
                    <p>You haven&apos;t added any addresses yet.</p>
                    <button className={styles.addAddressButton} onClick={handleAddAddress}>
                        <FontAwesomeIcon icon={faPlus} /> Add New Address
                    </button>
                </div>
            ) : (
                <>
                    {!showForm && (
                        <>
                            <div className={styles.addressList}>
                                {addresses.map(address => (
                                    <div key={address.id} className={styles.addressCard} data-aos="fade-up">


                                        <div className={styles.addressContent}>
                                            <Image src={mapImg} width={90} height={90} alt="map" />

                                            <div className={styles.addressHeader}>
                                                <p className={styles.addressName}>{address.country} <span> ({address.city}) </span></p>
                                                <p className={styles.addressLine}>{address.floor} {address.street},  {address.city}</p>
                                                {address.landmark && (
                                                    <p className={styles.addressLine}>
                                                        {address.landmark}
                                                    </p>
                                                )}

                                            </div>
                                        </div>

                                        <div className={styles.addressActions}>
                                            <div
                                                className={`${styles.addressAction} ${styles.editAction}`}
                                                onClick={() => handleEditAddress(address)}
                                            >
                                                Edit
                                            </div>
                                            <div
                                                className={`${styles.addressAction} ${styles.deleteAction}`}
                                                onClick={() => handleDeleteAddress(address.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className={styles.addAddressButton} onClick={handleAddAddress} data-aos="fade-up">
                                <FontAwesomeIcon icon={faPlus} /> Add New Address
                            </button>
                        </>
                    )}

                    {showForm && (
                        <form className={styles.addressForm} onSubmit={handleFormSubmit} data-aos="fade-up">
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value="Ireland"
                                    className={styles.formInput}
                                    disabled
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>City</label>
                                <select
                                    name="city_select"
                                    value={formData.city_id || ''}
                                    onChange={handleCitySelectChange}
                                    className={styles.formInput}
                                    required
                                >
                                    <option className={styles.option} value="" disabled>Select a city</option>
                                    {cities.map(city => (
                                        <option className={styles.option} key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
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
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Floor</label>
                                <input
                                    type="text"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Landmark (Optional)</label>
                                <input
                                    type="text"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" className={styles.submitButton}>
                                    {editingAddress ? 'Update Address' : 'Add Address'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};

export default MyAddress; 