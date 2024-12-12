import os
import torch
from gtts import gTTS

import logging
import uuid
from pydub import AudioSegment

try:
    from TTS.api import TTS

language = "en"


c_tts_name = "tts_models/multilingual/multi-dataset/xtts_v2"

def generate_speech(text, language, AUDIO_FOLDER, model="gtts"):
    if model == "gtts":
        """Generate speech from text and return the filename"""
        try:
            filename = f"{uuid.uuid4()}.mp3"
            filepath = os.path.join(AUDIO_FOLDER, filename)
            tts = gTTS(text=text, lang=language, slow=False)
            tts.save(filepath)
            logging.info(f"Audio generated successfully: {filepath}")
            return filename
        except Exception as e:
            logging.error(f"Error generating speech: {e}")
            return None
    elif model == "TTS":
        if not torch.cuda.is_available():
            logging.error("GPU is NOT available! Please try another model.")
            return None
        try:
            filename = f"{uuid.uuid4()}.wav"
            filepath = os.path.join(AUDIO_FOLDER, filename)
            tts = TTS(c_tts_name).to("cuda")
            # generate speech by cloning a voice using default settings
            tts.tts_to_file(text=text, file_path=filepath, speaker="Ana Florence", language="en", split_sentences=True)
            logging.info("speech is generated with coquiTTS")
            audio = AudioSegment.from_wav(filepath)
            filename_mp3 = f"{uuid.uuid4()}.mp3"
            filepath_mp3 = os.path.join(AUDIO_FOLDER, filename_mp3)
            # Export as MP3
            audio.export(filepath_mp3, format="mp3")
            logging.info(f"Audio generated successfully: {filepath_mp3}")
            return filename_mp3
        except Exception as e:
            logging.error(f"Error generating speech: {e}")
            return None
    else:
        logging.error(f"Unsupported model: {model}")
        return None
