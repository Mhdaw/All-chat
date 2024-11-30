import os
import uuid
import torch
import logging
from diffusers import StableDiffusion3Pipeline, FluxPipeline, DiffusionPipeline, StableDiffusionPipeline

def handle_image_generator(model_id):
    if "stable-diffusion-3" in model_id:
        return "stable-diffusion-3"
    elif "stable-diffusion-2" in model_id:
        return "stable-diffusion-2"
    elif "stable-diffusion-xl" in model_id:
        return "stable-diffusion-xl"
    elif "FLUX" in model_id:
        return "flux"
    else:
        raise ValueError(f"Unsupported model type: {model_id}")

def load_stable_diffusion_3_generator(model_id):
    pipe = StableDiffusion3Pipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    return pipe

def load_stable_diffusion_2_generator(model_id):
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    return pipe

def load_stable_diffusion_xl_generator(model_id):
    pipe = DiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16, use_safetensors=True, variant="fp16")
    pipe = pipe.to("cuda")
    return pipe

def load_flux_generator(model_id):
    pipe = FluxPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe.enable_model_cpu_offload()
    pipe = pipe.to("cuda")
    return pipe

def load_image_generator(model_id):
    generator_type = handle_image_generator(model_id)

    if generator_type == "stable-diffusion-3":
        return load_stable_diffusion_3_generator(model_id)
    elif generator_type == "stable-diffusion-2":
        return load_stable_diffusion_2_generator(model_id)
    elif generator_type == "stable-diffusion-xl":
        return load_stable_diffusion_xl_generator(model_id)
    elif generator_type == "flux":
        return load_flux_generator(model_id)

def generate_image_func(prompt, model_id, IMAGE_FOLDER):
    try:
        if not torch.cuda.is_available():
            return None, None, "GPU is not available. Please try another model."

        generator_type = handle_image_generator(model_id)
        image_id = str(uuid.uuid4())

        pipe = load_image_generator(model_id)

        if generator_type == "stable-diffusion-3":
            image = pipe(
                prompt,
                num_inference_steps=28,
                guidance_scale=3.5,
            ).images[0]

        elif generator_type == "stable-diffusion-2":
            image = pipe(
                prompt,
                num_inference_steps=28,
                guidance_scale=3.5,
            ).images[0]

        elif generator_type == "stable-diffusion-xl":
            image = pipe(
                prompt,
                num_inference_steps=28,
                guidance_scale=3.5,
            ).images[0]

        elif generator_type == "flux":
            image = pipe(
                prompt,
                height=1024,
                width=1024,
                guidance_scale=3.5,
                num_inference_steps=50,
                max_sequence_length=512,
                generator=torch.Generator("cpu").manual_seed(0),
            ).images[0]

        image_path = os.path.join(IMAGE_FOLDER, f"{image_id}.png")
        image.save(image_path)
        return image_path, image_id

    except Exception as e:
        logging.error(f"Error loading custom model: {e}")
        return None, None, f"Failed to load the image model: {str(e)}"