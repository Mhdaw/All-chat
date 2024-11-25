'use client';

import type { Attachment, JSONValue } from 'ai';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, FormEvent } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import { ChatHeader } from '@/components/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

import { Block, type UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';
import { Message } from '@/lib/types';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);
  const [messages, setMessages] =useState<Message[]>([])
  const [ input, setInput] = useState<string>("")
  const [isLoading, setLoading] = useState<boolean>(false)
  const handleSubmit = ()=> {
    
  }

  const append = async(message: Message):Promise<string | null | undefined> => {
   return null
}
  const stop = ()=> {

  }

  const [ data,setData] = useState();

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: 'init',
    content: '',
    title: '',
    status: 'idle',
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  // /api/vote?chatId=${id}
  const { data: votes } = useSWR<Array<Vote>>(
    `http://127.0.0.1:8080/send_message`,
    fetcher,
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [streamingData, setStreamingData] = useState<JSONValue[] | undefined>()
  useEffect(() => {
    if (streamingData && typeof streamingData === 'object' && 'content' in streamingData) {
      setStreamedMessage(streamingData as unknown as Message);
    }
  }, [streamingData]);

  const displayMessages = [...messages, ...(streamedMessage ? [streamedMessage] : [])];

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} />
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {displayMessages.length === 0 && <Overview />}

          {displayMessages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && message.id === displayMessages[displayMessages.length - 1]?.id}
              vote={votes?.find((vote) => vote.messageId === message.id)}
            />
          ))}

          {isLoading && displayMessages.length > 0 && displayMessages[displayMessages.length - 1].role === 'user' && (
            <ThinkingMessage />
          )}

          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>

        <form 
          className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSubmit();
          }}
        >
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      </div>

      <AnimatePresence>
        {block?.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  );
}

