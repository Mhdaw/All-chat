import torch
import diffusers 

def handle_image_generator(model_id):
  if "stable-diffusion" in model_id:
    generator_type = "stable-diffusion"
  elif "FLUX" in model_id:
    generator_type = "flux"
  else:
    raise ValueError(f"Unsupported model type: {model_id}")

def load_stable_diffusion_generator(model_id):
  pipe = diffusers.StableDiffusion3Pipeline.from_pretrained(model_id, torch_dtype=torch.float16)
  pipe = pipe.to("cuda")
  return pipe

def load_flux_generator(model_id):
  pipe = diffusers.FluxPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
  pipe.enable_model_cpu_offload() 
  pipe = pipe.to("cuda")
  return pipe

def load_image_generator(model_id):
  generator_type = handle_image_generator(model_id)

  if generator_type == "stable-diffusion":
    return load_stable_diffusion_generator(model_id)
  elif generator_type == "flux":
    return load_flux_generator(model_id)

def generate_image(prompt, model_id, IMAGE_FOLDER):
  try:
    if not torch.cuda.is_available():
              return None, None, "GPU is not available. Please try another model."
    generator_type = handle_image_generator(model_id)
    image_id = str(uuid.uuid4())

    if generator_type == "stable-diffusion":
      pipe = load_stable_diffusion_generator(model_id)
      image = pipe(
          prompt,
          num_inference_steps=28,
          guidance_scale=3.5,
      ).images[0]
      
      image.save(f"{image_id}.png")
      image_path = os.path.join(IMAGE_FOLDER, f"{image_id}.png")
      return image_path, image_id

    elif generator_type == "flux":
      pipe = load_flux_generator(model_id)
      image = pipe(
          prompt,
          height=1024,
          width=1024,
          guidance_scale=3.5,
          num_inference_steps=50,
          max_sequence_length=512,
          generator=torch.Generator("cpu").manual_seed(0)
      ).images[0]
      image_path = os.path.join(IMAGE_FOLDER, f"{image_id}.png")
      image.save(f"{image_id}.png")
      return image_path, image_id
  except Exception as e:
        logging.error(f"Error loading custom model: {e}")
        return None, None, "Failed to load the image model."