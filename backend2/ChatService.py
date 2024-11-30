import os
import traceback
from flask import Flask, request, render_template, jsonify, send_file
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import logging
import uuid
from datetime import datetime, timezone
import json
import librosa
from pydub import AudioSegment
import io
import torch
from LocalModels import load_custom_model_and_tokenizer, get_custom_model_response



load_dotenv()

system_prompt = """
You are a helpful assistant designed to assist users with a wide range of queries and tasks. You have access to these functions:

1. get_stock_price(symbol: str): Gets the current stock price for a given stock symbol
   Example: FUNCTION_CALL: get_stock_price("AAPL")

2. calculate(expression: str): Performs a mathematical calculation
   Example: FUNCTION_CALL: calculate("100 * 0.15")

3. generate_image(prompt: str): Generates an image based on the given prompt
   Example: FUNCTION_CALL: generate_image("A beautiful sunset over the ocean")
   
To use these functions, respond with FUNCTION_CALL: followed by the function name and parameters.
Your primary goal is to provide accurate, clear, and concise information. 

- **Be Friendly**: Always maintain a polite and friendly tone. Make users feel comfortable asking questions.
- **Be Informative**: Provide detailed explanations when necessary, but ensure the information is easy to understand.
- **Be Proactive**: If you notice a user might need additional help or related information, offer it without being asked.
- **Encourage Engagement**: Ask follow-up questions to clarify user needs or to encourage further discussion.
- **Respect Privacy**: Never ask for personal information unless absolutely necessary for the task at hand.
- **Stay Neutral**: Avoid taking sides on controversial topics and present balanced information.

If no function is needed, respond normally.
Keep responses concise and natural,
Your responses should be tailored to the user's level of knowledge and the context of their questions. Always strive to be a reliable source of information and assistance.
"""


class ChatService:
    def __init__(self, api_key="sk-s2Hpm8x0MkhzV743Ecqzqw", base_url="https://chatapi.akash.network/api/v1"):
        try:
            self.api_key = api_key or os.getenv('API_KEY')
            self.base_url = base_url or os.getenv('BASE_URL')

            if not self.api_key or not self.base_url:
                raise ValueError("Missing API credentials. Check your .env file.")

            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        except Exception as e:
            logging.error(f"Chat Service initialization error: {e}")
            raise

    def get_stock_price(self, symbol: str) -> dict:
        """Get current stock price for a given symbol"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            return {
                "current_price": info.get("currentPrice", "N/A"),
                "company_name": info.get("longName", "N/A"),
                "currency": info.get("currency", "USD")
            }
        except Exception as e:
            return {"error": f"Could not fetch stock data: {str(e)}"}

    def calculate(self, expression: str) -> dict:
        """Safely evaluate a mathematical expression"""
        try:
            # Use eval safely with limited builtins
            allowed_names = {"abs": abs, "round": round}
            code = compile(expression, "<string>", "eval")
            for name in code.co_names:
                if name not in allowed_names:
                    raise NameError(f"Use of {name} not allowed")
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            return {"result": result}
        except Exception as e:
            return {"error": f"Could not calculate: {str(e)}"}

    def _generate_image(self, prompt: str) -> str:
      """Generate an image based on the given prompt."""
      image_path, image_id = generate_image(prompt, self.image_model, IMAGE_FOLDER) #todo: handle model_id, IMAGE_FOLDER
      return {"image_path": image_path, "image_id": image_id}

    def execute_function(self, function_text: str) -> str:
        """Execute a function based on the text command"""
        # Extract function name and parameters using regex
        match = re.match(r'FUNCTION_CALL: (\w+)\((.*)\)', function_text)
        if not match:
            return "Error: Invalid function call format"
        
        function_name, params_str = match.groups()
        
        # Remove quotes from parameters and split if multiple
        params = [p.strip('"').strip("'") for p in params_str.split(',')]

        function_mapping = {
            "get_stock_price": lambda p: self.get_stock_price(p[0]),
            "calculate": lambda p: self.calculate(p[0]),
            "_generate_image": lambda p: self.generate_image(p[0])
        }
        
        if function_name in function_mapping:
            try:
                result = function_mapping[function_name](params)
                return json.dumps(result)
            except Exception as e:
                return f"Error executing function: {str(e)}"
        return "Error: Function not found"

    def get_response(self, conversation_id, message, model=None, image_model=None):
        """
        Get a response from the assistant based on the model type.
        """
        try:
            self.image_model = image_model
            # Determine model type
            model_type = determine_model_type(model or "Meta-Llama-3-1-8B-Instruct-FP8")
            
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                
            # Add user message with no audio
            conversations[conversation_id].append({
                "role": "user", 
                "content": message,
                #"audio_file": None
            })
            
            if model_type == "open_model":
                # Load custom model and tokenizer
                custom_model, tokenizer, error = load_custom_model_and_tokenizer(
                    model_id=model, 
                    hf_token=os.getenv("HF_TOKEN") 
                )
                if error:
                    return error, None

                response = get_custom_model_response(custom_model, tokenizer, message)
                audio_filename = generate_speech(response, language="en", AUDIO_FOLDER=AUDIO_FOLDER)
            else:
                # Use the default chat service for API models
                messages = [{"role": "system", "content": system_prompt}] + [
                    {"role": msg["role"], "content": msg["content"]} for msg in conversations[conversation_id]
                ]
                response = self.client.chat.completions.create(
                    model=model or "Meta-Llama-3-1-405B-Instruct-FP8",  # Default model
                    messages=messages
                )
                assistant_response = response.choices[0].message.content
                if "FUNCTION_CALL:" in assistant_response:
                            # Split response into function call and rest of message
                            parts = assistant_response.split("\n", 1)
                            function_call = parts[0].strip()
                            
                            # Execute function
                            function_result = self.execute_function(function_call)
                            
                            # Add function result to messages
                            messages.append({
                                "role": "assistant",
                                "content": function_call
                            })
                            messages.append({
                                "role": "function",
                                "content": function_result
                            })
                            
                            # Get final response incorporating function result
                            final_response = self.client.chat.completions.create(    
                                model=model or "Meta-Llama-3-1-8B-Instruct-FP8",  # Default model
                                messages=messages
                              )
                            assistant_response = final_response.choices[0].message.content

                response = assistant_response
                audio_filename = generate_speech(response, language="en", AUDIO_FOLDER=AUDIO_FOLDER)

            conversations[conversation_id].append({
                "role": "assistant",
                "content": response,
                "audio_file": audio_filename
            })
            
            save_data(conversations, chat_metadata)
            return response
        except Exception as e:
            logging.error(f"Error in get_response: {e}")
            raise