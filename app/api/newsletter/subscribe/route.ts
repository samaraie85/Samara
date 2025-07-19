import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { email, firstName, audienceId } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const { data, error } = await resend.contacts.create({
            email: email,
            firstName: firstName || null,
            lastName: '',
            unsubscribed: false,
            audienceId: audienceId || process.env.RESEND_AUDIENCE_ID,
        });

        if (error) {
            console.error('Resend contact creation error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 