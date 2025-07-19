import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Hero from './components/Hero';
import Products from './components/Products';

// Define types for the page props
interface CategoryPageProps {
    params: Promise<{
        categoryId?: string;
    }>;
}

async function getCategoryData(categoryId?: string) {
    // If no categoryId is provided, return null (show all products)
    if (!categoryId) {
        return null;
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return category;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { categoryId = '' } = await params;
    const category = await getCategoryData(categoryId);

    return (
        <>
            <Hero category={category} />
            <Products categoryId={categoryId} />
        </>
    );
} 