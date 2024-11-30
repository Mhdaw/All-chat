import unittest
import requests
import json
import uuid
import os
from unittest.mock import patch, MagicMock
from app import app, conversations, chat_metadata
from unittest.mock import patch, MagicMock

class TestApp(unittest.TestCase):
    def setUp(self):
        # Set up the test client
        self.client = app.test_client()
        self.conversation_id = str(uuid.uuid4())

        # Create a temporary audio file for testing
        self.audio_file_path = '/workspaces/llama_chatbot/backend/Leonard Cohen - Happens to the Heart.webm'
        with open(self.audio_file_path, 'wb') as f:
            f.write(b'fake audio data')

    def tearDown(self):
        # Clear the conversation after each test
        if self.conversation_id in conversations:
            del conversations[self.conversation_id]
        if self.conversation_id in chat_metadata:
            del chat_metadata[self.conversation_id]

        # Remove the temporary audio file
        if os.path.exists(self.audio_file_path):
            os.remove(self.audio_file_path)

    @patch('app.ChatService.get_stock_price')
    def test_get_stock_price(self, mock_get_stock_price):
        mock_get_stock_price.return_value = {
            "current_price": 150.0,
            "company_name": "Apple Inc.",
            "currency": "USD"
        }
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'FUNCTION_CALL: get_stock_price("AAPL")', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('text', data)
        self.assertIn('"current_price": 150.0', data['text'])

    @patch('app.ChatService.calculate')
    def test_calculate(self, mock_calculate):
        mock_calculate.return_value = {"result": 15.0}
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'FUNCTION_CALL: calculate("100 * 0.15")', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('text', data)
        self.assertIn('"result": 15.0', data['text'])

    @patch('app.ChatService.generate_image')
    def test_generate_image(self, mock_generate_image):
        mock_generate_image.return_value = {"image_path": "path/to/image.png", "image_id": "image123"}
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'FUNCTION_CALL: generate_image("A beautiful sunset over the ocean")', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('text', data)
        self.assertIn('"image_id": "image123"', data['text'])

    def test_home(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_create_chat(self):
        response = self.client.post('/create_chat')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('chat_id', data)
        self.assertIn('title', data)
        self.assertIn('timestamp', data)

    def test_rename_chat(self):
        chat_id = self.create_chat()
        response = self.client.post('/rename_chat', json={'chat_id': chat_id, 'title': 'Renamed Chat'})
        self.assertEqual(response.status_code, 200)

    def test_delete_chat(self):
        chat_id = self.create_chat()
        response = self.client.delete(f'/delete_chat/{chat_id}')
        self.assertEqual(response.status_code, 200)

    def test_get_all_chats(self):
        chat_id = self.create_chat()
        response = self.client.get('/get_all_chats')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn(chat_id, data['chats'])

    def test_send_message(self):
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'Hello', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('text', data)
        self.assertIn('audio_file', data)

    def test_upload_audio(self):
        chat_id = self.create_chat()
        with open(self.audio_file_path, 'rb') as f:
            response = self.client.post('/upload_audio', data={'audio': f, 'conversation_id': chat_id, 'transcribe_model': 'openai/whisper-tiny'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('transcribed_text', data)
        self.assertIn('response', data)
        self.assertIn('audio_url', data)
        self.assertIn('user_audio_url', data)

    def test_serve_audio(self):
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'Hello', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        data = response.get_json()
        audio_filename = data['audio_file']
        response = self.client.get(f'/audio/{audio_filename}')
        self.assertEqual(response.status_code, 200)

    def test_serve_image(self):
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'FUNCTION_CALL: generate_image("A beautiful sunset over the ocean")', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        data = response.get_json()
        image_filename = json.loads(data['text'])['image_id'] + ".png"
        response = self.client.get(f'/image/{image_filename}')
        self.assertEqual(response.status_code, 200)

    def test_get_history(self):
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'Hello', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        response = self.client.get(f'/get_history/{chat_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('history', data)

    def test_clear_history(self):
        chat_id = self.create_chat()
        response = self.client.post('/send_message', json={'message': 'Hello', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
        response = self.client.get(f'/get_history/{chat_id}')
        self.assertNotEqual(response.get_json()['history'], [])
        response = self.client.get(f'/clear_history/{chat_id}')
        self.assertEqual(response.status_code, 200)
        response = self.client.get(f'/get_history/{chat_id}')
        self.assertEqual(response.get_json()['history'], [])

    def create_chat(self):
        response = self.client.post('/create_chat')
        data = response.get_json()
        return data['chat_id']

if __name__ == '__main__':
    unittest.main()