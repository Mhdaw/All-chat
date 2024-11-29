import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import logging
import librosa

model_names = ["openai/whisper-tiny", "openai/whisper-tiny.en", "openai/whisper-base", 
               "openai/whisper-base.en", "openai/whisper-small", "openai/whisper-small.en"]
model_name = model_names[0]

processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)
model.config.forced_decoder_ids = None

def transcribe_speech(audio_file):
    """Transcribe speech from audio file"""
    try:
        audio, sr = librosa.load(audio_file, sr=48000)
        audio_resampled = librosa.resample(audio, orig_sr=sr, target_sr=16000)
        input_features = processor(
            audio_resampled, 
            sampling_rate=16000, 
            return_tensors="pt"
        ).input_features
        
        predicted_ids = model.generate(input_features)
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
        logging.info(f"transctranscriptionribtion generated successfully")
        return transcription[0] if transcription else ""
    except Exception as e:
        logging.error(f"Error transcribing speech: {e}")
        return ""