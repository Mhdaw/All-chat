import { Mic, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { MAIN_URL } from "@/lib/utils";
import { useParams } from "next/navigation";


export function VoiceRecorder({setMessages, stop}:any) {
  const [isRecording, setRecording] = useState(false);
  const [media, setMedia] = useState<MediaRecorder>();
  const {id} = useParams()

  const onSuccess = (stream: MediaStream) => {
    console.log("succcessfull");

    let chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);

    setMedia(mediaRecorder)
    mediaRecorder.start()

    mediaRecorder.onstart = () => {
      setRecording(true)
      console.log("starting record");

    }
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
      console.log("data available");

    };

    mediaRecorder.onstop = () => {
      console.log("stopingmedia");

      setRecording(false)

      const blob = new Blob(chunks, { type: "audio/webm" });
      console.log("blob", blob)
      const file = new File([blob], "voice", { type: "audio/webm" });
      const formData = new FormData();
      formData.append('audio', file, 'audio.webm');
      formData.append("conversation_id", `${id}`)

      const headers = {
        'Accept': 'application/json',  // Expected response type
      };
      fetch(MAIN_URL+"/upload_audio", {
        method: 'POST',
        headers: headers, // Include headers if necessary
        body: formData,
      }).then((data)=>data.json())
      .then((res)=>{
        setMessages([
          {
            role:"user",
            content:res.transcribed_text,
            audio_file:res.user_audio_url
          },{
            role:"assistant",
            content:res.response,
            audio_file:res.audio_url
          }
        ])
      })
    }

  }
  const onError = (e: string) => {
    console.log(`error: ${e}`);
    setRecording(false)
  }

  const startRecording = () => {
    console.log(media);
    if (!media &&  navigator.mediaDevices.getUserMedia) {
      console.log("The mediaDevices.getUserMedia method is supported.");

      const constraints = { audio: true };
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    }
    setRecording(true)
    media?.start()

  }


  const stopRecording = () => {
    media?.stop()
    setRecording(false)

  }

  return !isRecording ? (
    <Button
      className="rounded-full p-1.5 h-fit absolute bottom-2 right-11 m-0.5 dark:border-zinc-700"
      onClick={() => startRecording()}
      variant="outline"
    //   disabled={isRecording}
    >
      <Mic />
    </Button>
  ) : (
    <Button
      className="rounded-full p-1.5 h-fit absolute bottom-2 right-11 m-0.5 dark:border-zinc-700"
      onClick={stopRecording}
      variant="outline"
    //   disabled={isRecording}
    >
      <Pause />
    </Button>
  );
}
