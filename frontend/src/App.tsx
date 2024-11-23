import { useState } from "react";
import { ChatInput, ChatMessages } from "./components/ui/chat";
import { type Message } from "./components/ui/chat";
import { Textarea } from "./components/ui/textarea";
 
export const App = () =>{

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=>{

  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{

  }

  const onFileLoadError = (errMsg: string) => {

  };

  const onFileLoad = async (file: File) => {
  }
  return (
  
    <>
    
      <div className=" bg-white h-screen flex flex-col justify-between">
        <ChatMessages  messages={messages} isLoading={loading} />
        <ChatInput input="" isLoading={loading} handleInputChange={handleInputChange} handleSubmit={handleSubmit} onFileError={onFileLoadError} onFileUpload={onFileLoad} />
      </div>
      
    </>
  );
} 