'use client';


import { useState, useLayoutEffect, createContext, useEffect } from 'react';
import useSWR from 'swr';
import { ChatHeader } from '@/components/chat-header';
import { PreviewMessage, ThinkingMessage, PreviewImage } from '@/components/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import type { Vote } from '@/lib/db/schema';
import { cn, fetcher, generateUUID, uploadFile } from '@/lib/utils';
import { Message, ImageMessage } from '@/lib/types';
import { MultimodalInput } from './multimodal-input';
import { Overview, ImageOverview } from './overview';
import { useParams } from 'next/navigation';
import { MAIN_URL } from '@/lib/utils';
import { toast } from 'sonner';
import { Attachment } from '@/lib/types';
import { models } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { BetterTooltip } from './ui/tooltip';


export const modelContext = createContext<any>(null)

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const { id: chatId } = useParams()
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setLoading] = useState<boolean>(false)
  const [model, setModel] = useState(models[0])
  const [botType, setBotType] = useState<"CHAT" | "IMAGE">("CHAT")
  const [imagePath, setImageMessage] = useState<ImageMessage[]>([])
  const [imageModel, setImageModel] = useState<"RAG" | "LLAMAVISION"|"PIXTRAL">("LLAMAVISION")
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [isOnRecord, setOnRecord] = useState(false)
  const [isMounted, setIsMounted] = useState(false);
  

  const handleSubmit = () => {
    setLoading(true)

    if (botType == "IMAGE") {
      switch (imageModel) {
        case "LLAMAVISION":
          return submitAttachMentForRag()
          break;
        case "RAG":
          return submitToRag()
          break
        default:
          return submitToPixttral()
          break;
      }
    }

    const newMessage: Message = {
      id: generateUUID(),
      content: input,
      role: "user",
    }
    setMessages((prev) => [...prev, newMessage])
    setInput("")

    fetch(`${MAIN_URL}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: input,
        conversation_id: chatId,
        model: model.apiidentifier,
      })
    })
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        const newMessage: Message = {
          content: data.text,
          audio_url: data.audio_file,
          role: "assistant"
        }
        setMessages((prev) => [...prev, newMessage])
        setLoading(false)

      })
      .catch((e) => {
        toast.error("failed to get ai data");
        setLoading(false)
      })

  }

  const submitAttachMentForRag = async () => {

    if (attachments.length < 1) {
      toast.error("no attachments")
      return
    }
    const userMessage: ImageMessage = {
      role: "user",
      path: attachments[0].url,
      message: input
    }
    setImageMessage((prev) => [...prev, userMessage])

    fetch(`${MAIN_URL}/llamavision/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: attachments[0].url,
        // conversation_id: chatId,
        prompt: input,
      })
    }).then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.response == "Model or processor loading failed.") {
          toast.error(data.response)


          return;
        }
        const aiMessage: ImageMessage = {
          role: "ai",
          message: "data.response"
        }
        setImageMessage((prev) => [...prev, aiMessage])


      }).catch((error) => {
        console.log(error);
        toast.error(error)


      }).finally(() => {
        setInput("")
        setLoading(false)
      })

  }
  ///pixtral/generate
  const submitToPixttral = async () => {

    if (attachments.length < 1) {
      toast.error("no attachments")
      return
    }
    const userMessage: ImageMessage = {
      role: "user",
      path: attachments[0].url,
      message: input
    }
    setImageMessage((prev) => [...prev, userMessage])

    fetch(`${MAIN_URL}/pixtral/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: attachments[0].url,
        prompt: input,
      })
    }).then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.error) {
          toast.error(data.error)
          return;
        }
        const aiMessage: ImageMessage = {
          role: "ai",
          message: data.response
        }
        setImageMessage((prev) => [...prev, aiMessage])


      }).catch((error) => {
        console.log(error);
        toast.error(error)


      }).finally(() => {
        setInput("")
        setLoading(false)
      })

  }

    ///pixtral/generate
    const submitToRag = async () => {
      const userMessage: ImageMessage = {
        role: "user",
        message: input
      }
      setImageMessage((prev) => [...prev, userMessage])
  
      fetch(`${MAIN_URL}/rag/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repo: input,
          question: "Analyse this repo",
        })
      }).then((res) => res.json())
        .then((data) => {
          console.log(data)
          if (data.error) {
            toast.error(data.error)
            return;
          }
          const aiMessage: ImageMessage = {
            role: "ai",
            message: data.response
          }
          setImageMessage((prev) => [...prev, aiMessage])
  
  
        }).catch((error) => {
          console.log(error);
          toast.error(error)
  
  
        }).finally(() => {
          setInput("")
          setLoading(false)
        })
  
    }


  const append = async (message: Message): Promise<string | null | undefined> => {
    return null
  }
  const stop = () => {
    setLoading(false)
  }
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [imgContainerRef, imgEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const { data: votes } = useSWR<Array<Vote>>(
    ``,
    fetcher,
  );
  // to solve hydration problem


  useEffect(() => {
    setIsMounted(true);
    fetch(`${MAIN_URL}/get_history/${chatId}`)
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        setMessages((prev) => [...prev, ...data.history])
      }).catch((e) => {
        console.log("error", e);

      })
  }, []);






  const displayMessages = [...messages, ...(streamedMessage ? [streamedMessage] : [])];
  return (
    <>

      <modelContext.Provider value={{ model, setModel, botType, setBotType, isLoading, setLoading, isOnRecord, setOnRecord }} >
        <div className="flex flex-col min-w-0 h-dvh bg-background">
          <ChatHeader selectedModelId={selectedModelId} />
          {
            isOnRecord ? <RecordLoading /> : ""
          }
          {
            botType == "CHAT" ? (
              <div ref={messagesContainerRef} className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" >
                {displayMessages.length === 0 && <Overview />}

                {displayMessages.map((message, i) => (
                  <PreviewMessage
                    key={i}
                    chatId={id}
                    message={message}
                    isLoading={isLoading && message.id === displayMessages[displayMessages.length - 1]?.id}
                    vote={votes?.find((vote) => vote.messageId === message.id)}
                  />
                ))}

                {isLoading && displayMessages.length > 0 && displayMessages[displayMessages.length - 1].role === 'user' && (
                  <ThinkingMessage />
                )}

                <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
              </div>
            ) : (
              <div ref={imgContainerRef} className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" >
                {imagePath.length === 0 && <ImageOverview />}

                {imagePath.map((message, i) => (
                  <PreviewImage
                    key={i}
                    chatId={id}
                    image={message}
                    isLoading={isLoading && message.path === imagePath[imagePath.length - 1]?.path}
                  />
                ))}

                <div className='z-50 fixed flex gap-4 right-6 p-2 rounded-xl inline-block top-[50%] -translate-y-[50%] min-h-20 flex-col w-[60px]'>
                    <BetterTooltip content={"Pixtral Ai"} align='start' >
                      <Button onClick={()=>{setImageModel("PIXTRAL")}} className={cn(' bg-slate-200 py-3 px-2 rounded-xl ', imageModel=="PIXTRAL"?"border border-indigo-600 bg-indigo-50":"")}>
                      <img src={"https://mistral.ai/images/logo_hubc88c4ece131b91c7cb753f40e9e1cc5_2589_256x0_resize_q97_h2_lanczos_3.webp"} alt='' width={100} height={100} className=' object-cover ' />
                      </Button>
                    
                    </BetterTooltip>
                    <BetterTooltip content={"llamavision Ai"} align='start' >
                      <Button onClick={()=>{setImageModel("LLAMAVISION")}} className={cn(' bg-slate-200 py-3 px-2 rounded-xl ', imageModel=="LLAMAVISION"?"border border-indigo-600 bg-indigo-50":"")}>
                      <img src={"https://z-p3-static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg"} alt='' width={100} height={100} className=' object-cover ' />
                      </Button>
                    
                    </BetterTooltip>
                    <BetterTooltip content={"Rag Ai"} align='start' >
                      <Button onClick={()=>{setImageModel("RAG")}} className={cn(' bg-slate-200 py-3 px-2 rounded-xl ', imageModel=="RAG"?"border border-indigo-600 bg-indigo-50":"")}>
                        <p className=' text-zinc-700 font-bold text-xl'>RAG</p>
                      </Button>
                    
                    </BetterTooltip>
                </div>

                {isLoading && imagePath.length > 0 && imagePath[imagePath.length - 1].role === 'user' && (
                  <ThinkingMessage />
                )}

                <div ref={imgEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
              </div>
            )
          }

          <form
            className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              handleSubmit();
            }}
          >
            {
              imageModel === "RAG"? <p className=''>Submit Github repository to analyze (eg https://github.com/username/repo.git)</p>:""
            }
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
      </modelContext.Provider>
    </>
  );
}


