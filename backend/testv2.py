import unittest
from app import ChatService, conversations, chat_metadata
import uuid
import json

class TestChatService(unittest.TestCase):
    def setUp(self):
        # Initialize the ChatService
        self.chat_service = ChatService()
        self.conversation_id = str(uuid.uuid4())
        conversations[self.conversation_id] = []
        self.chat_service.image_model = "test_image_model"  # Ensure image_model is set

    def test_get_stock_price(self):
        response = self.chat_service.get_stock_price("AAPL")
        self.assertIn("current_price", response)
        self.assertIn("company_name", response)
        self.assertIn("currency", response)

    def test_calculate(self):
        response = self.chat_service.calculate("100 * 0.15")
        self.assertEqual(response["result"], 15.0)

    def test_generate_image(self, mock_generate_image_func):
        mock_generate_image_func.return_value = ("path/to/image.png", "image123")
        response = self.chat_service.generate_image("A beautiful sunset over the ocean")
        self.assertIn("image_path", response)
        self.assertIn("image_id", response)

    def test_execute_function(self):
        response = self.chat_service.execute_function("FUNCTION_CALL: get_stock_price(\"AAPL\")")
        self.assertIn("current_price", json.loads(response))
        self.assertIn("company_name", json.loads(response))
        self.assertIn("currency", json.loads(response))

    def test_get_response(self):
        text_response, audio_filename = self.chat_service.get_response(self.conversation_id, "Hello", model="Meta-Llama-3-1-8B-Instruct-FP8")
        self.assertIsNotNone(text_response)
        self.assertIn(self.conversation_id, conversations)

    def tearDown(self):
        # Clear the conversation after each test
        if self.conversation_id in conversations:
            del conversations[self.conversation_id]

if __name__ == '__main__':
    unittest.main()