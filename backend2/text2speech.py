
import os
from gtts import gTTS
import logging
import uuid

language = "en"

def generate_speech(text, language, AUDIO_FOLDER):
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
