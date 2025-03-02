import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure Google Generative AI
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const genai = new GoogleGenerativeAI(GOOGLE_API_KEY);
// Create the model with the same configuration as the FastAPI backend
const generation_config = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const model = genai.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generation_config,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the received data
    console.info("Received chat request:", data);
    console.info("History length:", data.history.length);

    // Convert history to Gemini format
    const chat_history = data.history.map((msg: any) => ({
      role: msg.role,
      parts: [msg.content]
    }));

    // Create chat session with history
    const chat = model.startChat({
      history: chat_history
    });

    // Send the new message
    const response = await chat.sendMessage(data.message);
    
    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: "OK" });
}