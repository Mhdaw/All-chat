import requests
import json

def test_chat_backend():
    # Base URL of your Flask application
    BASE_URL = 'http://localhost:8080'
    
    # Test sending a message
    def send_message(message, conversation_id='test_convo'):
        url = f'{BASE_URL}/send_message'
        payload = {
            'message': message,
            'conversation_id': conversation_id
        }
        response = requests.post(url, json=payload)
        return response.json()
    
    def get_history(conversation_id='test_convo'):
        url = f'{BASE_URL}/get_history/{conversation_id}'
        response = requests.get(url)
        return response.json()
    
    def clear_history(conversation_id='test_convo'):
        url = f'{BASE_URL}/clear_history/{conversation_id}'
        response = requests.get(url)
        return response.json()

    try:
        print("Clearing history...")
        clear_result = clear_history()
        print(f"Clear result: {json.dumps(clear_result, indent=2)}\n")

        # Send a test message
        print("Sending test message...")
        message_result = send_message("Hello, can you help me with Python programming?")
        print(f"Assistant's response: {json.dumps(message_result, indent=2)}\n")

        # Get conversation history
        print("Getting conversation history...")
        history_result = get_history()
        print(f"Conversation history: {json.dumps(history_result, indent=2)}\n")

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure your Flask app is running on port 8080.")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    test_chat_backend()
