import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export async function POST(request: Request) {
    try {
        const { userId, file, fileExt, previousUrl } = await request.json();

        if (!userId || !file || !fileExt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If there's a previous avatar URL, delete it
        if (previousUrl) {
            try {
                const pathMatch = previousUrl.match(/\/storage\/v1\/object\/public\/samara\.storage\/(.+)/);

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

        // Add timestamp to ensure uniqueness
        const timestamp = new Date().getTime();
        const fileName = `${userId}_${timestamp}.${fileExt}`;
        const filePath = `users_images/${fileName}`;

        // File comes as base64 data URL
        const base64Str = file.split('base64,')[1];
        const fileBuffer = decode(base64Str);

        // Upload the image to Supabase storage
        const { error: uploadError } = await supabase.storage
            .from('samara.storage')
            .upload(filePath, fileBuffer, {
                contentType: `image/${fileExt}`,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
            return NextResponse.json({
                error: 'Failed to upload image',
                details: uploadError
            }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = await supabase.storage
            .from('samara.storage')
            .getPublicUrl(filePath);

        if (!urlData) {
            return NextResponse.json({ error: 'Could not get public URL' }, { status: 500 });
        }

        // Return the URL to the client
        return NextResponse.json({
            success: true,
            url: urlData.publicUrl
        });

    } catch (error: unknown) {
        console.error('Error handling upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error processing upload',
            details: errorMessage
        }, { status: 500 });
    }
} 