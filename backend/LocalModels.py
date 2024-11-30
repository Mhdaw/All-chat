import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import logging
def load_custom_model_and_tokenizer(model_id, hf_token):
    try:
        # Check if a GPU is available
        if not torch.cuda.is_available():
            return None, None, "GPU is not available. Please try another model."

        # Load the model and tokenizer with quantization
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16
        )
        tokenizer = AutoTokenizer.from_pretrained(model_id, use_auth_token=hf_token)
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            use_auth_token=hf_token,
            quantization_config=quantization_config,
            device_map="auto"
        )
        return model, tokenizer, None
    except Exception as e:
        logging.error(f"Error loading custom model: {e}")
        return None, None, "Failed to load the custom model."

# Define a function to get a response using the custom model
def get_custom_model_response(model, tokenizer, prompt):
    try:
        input_ids = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(**input_ids, max_new_tokens=256)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
    except Exception as e:
        logging.error(f"Error generating response: {e}")
        return "Error generating response with the custom model."
