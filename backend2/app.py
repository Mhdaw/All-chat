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
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import diffusers 
from speech2text import transcribe_speech
from text2speech import generate_speech
from ChatService import ChatService
from utils import save_data, load_data
from LocalModels import load_custom_model_and_tokenizer, get_custom_model_response

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)



# Store conversations in a file
CONVERSATIONS_FILE = 'conversations.json'
METADATA_FILE = 'chat_metadata.json'
AUDIO_FOLDER = 'audio_files'
IMAGE_FOLDER = 'image_files'

# Create audio folder if it doesn't exist
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)
if not os.path.exists(IMAGE_FOLDER):
    os.makedirs(IMAGE_FOLDER)

conversations, chat_metadata = load_data()

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
        if not message or not conversation_id:
            return jsonify({'error': 'Message and conversation_id are required'}), 400

        model_type = determine_model_type(model)

        # Handle custom model
        if model_type == "open_model" and not torch.cuda.is_available():
            return jsonify({'error': 'GPU is not available. Please try another model.'}), 400

        text_response, audio_filename = chat_service.get_response(conversation_id, message, model, image_model)

        chat_metadata[conversation_id]['timestamp'] = datetime.utcnow().isoformat()
        save_data(conversations, chat_metadata)
        return jsonify({'text': text_response, 'audio_file': audio_filename})
    except Exception as e:
        logging.error(f"Error in /send_message: {e}")
        return jsonify({'error': 'Failed to process the message'}), 500


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    try:
        print(request.json)
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
        
        transcribed_text = transcribe_speech(wav_path)
        
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