import { Mic, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction,  useState, useContext } from "react";
import { MAIN_URL } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Message } from "@/lib/types";
import { modelContext } from "./chat";


export function VoiceRecorder({setMessages}:{setMessages:Dispatch<SetStateAction<Array<Message>>>;}) {
  const [media, setMedia] = useState<MediaRecorder>();
  const {id} = useParams()
  const [isRecording, setRecording] = useState(false)
  const {model, setModel, botType, setBotType, isLoading, setLoading} = useContext(modelContext)
  

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

    
        setMessages((prev:any)=> [...prev, ...[
          {
            role:"user",
            content:res.transcribed_text,
            audio_file:res.user_audio_url
          },{
            role:"assistant",
            content:res.response,
            audio_file:res.audio_url
          }
        ]])
      })
    }

  }
  const onError = (e: string) => {
    console.log(`error: ${e}`);
    setRecording(false)

    // setLoading(false)
  }

  const startRecording = () => {
    console.log(setLoading);
    
    console.log(media);
    if (!media &&  navigator.mediaDevices.getUserMedia) {
      console.log("The mediaDevices.getUserMedia method is supported.");

      const constraints = { audio: true };
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    }
    media?.start()

  }


  const stopRecording = () => {
    media?.stop()
    setRecording(false)
    // setLoading(false)
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
      onClick={()=> stopRecording()}
      variant="outline"
    //   disabled={isRecording}
    >
      <Pause />
    </Button>
    
  );
}

const RecordLoading= () => {
  return (
    <div className="fixed top-20 right-0 left-0 bottom-30 bg-transparent z-30 grid place-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
  <path d="M 19.5 3 C 17.585045 3 16 4.5850452 16 6.5 L 16 23.253906 A 1.50015 1.50015 0 0 0 16 23.740234 L 16 32.5 C 16 34.414955 17.585045 36 19.5 36 L 30.5 36 C 32.414955 36 34 34.414955 34 32.5 L 34 23.746094 A 1.50015 1.50015 0 0 0 34 23.259766 L 34 6.5 C 34 4.5850452 32.414955 3 30.5 3 L 19.5 3 z M 19.5 6 L 30.5 6 C 30.795045 6 31 6.2049548 31 6.5 L 31 22 L 19 22 L 19 6.5 C 19 6.2049548 19.204955 6 19.5 6 z M 11.476562 21.978516 A 1.50015 1.50015 0 0 0 10 23.5 L 10 32.5 C 10 37.728774 14.271226 42 19.5 42 L 23.5 42 L 23.5 46 A 1.50015 1.50015 0 1 0 26.5 46 L 26.5 42 L 30.5 42 C 35.728774 42 40 37.728774 40 32.5 L 40 23.5 A 1.50015 1.50015 0 1 0 37 23.5 L 37 32.5 C 37 36.107226 34.107226 39 30.5 39 L 19.5 39 C 15.892774 39 13 36.107226 13 32.5 L 13 23.5 A 1.50015 1.50015 0 0 0 11.476562 21.978516 z M 19 25 L 31 25 L 31 32.5 C 31 32.795045 30.795045 33 30.5 33 L 19.5 33 C 19.204955 33 19 32.795045 19 32.5 L 19 25 z M 25 27 A 2 2 0 0 0 25 31 A 2 2 0 0 0 25 27 z"></path>
  </svg>
          </div>
  )
}
