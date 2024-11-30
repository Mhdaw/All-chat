import unittest
import requests
import json
import uuid
from app import app, conversations, chat_metadata

class TestApp(unittest.TestCase):
    def setUp(self):
        # Set up the test client
        self.client = app.test_client()
        self.conversation_id = str(uuid.uuid4())

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
        with open('/workspaces/llama_chatbot/backend/Leonard Cohen - Happens to the Heart.webm', 'wb') as f:
            f.write(b'fake audio data')
        with open('/workspaces/llama_chatbot/backend/Leonard Cohen - Happens to the Heart.webm', 'rb') as f:
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
        response = self.client.post('/send_message', json={'message': 'hello, Generate an image about "A beautiful sunset over the ocean', 'conversation_id': chat_id, 'model': 'Meta-Llama-3-1-8B-Instruct-FP8'})
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

    def tearDown(self):
        # Clear the conversation after each test
        if self.conversation_id in conversations:
            del conversations[self.conversation_id]
        if self.conversation_id in chat_metadata:
            del chat_metadata[self.conversation_id]

if __name__ == '__main__':
    unittest.main()