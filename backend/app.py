import os
import traceback
from flask import Flask, request, render_template, jsonify, send_file
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import logging
import uuid
from datetime import datetime, timezone
import yfinance as yf
import json
import librosa
from pydub import AudioSegment
import io
import re
import torch

from speech2text import transcribe_speech
from text2speech import generate_speech
from text2image import generate_image_func
from websearch import get_answer_from_tavily, fetch_url
from LocalModels import get_custom_model_response, load_custom_model_and_tokenizer
load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

# Store conversations in a file
CONVERSATIONS_FILE = 'conversations.json'
METADATA_FILE = 'chat_metadata.json'
AUDIO_FOLDER = 'audio'
IMAGE_FOLDER = 'image'

# Create audio folder if it doesn't exist
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)
if not os.path.exists(IMAGE_FOLDER):
    os.makedirs(IMAGE_FOLDER)
    
def load_data():
    try:
        if os.path.exists(CONVERSATIONS_FILE):
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
        else:
            conversations = {}
            
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r') as f:
                chat_metadata = json.load(f)
        else:
            chat_metadata = {}
            
        return conversations, chat_metadata
    except Exception as e:
        logging.error(f"Error loading data: {e}")
        return {}, {}

def save_data(conversations, chat_metadata):
    try:
        with open(CONVERSATIONS_FILE, 'w') as f:
            json.dump(conversations, f)
        with open(METADATA_FILE, 'w') as f:
            json.dump(chat_metadata, f)
    except Exception as e:
        logging.error(f"Error saving data: {e}")

conversations, chat_metadata = load_data()

