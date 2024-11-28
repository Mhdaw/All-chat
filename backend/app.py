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
import io

from speech2text import transcribe_speech
from text2speech import generate_speech

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

# Store conversations in a file
CONVERSATIONS_FILE = 'conversations.json'
METADATA_FILE = 'chat_metadata.json'
AUDIO_FOLDER = 'audio_files'

# Create audio folder if it doesn't exist
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)

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
You are a helpful assistant designed to assist users with a wide range of queries and tasks. Your primary goal is to provide accurate, clear, and concise information. 

- **Be Friendly**: Always maintain a polite and friendly tone. Make users feel comfortable asking questions.
- **Be Informative**: Provide detailed explanations when necessary, but ensure the information is easy to understand.
- **Be Proactive**: If you notice a user might need additional help or related information, offer it without being asked.
- **Encourage Engagement**: Ask follow-up questions to clarify user needs or to encourage further discussion.
- **Respect Privacy**: Never ask for personal information unless absolutely necessary for the task at hand.
- **Stay Neutral**: Avoid taking sides on controversial topics and present balanced information.

Your responses should be tailored to the user's level of knowledge and the context of their questions. Always strive to be a reliable source of information and assistance.
"""

class ChatService:
    def __init__(self, api_key=None, base_url=None):
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

    def get_response(self, conversation_id, message, model=None):
        try:
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                
            # Add user message with no audio
            conversations[conversation_id].append({
                "role": "user", 
                "content": message,
                "audio_file": None
            })
            
            messages = [
                {"role": "system", "content": system_prompt}
            ] + [{
                "role": msg["role"], 
                "content": msg["content"]
            } for msg in conversations[conversation_id]]
            
            response = self.client.chat.completions.create(
                model= model or "Meta-Llama-3-1-8B-Instruct-FP8",
                messages=messages
            )
            
            assistant_message = response.choices[0].message.content
            audio_filename = generate_speech(assistant_message, language="en", AUDIO_FOLDER=AUDIO_FOLDER)
            
            conversations[conversation_id].append({
                "role": "assistant",
                "content": assistant_message,
                "audio_file": audio_filename
            })
            
            save_data(conversations, chat_metadata)
            
            return assistant_message, audio_filename
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
        model = data.get('model')  # Get the selected model
        
        if not message or not conversation_id:
            return jsonify({'error': 'Message and conversation_id are required'}), 400
            
        text_response, audio_filename = chat_service.get_response(conversation_id, message, model)
        
        chat_metadata[conversation_id]['timestamp'] = datetime.utcnow().isoformat()
        save_data(conversations, chat_metadata)
        logging.info("Response generated successfully...")
        return jsonify({
            'response': text_response,
            'audio_url': f'/audio/{audio_filename}' if audio_filename else None
        })
    except Exception as e:
        logging.error(f"Message send error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
            
        audio_file = request.files['audio']
        conversation_id = request.form.get('conversation_id')
        
        if not conversation_id:
            return jsonify({'error': 'conversation_id is required'}), 400
            
        # Save user's audio file
        user_audio_filename = f"user_{uuid.uuid4()}.wav"
        user_audio_path = os.path.join(AUDIO_FOLDER, user_audio_filename)
        audio_file.save(user_audio_path)
        
        transcribed_text = transcribe_speech(user_audio_path)
        
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
            os.remove(user_audio_path)
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
