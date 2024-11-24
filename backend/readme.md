testing the backend:
1. make sure that the app.py is running by python app.py
2. then use the python test_chat.py
3. or use: curl -X POST http://localhost:8080/send_message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me with Python programming?", "conversation_id": "test_convo"}

4. this will help you test the backend
