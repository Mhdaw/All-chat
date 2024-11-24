import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration

model_names = ["openai/whisper-tiny", "openai/whisper-tiny.en", "openai/whisper-base", 
               "openai/whisper-base.en", "openai/whisper-small", "openai/whisper-small.en"]

model_name = model_names[0]

processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)
model.config.forced_decoder_ids = None


def transcrib(input_sample = None):
    # To do : retrive the speech for converting to text, it must be an array and have a sample rate
    if input_sample:
        input_features = processor(input_sample["array"], sampling_rate=input_sample["sampling_rate"], return_tensors="pt").input_features 
        predicted_ids = model.generate(input_features)
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
    return transcription
