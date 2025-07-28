import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
    let messages;
    try {
        const body = await req.json();
        messages = body.messages;
        if (!messages) {
            return NextResponse.json({ error: 'No messages provided in request body.' }, { status: 400 });
        }
    } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return NextResponse.json({ error: 'Failed to parse request body', details: parseError instanceof Error ? parseError.message : parseError }, { status: 400 });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant for staff working in the food e-commerce sector in Ireland. You can answer questions in either Arabic or English, depending on the language the user uses. Focus only on topics related to food products, online food sales, food safety, Irish food e-commerce regulations, and working in the food e-commerce sector in Ireland. If a question is outside this domain, politely explain that you can only help with food e-commerce topics for staff in Ireland.'
                },
                ...messages,
            ],
        });
        const reply = completion.choices[0].message.content;
        return NextResponse.json({ reply });
    } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        return NextResponse.json({ error: 'OpenAI API error', details: openaiError instanceof Error ? openaiError.message : openaiError }, { status: 500 });
    }
}