system_prompt = """
You are a helpful assistant designed to assist users with a wide range of queries and tasks. You have access to these functions:

1. get_stock_price(symbol: str): Gets the current stock price for a given stock symbol
   Example: FUNCTION_CALL: get_stock_price("AAPL")

2. calculate(expression: str): Performs a mathematical calculation
   Example: FUNCTION_CALL: calculate("100 * 0.15")

3. generate_image(prompt: str): Generates an image based on the given prompt
   Example: FUNCTION_CALL: generate_image("A beautiful sunset over the ocean")

4. get_web_result(query: str): performes a web search and return the answer to the query
    Example: FUNCTION_CALL: get_web_result("What is machine learning")

5. get_url(urls: str): fetchs the URL and extracts the urls content and return the URL that it fetched and the extracted content
    Example 1: FUNCTION_CALL: get_web_result("https://en.wikipedia.org/wiki/Artificial_intelligence")
    Example 2: FUNCTION_CALL: get_web_result( [
    "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "https://en.wikipedia.org/wiki/Machine_learning",
    "https://en.wikipedia.org/wiki/Data_science"])
    Note: if you want to fetch more thatn 1 URL please put them in a list like above
   
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


API_MODELS  = ["Meta-Llama-3-1-8B-Instruct-FP8","Meta-Llama-3-1-405B-Instruct-FP8","Meta-Llama-3-2-3B-Instruct","nvidia-Llama-3-1-Nemotron-70B-Instruct-HF"]

def determine_model_type(model_name):
    """
    Determine if the given model is an API model or an open model.
    Returns "api_model" if the model is in the API list, otherwise "open_model".
    """
    return "api_model" if model_name in API_MODELS else "open_model"

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

    def generate_image(self, prompt: str) -> dict:

      """Generate an image based on the given prompt."""
      try:
          # Assuming generate_image_func is a function that generates the image
          # and returns the image path and image ID.
          result = generate_image_func(prompt, self.image_model, IMAGE_FOLDER)

          if result is None or len(result) != 2:
              return {"error": "Could not generate image: " + result[2] if result and len(result) > 2 else "Unknown error"}

          image_path, image_id = result
          return {"image_path": image_path, "image_id": image_id}
      except Exception as e:
          return {"error": f"Could not generate image: {str(e)}"}

    def get_web_result(self, query):
        try:

            answer = get_answer_from_tavily(query)
            logging.info(f"got answer from web for:{query}")
            return {"web_result": answer}
        except Exception as e:
            return {"error": f"could not get web answer: {str(e)}"}
        
    def get_url(self, urls):
        try:
            url, content = fetch_url(urls)
            logging.info(f"fetched for url:{urls}")
            return {"web_url":url, "extracted_content":content}
        except Exception as e:
            return {"error": f"could not fetch url: {str(e)}"}

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
            "generate_image": lambda p: self.generate_image(p[0]),
            "get_web_result": lambda p: self.get_web_result(p[0]),
            "fetch_url": lambda p: self.get_url(p[0])
        }
        
        if function_name in function_mapping:
            try:
                result = function_mapping[function_name](params)
                logging.info(f"result generated for function{function_name}, result:{result}")
                return json.dumps(result)
            except Exception as e:
                return f"Error executing function: {str(e)}"
        return "Error: Function not found"

    def get_response(self, conversation_id, message, model=None, image_model=None):# , speech_model=None
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
                audio_filename = generate_speech(response, language="en", AUDIO_FOLDER=AUDIO_FOLDER)# , model=speech_model
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
                            logging.info(f"function_call:{function_call}")
                            
                            # Execute function
                            function_result = self.execute_function(function_call)
                            logging.info(f"function_result:{function_result}")

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
                audio_filename = generate_speech(response, language="en", AUDIO_FOLDER=AUDIO_FOLDER) # , model=speech_model

            conversations[conversation_id].append({
                "role": "assistant",
                "content": response,
                "audio_file": audio_filename if audio_filename else None
            })
            
            save_data(conversations, chat_metadata)
            return response, audio_filename
        except Exception as e:
            logging.error(f"Error in get_response: {e}")
            raise

try:
    chat_service = ChatService()
except Exception as e:
    logging.error(f"Failed to initialize ChatService: {e}")
    chat_service = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/create_chat', methods=['POST'])
def create_chat():
    chat_id = str(uuid.uuid4())
    conversations[chat_id] = []
    chat_metadata[chat_id] = {
        'title': f'New Chat {len(chat_metadata) + 1}',
        'timestamp': datetime.utcnow().isoformat()
    }
    save_data(conversations, chat_metadata)
    return jsonify({
        'chat_id': chat_id,
        'title': chat_metadata[chat_id]['title'],
        'timestamp': chat_metadata[chat_id]['timestamp']
    })

@app.route('/rename_chat', methods=['POST'])
def rename_chat():
    data = request.json
    chat_id = data.get('chat_id')
    new_title = data.get('title')
    
    if chat_id in chat_metadata:
        chat_metadata[chat_id]['title'] = new_title
        save_data(conversations, chat_metadata)
        return jsonify({'status': 'success'})
    return jsonify({'error': 'Chat not found'}), 404

@app.route('/delete_chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    if chat_id in conversations:
        # Delete associated audio files
        for message in conversations[chat_id]:
            if message.get('audio_file'):
                audio_path = os.path.join(AUDIO_FOLDER, message['audio_file'])
                try:
                    os.remove(audio_path)
                except OSError:
                    pass
        
        del conversations[chat_id]
        del chat_metadata[chat_id]
        save_data(conversations, chat_metadata)
        return jsonify({'status': 'success'})
    return jsonify({'error': 'Chat not found'}), 404

@app.route('/get_all_chats')
def get_all_chats():
    return jsonify({'chats': chat_metadata})

@app.route('/send_message', methods=['POST'])
def send_message():
    if not chat_service:
        return jsonify({'error': 'Chat service not initialized'}), 500

    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 415
            
        data = request.json
        message = data.get('message')
        conversation_id = data.get('conversation_id')
        model = data.get('model')  # Selected model (e.g., "custom_model")
        image_model = data.get('image_model')
        #transcribe_model = data.get('transcribe_model')
        #speech_model = data.get('speech_model')
        if not message or not conversation_id:
            return jsonify({'error': 'Message and conversation_id are required'}), 400

        model_type = determine_model_type(model)

        # Handle custom model
        if model_type == "open_model" and not torch.cuda.is_available():
            return jsonify({'error': 'GPU is not available. Please try another model.'}), 400

        text_response, audio_filename = chat_service.get_response(conversation_id, message, model, image_model)#, speech_model

        chat_metadata[conversation_id]['timestamp'] = datetime.utcnow().isoformat()
        save_data(conversations, chat_metadata)
        return jsonify({'text': text_response, 'audio_file': audio_filename})
    except Exception as e:
        logging.error(f"Error in /send_message: {e}")
        return jsonify({'error': 'Failed to process the message'}), 500


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    try:
        print(request.files)
        if 'audio' not in request.files:
            print("no audio")
            return jsonify({'error': 'No audio file provided'}), 401
            
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        conversation_id = request.form.get('conversation_id')
        
        if not conversation_id:
            print("no convo")
            return jsonify({'error': 'conversation_id is required'}), 400
            
        # Save user's audio file
        user_audio_filename = f"user_{uuid.uuid4()}.webm"
        temp_path = os.path.join(AUDIO_FOLDER, f"user_{uuid.uuid4()}.webm")
        audio_file.save(temp_path)

        wav_path = os.path.join(AUDIO_FOLDER, f"{uuid.uuid4()}.wav")
        audio = AudioSegment.from_file(temp_path, format="webm")
        audio.export(wav_path, format="wav")
        os.remove(temp_path)
        #data_t = request.json
        #transcribe_model = data_t.get('transcribe_model')
        transcribed_text = transcribe_speech(wav_path)# , model_name=transcribe_model
        
        if transcribed_text:
            # Add user message with audio
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                
            conversations[conversation_id].append({
                "role": "user",
                "content": transcribed_text,
                "audio_file": user_audio_filename
            })
            
            # Get response using transcribed text
            text_response, audio_filename = chat_service.get_response(conversation_id, transcribed_text)
            
            save_data(conversations, chat_metadata)
            
            return jsonify({
                'transcribed_text': transcribed_text,
                'response': text_response,
                'audio_url': f'/audio/{audio_filename}' if audio_filename else None,
                'user_audio_url': f'/audio/{user_audio_filename}'
            })
        else:
            os.remove(user_audio_filename)
            return jsonify({'error': 'Failed to transcribe audio'}), 500
            
    except Exception as e:
        logging.error(f"Audio upload error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/audio/<filename>')
def serve_audio(filename):
    try:
        return send_file(
            os.path.join(AUDIO_FOLDER, filename),
            mimetype='audio/mpeg'
        )
    except Exception as e:
        logging.error(f"Error serving audio file: {e}")
        return jsonify({'error': 'Audio file not found'}), 404

@app.route('/image/<filename>')
def serve_image(filename):
    try:
        return send_file(
            os.path.join(IMAGE_FOLDER, filename),
            mimetype='image/png'
        )
    except Exception as e:
        logging.error(f"Error serving image file: {e}")
        return jsonify({'error': 'Image file not found'}), 404


@app.route('/get_history/<conversation_id>')
def get_history(conversation_id):
    return jsonify({'history': conversations.get(conversation_id, [])})

@app.route('/clear_history/<conversation_id>')
def clear_history(conversation_id):
    if conversation_id in conversations:
        conversations[conversation_id] = []
        save_data(conversations, chat_metadata)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
