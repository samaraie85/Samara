'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

// Define the auth context type
type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ error: Error | null, data: unknown }>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null, data: null }),
    signOut: async () => { },
    isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session and set up auth listener
        const getInitialSession = async () => {
            try {
                setLoading(true);

                // Get current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setLoading(false);
                    return;
                }

                if (session) {
                    setSession(session);
                    setUser(session.user);
                } else {
                    setSession(null);
                    setUser(null);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error getting initial session:', error);
                setLoading(false);
            }
        };

        getInitialSession();

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`Auth event: ${event}`, session?.user?.email);
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
        });

        // Clean up subscription on unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (error) {
            console.error('Error signing in:', error);
            return { error: error as Error };
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData,
                },
            });
            return { error, data };
        } catch (error) {
            console.error('Error signing up:', error);
            return { error: error as Error, data: null };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 