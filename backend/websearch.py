import os
from tavily import TavilyClient
import logging

api = "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" or os.getenv("TAVILY_API_KEY")
print(f"api:{api}")
tavily_client = TavilyClient(api_key=api)


def get_answer_from_tavily(query):
    """ This function gets query as str and passes the extracted answer as str"""
    try:
        answer = tavily_client.qna_search(query=query)
        # Assuming the response has an 'answer' key
        return answer
    except Exception as e:
        logging.error(f"Error fetching answer from Tavily: {e}")
        return f"Error fetching answer: {str(e)}"
    
def fetch_url(urls):
    """ this function fetches the user url and returns the extracted content"""
    try:
        extract_response = tavily_client.extract(urls=urls)
        for result in extract_response.get("results", []):
            return result["url"], result["raw_content"]
        return "No results found", "No content found"
    except Exception as e:
        logging.error(f"Error fetching URL content: {e}")
        return f"Error fetching URL: {str(e)}", f"Error fetching content: {str(e)}"
