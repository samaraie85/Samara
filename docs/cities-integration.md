# Cities Integration with User Addresses

This document explains how cities are integrated as a foreign key with user addresses in the application.

## Database Schema Changes

The application now uses a `cities` table to store city information, and the `user_address` table references cities via a foreign key. This provides several benefits:

1. Consistent city naming across all addresses
2. Ability to add additional city properties (like country, region, coordinates)
3. Reduced data duplication
4. Easier filtering and reporting by city

### Cities Table

The `cities` table has the following structure:

```sql
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Address Table Changes

The `user_address` table has been modified to use a `city_id` foreign key instead of storing the city name directly:

```sql
ALTER TABLE public.user_address 
ADD COLUMN IF NOT EXISTS city_id UUID;

ALTER TABLE public.user_address
ADD CONSTRAINT fk_user_address_city
FOREIGN KEY (city_id)
REFERENCES public.cities(id)
ON DELETE SET NULL;
```

## API Changes

The address API endpoints have been updated to:

1. Accept both `city_id` and `city` in the input
2. Auto-create cities when a new city name is provided
3. Return city information (both ID and name) with address data

## UI Changes

The UI now includes:

1. A dropdown for selecting existing cities
2. An option to add a new city if it doesn't exist
3. Form validation for city selection

## Migration

A migration script has been created to:

1. Create the cities table
2. Migrate existing city names to city records
3. Update address records with the appropriate city_id references

To apply the migration, run:

```bash
psql -U your_username -d your_database -f scripts/create-cities-table.sql
```

## Additional Features

With this new structure, future features could include:

1. City maps and geolocation
2. City-specific shipping rules
3. Address validation and standardization
4. City-based reporting and analytics 