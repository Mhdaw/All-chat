import requests
import torch
from PIL import Image
from transformers import MllamaForConditionalGeneration, AutoProcessor
import logging
import os

# Globals for model and processor
vision_model = None
vision_processor = None
hf_token = os.getenv("HF_token")
def load_vision_model_and_tokenizer():
    """Loads the vision model and processor."""
    global vision_model, vision_processor
    try:
        if not torch.cuda.is_available():
            return None, None, "GPU is not available. Llama-3.2-11B-Vision model requires a GPU."

        vision_model = MllamaForConditionalGeneration.from_pretrained(
            "meta-llama/Llama-3.2-11B-Vision-Instruct",
            use_auth_token=hf_token,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
        vision_processor = AutoProcessor.from_pretrained("meta-llama/Llama-3.2-11B-Vision-Instruct",use_auth_token=hf_token)
        logging.info("Vision model and processor loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading vision model and tokenizer: {e}")
        return None, None, str(e)

def get_model_response(image_url, prompt):
    """Generates a response from the model based on an image and prompt."""
    try:
        global vision_model, vision_processor

        if vision_model is None or vision_processor is None:
            load_vision_model_and_tokenizer()
            if vision_model is None or vision_processor is None:
                return "Model or processor loading failed."

        # Load image
        image = Image.open(requests.get(image_url, stream=True).raw)

        # Prepare input messages
        messages = [
            {"role": "user", "content": [
                {"type": "image"},
                {"type": "text", "text": prompt}
            ]}
        ]
        input_text = vision_processor.apply_chat_template(messages, add_generation_prompt=True)

        # Process inputs
        inputs = vision_processor(
            image,
            input_text,
            add_special_tokens=False,
            return_tensors="pt"
        ).to(vision_model.device)

        # Generate response
        output = vision_model.generate(**inputs, max_new_tokens=30)
        response = vision_processor.decode(output[0], skip_special_tokens=True)
        return response
    except Exception as e:
        logging.error(f"Error generating model response: {e}")
        return str(e)
