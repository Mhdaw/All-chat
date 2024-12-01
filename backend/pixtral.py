import torch
from vllm import LLM
from vllm.sampling_params import SamplingParams
import logging

# Globals for the model
llm = None
model_name = "mistralai/Pixtral-12B-2409"
sampling_params = SamplingParams(max_tokens=8192)

def load_pixtral_model():
    """Loads the Pixtral model."""
    global llm
    try:
        if torch.cuda.is_available():
            logging.info(f"GPU is available. Loading the {model_name} model...")
            llm = LLM(model=model_name, tokenizer_mode="mistral")
            logging.info("Pixtral model loaded successfully.")
        else:
            logging.warning("GPU is not available. The model will not be loaded.")
    except Exception as e:
        logging.error(f"Error loading Pixtral model: {e}")
