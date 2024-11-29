import os
import json
import logging


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