const RecordLoading = () => (
  <div className="absolute top-20 right-0 left-0 bottom-30 bg-transparent z-30 grid place-items-center">
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
      <path d="M 19.5 3 C 17.585045 3 16 4.5850452 16 6.5 L 16 23.253906 A 1.50015 1.50015 0 0 0 16 23.740234 L 16 32.5 C 16 34.414955 17.585045 36 19.5 36 L 30.5 36 C 32.414955 36 34 34.414955 34 32.5 L 34 23.746094 A 1.50015 1.50015 0 0 0 34 23.259766 L 34 6.5 C 34 4.5850452 32.414955 3 30.5 3 L 19.5 3 z M 19.5 6 L 30.5 6 C 30.795045 6 31 6.2049548 31 6.5 L 31 22 L 19 22 L 19 6.5 C 19 6.2049548 19.204955 6 19.5 6 z M 11.476562 21.978516 A 1.50015 1.50015 0 0 0 10 23.5 L 10 32.5 C 10 37.728774 14.271226 42 19.5 42 L 23.5 42 L 23.5 46 A 1.50015 1.50015 0 1 0 26.5 46 L 26.5 42 L 30.5 42 C 35.728774 42 40 37.728774 40 32.5 L 40 23.5 A 1.50015 1.50015 0 1 0 37 23.5 L 37 32.5 C 37 36.107226 34.107226 39 30.5 39 L 19.5 39 C 15.892774 39 13 36.107226 13 32.5 L 13 23.5 A 1.50015 1.50015 0 0 0 11.476562 21.978516 z M 19 25 L 31 25 L 31 32.5 C 31 32.795045 30.795045 33 30.5 33 L 19.5 33 C 19.204955 33 19 32.795045 19 32.5 L 19 25 z M 25 27 A 2 2 0 0 0 25 31 A 2 2 0 0 0 25 27 z"></path>
    </svg>
  </div>
)