"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useLocalStorage } from "usehooks-ts"

export function NavigateToChat({chat}:any){
    const router = useRouter()
    const [localStorage, setLocalStorage] = useLocalStorage<any>("chats", [])
    const value = useCallback(()=>{
        setLocalStorage([chat])
        router.push(`/${chat.chat_id}`);
        return true
    }, [router, chat, localStorage])

    useEffect(()=>{
        value()
        return ;
    },[])

    return <>
        Moving to chat......
    </>
}