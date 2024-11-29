'use client';

import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { BetterTooltip } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { useCallback} from 'react';
import { MAIN_URL } from '@/lib/utils';
import { ModelSelector } from './model-selector';

export function AppSidebar() {
  const router = useRouter();
  const localStorage = useReadLocalStorage("chats") as [];
  const { setOpenMobile } = useSidebar();
  const [local, setLocal] = useLocalStorage("chats", [...localStorage]);

  
  


  const newChat = useCallback(()=>{
    fetch(`${MAIN_URL}/create_chat`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
    })
    .then((res)=> res.json())
      .then((data)=> {
        setLocal((prev)=> [...prev, data] as any)
        router.push(`/${data.chat_id}`);
      })
}, [])
  
  

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <BetterTooltip content="New Chat" align="start">
              <Button
                variant="ghost"
                type="button"
                className="p-2 h-fit"
                onClick={() => {
                  setOpenMobile(false);
                  newChat()
                }}
              >
                <PlusIcon />
              </Button>
            </BetterTooltip>
            
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="-mx-2">
          <SidebarHistory  />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-0 -mx-2">
        {/* {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarUserNav user={user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}
      </SidebarFooter>
    </Sidebar>
  );
}
