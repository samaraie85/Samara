'use client';

import React from 'react';
import { AuthProvider } from '@/lib/authContext';
import { WishlistProvider } from '@/lib/wishlistContext';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider>
            <AuthProvider>
                <WishlistProvider>
                    {children}
                </WishlistProvider>
            </AuthProvider>
        </MantineProvider>
    );
} 