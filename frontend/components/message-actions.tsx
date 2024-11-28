
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { Message } from '@/lib/types';
import type { Vote } from '@/lib/db/schema';
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MAIN_URL } from '@/lib/utils';

export function MessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const [audioState, setAudioState] = useState<"playing"|"paused"|"canplay"|"loading">("loading")

  if (isLoading) return null;
  if (message.role === 'user') return null;
  const [audio, setAudio] = useState(document.createElement("audio"));
  useEffect(()=>{
    audio.src = `${MAIN_URL}${message.audio_url|| `/audio/${message.audio_file}`}`
    setAudioState("paused")
    audio.onpause =()=>{
      setAudioState("paused")
    }
    
  },[])

  const play =()=>{
    console.log("playing");
    
    audio.play()
    setAudioState("playing")
  }

  const stop =()=>{
    console.log("stopping");
    
    audio?.pause()
    setAudioState("paused")
  }
   


  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(message.content as string);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={async () => {
                
                toast.info("holla")
                  }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upvote Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Downvote Response</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              onClick={()=>{
                if(audioState == "playing"){
                  stop();
                }else{
                  play()
                }

              }}
              disabled={false}
            >
              {audioState == "paused" ? <Play /> : <Pause />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Play Or Pause</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
