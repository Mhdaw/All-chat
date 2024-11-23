import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const SYSTEM_PROMPT = `You are an advanced AI language model. Your responses should be:
1. Helpful and informative
2. Clear and well-structured
3. Written in a natural, conversational tone
4. Safe and ethical
5. Free from harmful or inappropriate content
6. Accurate and factual
7. Willing to admit uncertainty when appropriate

When responding:
- Break down complex topics into understandable parts
- Use examples when helpful
- Format responses with markdown for better readability
- Keep responses focused and relevant to the user's question
- Be friendly and engaging while maintaining professionalism

If you're asked to write code:
- Include clear comments
- Follow best practices
- Explain the code's functionality
- Provide usage examples when appropriate

Remember to:
- Be direct and helpful
- Stay on topic
- Respond in the same language as the user's question
- Maintain a helpful and positive tone`;

function formatChatHistory(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter(msg => msg.role !== 'system')
    .map((msg, index) => {
      if (index === 0 && msg.role === 'user') {
        return {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${msg.content}` }]
        };
      }
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });
}

export async function POST(request: Request) {
  try {
    const { id, messages, modelId } = await request.json();
    console.log('Received request:', { id, messageCount: messages.length });

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    console.log('Processing message:', lastMessage.content);

    const chat = await getChatById({ id });
    if (!chat) {
      const title = await generateTitleFromUserMessage({ message: lastMessage });
      await saveChat({ id, userId: session.user.id, title });
    }

    await saveMessages({
      messages: [
        { ...lastMessage, id: generateUUID(), createdAt: new Date(), chatId: id },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 2048,
            },
          });

          let responseStream;
          if (messages.length === 1) {
            const result = await model.generateContentStream([
              { text: `${SYSTEM_PROMPT}\n\nUser: ${lastMessage.content}` }
            ]);
            responseStream = result.stream;
          } else {
            const chatHistory = formatChatHistory(messages.slice(0, -1));
            const chat = model.startChat({
              history: chatHistory,
              generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
              },
            });
            const result = await chat.sendMessageStream(lastMessage.content);
            responseStream = result.stream;
          }

          const messageId = generateUUID();
          let fullResponse = '';

          for await (const chunk of responseStream) {
            const text = chunk.text();
            fullResponse += text;
            
            const data = {
              id: messageId,
              role: 'assistant',
              content: fullResponse
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }

          await saveMessages({
            messages: [{
              id: messageId,
              chatId: id,
              role: 'assistant',
              content: fullResponse,
              createdAt: new Date(),
            }],
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chat = await getChatById({ id });
    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteChatById({ id });
    return NextResponse.json({ message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}

