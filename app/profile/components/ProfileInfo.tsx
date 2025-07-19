'use client'
import React, { useState } from 'react';
import styles from './ProfileInfo.module.css';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

interface ProfileInfoProps {
    user: User;
    userData: {
        full_name: string;
        email: string;
        phone: string;
        birthdate: string;
    };
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, userData }) => {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        try {
            setLoading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const timestamp = new Date().getTime();
            const fileName = `${user.id}_${timestamp}.${fileExt}`;
            const filePath = `users_images/${fileName}`;

            // Check if user already has an avatar and delete it
            if (user?.user_metadata?.avatar_url) {
                try {
                    // Extract the path from the URL
                    const url = user.user_metadata.avatar_url;
                    const pathMatch = url.match(/\/storage\/v1\/object\/public\/samara\.storage\/(.+)/);

                    if (pathMatch && pathMatch[1]) {
                        const oldPath = decodeURIComponent(pathMatch[1]);
                        console.log('Deleting old image:', oldPath);

                        // Delete the old image
                        const { error: deleteError } = await supabase.storage
                            .from('samara.storage')
                            .remove([oldPath]);

                        if (deleteError) {
                            console.warn('Failed to delete old image:', deleteError);
                        } else {
                            console.log('Old image deleted successfully');
                        }
                    }
                } catch (deleteErr) {
                    console.warn('Error during old image deletion:', deleteErr);
                    // Continue with upload even if deletion fails
                }
            }

            console.log('Uploading to bucket:', 'samara.storage', 'with path:', filePath);

            // Upload the image to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('samara.storage')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
                throw uploadError;
            }

            console.log('Upload successful:', uploadData);

            // Get public URL
            const { data: urlData } = await supabase.storage
                .from('samara.storage')
                .getPublicUrl(filePath);

            if (!urlData) throw new Error('Could not get public URL');

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: urlData.publicUrl }
            });

            if (updateError) throw updateError;

            // Also update the avatar in the app_users table
            console.log('Updating app_users table with image URL:', urlData.publicUrl);

            // Try first with 'image' column
            const { data: dbData, error: dbUpdateError } = await supabase
                .from('app_users')
                .update({ image: urlData.publicUrl })
                .eq('id', user.id);

            if (dbUpdateError) {
                console.error('Error updating app_users with image field:', JSON.stringify(dbUpdateError));
            } else {
                console.log('Updated app_users table with image field:', dbData);
            }

            // Force refresh
            window.location.reload();

        } catch (error) {
            console.error('Error uploading avatar:', error instanceof Error ? error.message : JSON.stringify(error));
            alert(`Error uploading avatar: ${error instanceof Error ? error.message : 'Storage upload failed'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div data-aos="fade-left" className={styles.profileInfo}>
            <div data-aos="fade-left" className={styles.profileCard}>
                <div data-aos="fade-left" className={styles.profileImageSection}>
                    <div data-aos="fade-left" className={styles.profileImageContainer}>
                        {user?.user_metadata?.avatar_url ? (
                            <Image
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                width={125}
                                height={125}
                                className={styles.profileImage}
                            />
                        ) : (
                            <div className={styles.defaultAvatar}>
                                {(userData?.full_name || user?.email || '').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label className={styles.changeButton} htmlFor="avatar-upload">
                            {loading ? 'Uploading...' : 'change'}
                        </label>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.profileDetails}>
                    <h3 className={styles.userName}>
                        {userData?.full_name || user?.user_metadata?.full_name || 'User Name'}
                    </h3>

                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                        <p>{userData?.email || user?.email}</p>
                    </div>

                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                        <p>{userData?.phone || user?.user_metadata?.phone || 'Not provided'}</p>
                    </div>

                    <div className={styles.infoItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.infoIcon} />
                        <p>{userData?.birthdate || user?.user_metadata?.birthdate || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo; 