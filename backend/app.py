import os
import traceback
from flask import Flask, request, render_template, jsonify
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Store conversations in memory
conversations = {}

class ChatService:
    def __init__(self, api_key=None, base_url=None):
        try:
            # Use environment variables if not provided
            self.api_key = api_key or os.getenv('API_KEY')
            self.base_url = base_url or os.getenv('BASE_URL')

            # Validate API credentials
            if not self.api_key or not self.base_url:
                raise ValueError("Missing API credentials. Check your .env file.")

            # Initialize OpenAI client
            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        except Exception as e:
            logging.error(f"Chat Service initialization error: {e}")
            raise

    def get_response(self, conversation_id, message):
        try:
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                
            conversations[conversation_id].append({"role": "user", "content": message})
            
            messages = [
                {"role": "system", "content": "You are a helpfull assistance and answer with fun examples."}
            ] + conversations[conversation_id]
            # Get response from API
            response = self.client.chat.completions.create(
                model="Meta-Llama-3-1-8B-Instruct-FP8",
                messages=messages
            )
            # Add assistant response to history
            assistant_message = response.choices[0].message.content
            conversations[conversation_id].append({"role": "assistant", "content": assistant_message})
            return assistant_message
        except Exception as e:
            logging.error(f"Error in get_response: {e}")
            raise

# Global chat service instance
try:
    chat_service = ChatService()
except Exception as e:
    logging.error(f"Failed to initialize ChatService: {e}")
    chat_service = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    if not chat_service:
        return jsonify({'error': 'Chat service not initialized'}), 500

    try:
        data = request.json
        message = data.get('message')
        conversation_id = data.get('conversation_id', 'default')
        
        response = chat_service.get_response(conversation_id, message)
        return jsonify({'response': response})
    except Exception as e:
        logging.error(f"Message send error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_history/<conversation_id>')
def get_history(conversation_id):
    return jsonify({'history': conversations.get(conversation_id, [])})

@app.route('/clear_history/<conversation_id>')
def clear_history(conversation_id):
    if conversation_id in conversations:
        conversations[conversation_id] = []
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)