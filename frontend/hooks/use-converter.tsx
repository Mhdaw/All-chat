import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

function useConverter({audioUrl}:any) {
  const [loaded, setLoaded] = useState(false);
  const [audio, setAudio] = useState<Uint8Array>();
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messageRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(()=>{
    transcode().then(()=>{
        console.log("transcoded ...");
    })
  },[])

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    setLoaded(true);
  };

  const transcode = async () => {

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.webm", await fetchFile(audioUrl));
    await ffmpeg.exec(["-i", "input.webm", "output.mp3"]);
    const fileData = await ffmpeg.readFile('output.mp3');
    const data = new Uint8Array(fileData as ArrayBuffer);
    setAudio(data);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: 'video/mp4' })
      )
    }
  };

  return {
    loaded,
    audio
  }
}

export default useConverter;