'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocalStorage, useReadLocalStorage, useWindowSize } from 'usehooks-ts';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { useCallback, useContext } from 'react';
import { cn, MAIN_URL } from '@/lib/utils';
import { ModelSelector } from './model-selector';
import { modelContext } from './chat';





export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const localStorage = useReadLocalStorage("chats") as []
  const [newStorage, setLocalStorage] = useLocalStorage<any>("chats", localStorage)
  const { botType, setBotType } = useContext(modelContext)
  const newChat = useCallback(() => {
    fetch(`${MAIN_URL}/create_chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setLocalStorage([...newStorage, data])
        router.push(`/${data.chat_id}`);
      })
  }, [])

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              newChat()
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Button>
        </BetterTooltip>
      )}
      <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      />
      <div className=' absolute right-[50%] py-4 translate-x-[50%]'>
        <Button
          onClick={() => setBotType("CHAT")}
          className={cn(' hover:bg-slate-100  rounded-none bg-indigo-200 text-white border-r rounded-l-md', botType == "CHAT" && "bg-indigo-400 text-white hover:bg-indigo-400")}
        >
          Chats
        </Button>
        <Button
          onClick={() => setBotType("IMAGE")}
          className={cn('hover:bg-slate-100  rounded-none bg-indigo-200 text-white border-l rounded-r-md', botType == "IMAGE" && "bg-indigo-400 text-white hover:bg-indigo-400")}
        >
          Image
        </Button>
      </div>

      <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        asChild
      >
        <Link
          href=""
          target="_noblank"
        >
          About us
        </Link>
      </Button>
    </header>
  );
}
