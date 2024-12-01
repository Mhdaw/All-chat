import torch
from vllm import LLM
from vllm.sampling_params import SamplingParams
import logging

model_name = "mistralai/Pixtral-12B-2409"
sampling_params = SamplingParams(max_tokens=8192)
llm = None

def load_pixtral_model():
    global llm
    if torch.cuda.is_available():
        logging.info(f"GPU is available. Loading the {model_name} model...")
        llm = LLM(model=model_name, tokenizer_mode="mistral")
        logging.info("Pixtral model loaded successfully.")
    else:
        logging.warning("GPU is not available. The model will not be loaded.")

def get_pixtral_response(prompt, image_url):
    try:
        if llm is None:
            return None, None, "GPU is not available. Please try another service. Pixtral model only works with GPU device."

        messages = [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": image_url}}]
            },
        ]

        outputs = llm.chat(messages, sampling_params=sampling_params)
        response = outputs[0].outputs[0].text
        return response, None, None
    except Exception as e:
        logging.error(f"Error getting pixtral response: {e}")
        return None, None, "Failed to get the pixtral response."

