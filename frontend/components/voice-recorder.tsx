import { Mic, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import useConverter from "@/hooks/use-converter";
import { MAIN_URL } from "@/lib/utils";


export function VoiceRecorder() {
  const [isRecording, setRecording] = useState(false);
  const [media, setMedia] = useState<MediaRecorder>();

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

    mediaRecorder.onstop =async () => {
      console.log("stopingmedia");

      setRecording(false)

      const blob = new Blob(chunks, { type: "audio/webm" });
      console.log("blob", blob)
      const file = new File([blob], "voice", { type: "audio/webm" });
      const formData = new FormData();
      formData.append('audio', file, 'audio.webm');
      formData.append("conversation_id", )

      const headers = {
        'Accept': 'application/json',  // Expected response type
      };

      const data =await fetch(MAIN_URL+"/upload_audio", {
        method: 'POST',
        headers: headers, // Include headers if necessary
        body: formData,
      });
      console.log(await data.json())
      

      const audioURL = window.URL.createObjectURL(blob);
      
      const audio = new Audio(audioURL)
      audio.play()
      
      console.log(file);
      console.log(audio);
      const link = document.createElement('a');
      link.href = audioURL;
      console.log(audioURL);

      link.download = "voice.weba"; // Set the filename for the downloaded file
      link.click();
      chunks = [];



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
