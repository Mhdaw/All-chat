import { Mic, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function VoiceRecorder() {
  const [isRecording, setRecording] = useState(false);
  const [media, setMedia] = useState<MediaRecorder>();
  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      console.log("The mediaDevices.getUserMedia() method is supported.");

      const constraints = { audio: true };

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    }
  }, []);

  const onSuccess = (stream: MediaStream) => {
    console.log("succcessfull");

    let chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);

    setMedia(mediaRecorder)


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

      const blob = new Blob(chunks, { type: "audio/ogg" });

      const audioURL = window.URL.createObjectURL(blob);
      const audio = new Audio(audioURL)
      audio.play()
      const file = new File([blob], "voice", { type: "webm" });
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
