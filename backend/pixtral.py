import torch
from vllm import LLM
from vllm.sampling_params import SamplingParams
import logging

model_name = "mistralai/Pixtral-12B-2409"

sampling_params = SamplingParams(max_tokens=8192)

llm = LLM(model=model_name, tokenizer_mode="mistral")
logging.info(f"pixtral loaded...")

def get_pixteral_response(prompt, image_url):
    try:

        if not torch.cuda.is_available():
            return None, None, "GPU is not available. Please try another service. pixtral model only works with GPU device."
        messages = [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": image_url}}]
            },
        ]

        outputs = llm.chat(messages, sampling_params=sampling_params)
        response = outputs[0].outputs[0].text
        return response
    except Exception as e:
        logging.error(f"Error loading getting pixtral response: {e}")
        return None, None, "Failed to get the pixtral response."
