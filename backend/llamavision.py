import requests
import torch
from PIL import Image
import logging
from transformers import MllamaForConditionalGeneration, AutoProcessor

# Global variables for the model and processor
vision_model = None
vision_processor = None

def load_vision_model_and_tokenizer():
    try:
        if not torch.cuda.is_available():
            logging.warning("GPU is not available. The model will not be loaded.")
            return None, None, "GPU is not available. Please try another service. Llama-3.2-11B-Vision model only works with GPU device."
        logging.info("GPU is available. Loading the model...")
        model = MllamaForConditionalGeneration.from_pretrained(
            "meta-llama/Llama-3.2-11B-Vision-Instruct",
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
        processor = AutoProcessor.from_pretrained("meta-llama/Llama-3.2-11B-Vision-Instruct")
        logging.info("Llama-3.2-11B-Vision model loaded successfully.")
        return model, processor, None
    except Exception as e:
        logging.error(f"Error loading vision model and tokenizer: {e}")
        return None, None, str(e)

def get_model_response(image_url, prompt, model_id="meta-llama/Llama-3.2-11B-Vision-Instruct"):
    """Generates a response from the model based on an image and prompt."""
    global vision_model, vision_processor

    try:
        if vision_model is None or vision_processor is None:
            vision_model, vision_processor, error_message = load_vision_model_and_tokenizer()
            if error_message:
                return None, None, error_message

        image = Image.open(requests.get(image_url, stream=True).raw)

        messages = [
            {"role": "user", "content": [
                {"type": "image"},
                {"type": "text", "text": prompt}
            ]}
        ]
        input_text = vision_processor.apply_chat_template(messages, add_generation_prompt=True)
        inputs = vision_processor(
            image,
            input_text,
            add_special_tokens=False,
            return_tensors="pt"
        ).to(vision_model.device)

        output = vision_model.generate(**inputs, max_new_tokens=30)
        response = vision_processor.decode(output[0], skip_special_tokens=True)
        return response, None, None
    except Exception as e:
        logging.error(f"Error generating model response: {e}")
        return None, None, str(e)

# usage
#vision_model, vision_processor, error_message = load_vision_model_and_tokenizer()
#if error_message:
#    logging.error(error_message)
