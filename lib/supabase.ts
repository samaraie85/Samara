import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true // Enable session persistence
    }
  }
);

// Wishlist operations
export const wishlistOperations = {
  // Get wishlist items for current user
  getWishlist: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    // Get wishlist items via API route
    const response = await fetch(`/api/wishlist?userId=${session.user.id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch wishlist');
    }

    const data = await response.json();
    return { data: data.wishlist };
  },

  // Add item to wishlist
  addToWishlist: async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    // Add to wishlist via API route
    const response = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: session.user.id,
        productId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add to wishlist');
    }

    return await response.json();
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    // Remove from wishlist via API route
    const response = await fetch('/api/wishlist/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: session.user.id,
        productId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove from wishlist');
    }

    return await response.json();
  }
};

// Debug helper to check auth status
export const checkAuthStatus = async () => {
  try {
    // Check current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session check error:', sessionError);
      return { authenticated: false, error: sessionError };
    }

    const session = sessionData.session;

    if (!session) {
      console.log('No active session found');
      return { authenticated: false, message: 'No active session' };
    }

    // Check token expiration
    const expiresAt = new Date((session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000);
    const now = new Date();

    console.log('Session info:', {
      user: session.user.id,
      expires: expiresAt.toISOString(),
      expired: expiresAt < now,
      timeLeft: (expiresAt.getTime() - now.getTime()) / 1000 / 60 + ' minutes',
    });

    // Attempt to refresh if nearing expiration (10 min buffer)
    if (expiresAt.getTime() - now.getTime() < 10 * 60 * 1000) {
      console.log('Session nearing expiration, attempting refresh');
      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Session refresh error:', refreshError);
      } else {
        console.log('Session refreshed successfully');
      }
    }

    return {
      authenticated: true,
      user: session.user,
      expires: expiresAt
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { authenticated: false, error };
  }
}; 