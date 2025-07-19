import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';



// GET request to fetch user address data
export async function GET(request: Request) {
    try {
        // Get user ID from query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get address data from the database with city information joined
        const { data, error } = await supabase
            .from('user_address')
            .select(`
                id,
                user,
                country,
                city,
                cities (
                    id,
                    name,
                    is_active
                ),
                street,
                floor,
                landmark
            `)
            .eq('user', userId)
            .order('id', { ascending: true });

        if (error) {
            return NextResponse.json({
                error: 'Failed to fetch address data',
                details: error.message
            }, { status: 500 });
        }

        // Transform the data to provide city name instead of just ID
        const addresses = (data || []).map(address => {
            // Safely extract city information
            let cityName = 'Unknown city';
            const cityData = address.cities;

            if (cityData && typeof cityData === 'object') {
                // Handle when it's a single object
                if ('name' in cityData) {
                    cityName = cityData.name as string;
                }
                // Handle when it might be an array with first item
                else if (Array.isArray(cityData) && cityData.length > 0 && cityData[0]?.name) {
                    cityName = cityData[0].name as string;
                }
            }

            return {
                id: address.id,
                user: address.user,
                country: address.country,
                city_id: address.city,
                city: cityName,
                street: address.street,
                floor: address.floor,
                landmark: address.landmark
            };
        });

        // Return the address data (or empty array if not found)
        return NextResponse.json({
            addresses
        });

    } catch (error: unknown) {
        console.error('Error in address API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
}

// POST request to add or update a user address
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, addressData } = body;

        if (!userId || !addressData) {
            return NextResponse.json({ error: 'User ID and address data are required' }, { status: 400 });
        }

        // Check if the city exists in the cities table first
        let cityId = addressData.city_id;

        // If city_id is not provided but city name is, try to find it or create it
        if (!cityId && addressData.city) {
            // Check if the city already exists
            const { data: existingCities, error: cityFetchError } = await supabase
                .from('cities')
                .select('id')
                .eq('name', addressData.city)
                .limit(1);

            if (cityFetchError) {
                return NextResponse.json({
                    error: 'Failed to check city existence',
                    details: cityFetchError.message
                }, { status: 500 });
            }

            if (existingCities && existingCities.length > 0) {
                // City exists, use its ID
                cityId = existingCities[0].id;
            } else {
                // City doesn't exist, create it
                const { data: newCity, error: cityCreateError } = await supabase
                    .from('cities')
                    .insert([{ name: addressData.city }])
                    .select();

                if (cityCreateError) {
                    return NextResponse.json({
                        error: 'Failed to create city',
                        details: cityCreateError.message
                    }, { status: 500 });
                }

                cityId = newCity?.[0]?.id;
            }
        }

        // If address has an ID, update existing address
        if (addressData.id) {
            const { data, error } = await supabase
                .from('user_address')
                .update({
                    country: addressData.country,
                    city: cityId,
                    street: addressData.street,
                    floor: addressData.floor,
                    landmark: addressData.landmark
                })
                .eq('id', addressData.id)
                .eq('user', userId) // Safety check
                .select();

            if (error) {
                return NextResponse.json({
                    error: 'Failed to update address',
                    details: error.message
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                address: data[0],
                message: 'Address updated successfully'
            });
        }
        // Otherwise insert new address
        else {
            const { data, error } = await supabase
                .from('user_address')
                .insert([{
                    user: userId,
                    country: addressData.country,
                    city: cityId,
                    street: addressData.street,
                    floor: addressData.floor,
                    landmark: addressData.landmark
                }])
                .select();

            if (error) {
                return NextResponse.json({
                    error: 'Failed to create address',
                    details: error.message
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                address: data[0],
                message: 'Address created successfully'
            });
        }

    } catch (error: unknown) {
        console.error('Error in address API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
}

// DELETE request to remove a user address
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const addressId = url.searchParams.get('addressId');
        const userId = url.searchParams.get('userId');

        if (!addressId || !userId) {
            return NextResponse.json({
                error: 'Address ID and User ID are required'
            }, { status: 400 });
        }

        // Delete the address
        const { error } = await supabase
            .from('user_address')
            .delete()
            .eq('id', addressId)
            .eq('user', userId); // Safety check to ensure user owns the address

        if (error) {
            return NextResponse.json({
                error: 'Failed to delete address',
                details: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Error in address API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 