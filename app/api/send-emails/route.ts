import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { subject, content, recipients } = await request.json();

        if (!subject || !content || !recipients || !Array.isArray(recipients)) {
            return NextResponse.json(
                { error: 'Missing required fields: subject, content, or recipients' },
                { status: 400 }
            );
        }

        const emailPromises = recipients.map(async (recipient) => {
            try {
                // Send email using Resend
                const { data, error } = await resend.emails.send({
                    from: 'Samara <noreply@samarahub.ie>',
                    to: recipient.email,
                    subject: subject,
                    html: content,
                });

                if (error) {
                    console.error(`Failed to send email to ${recipient.email}:`, error);
                    return { success: false, email: recipient.email, error: error.message };
                }

                console.log(`Email sent successfully to ${recipient.email}:`, data);
                return { success: true, email: recipient.email, data };
            } catch (error) {
                console.error(`Exception sending email to ${recipient.email}:`, error);
                return {
                    success: false,
                    email: recipient.email,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        const results = await Promise.all(emailPromises);
        const successfulSends = results.filter(result => result.success).length;
        const failedSends = results.filter(result => !result.success).length;

        console.log(`Email campaign completed: ${successfulSends} successful, ${failedSends} failed`);

        return NextResponse.json({
            success: failedSends === 0,
            message: `Sent ${successfulSends} emails successfully${failedSends > 0 ? `, ${failedSends} failed` : ''}`,
            results: {
                total: recipients.length,
                successful: successfulSends,
                failed: failedSends,
                details: results
            }
        });

    } catch (error) {
        console.error('Error in send-emails API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}