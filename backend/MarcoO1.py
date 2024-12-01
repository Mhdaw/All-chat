from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers import BitsAndBytesConfig
import torch
import logging

# Globals for the model and tokenizer
model = None
tokenizer = None

# Quantization configuration
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,  # Enable 4-bit quantization
    bnb_4bit_quant_type="nf4",  # Quantization type (default: 'nf4')
    bnb_4bit_use_double_quant=True,  # Use double quantization for better performance
    bnb_4bit_compute_dtype="float16"  # Specify computation dtype (e.g., 'float16')
)

def load_marcoO1_model():
    """Load the model and tokenizer."""
    global model, tokenizer
    try:
        tokenizer = AutoTokenizer.from_pretrained("AIDC-AI/Marco-o1")
        model = AutoModelForCausalLM.from_pretrained(
            "AIDC-AI/Marco-o1",
            quantization_config=bnb_config,
            device_map="auto"
        )
        logging.info("Model and tokenizer loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading model: {e}")

def marcoO1_generate_response(model, tokenizer, input_ids, attention_mask, max_new_tokens=4096):
    """Generates a response using the model."""
    generated_ids = input_ids
    with torch.inference_mode():
        for _ in range(max_new_tokens):
            outputs = model(input_ids=generated_ids, attention_mask=attention_mask)
            next_token_id = torch.argmax(outputs.logits[:, -1, :], dim=-1).unsqueeze(-1)
            generated_ids = torch.cat([generated_ids, next_token_id], dim=-1)
            attention_mask = torch.cat([attention_mask, torch.ones_like(next_token_id)], dim=-1)
            new_token = tokenizer.decode(next_token_id.squeeze(), skip_special_tokens=True)
            print(new_token, end='', flush=True)
            if next_token_id.item() == tokenizer.eos_token_id:
                break
    return tokenizer.decode(generated_ids[0][input_ids.shape[-1]:], skip_special_tokens=True)
