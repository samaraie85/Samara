import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('delivery')
            .select('price')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Error fetching delivery price:', error);
            return NextResponse.json(
                { message: 'Failed to fetch delivery price', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            price: data?.price || 0
        });
    } catch (error) {
        console.error('Error fetching delivery price:', error);
        return NextResponse.json(
            { message: 'Failed to fetch delivery price', error: (error as Error).message },
            { status: 500 }
        );
    }
} 