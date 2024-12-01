import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, pipeline
from langchain.document_loaders import GitHubIssuesLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import logging

# Environment variables
ACCESS_TOKEN = os.getenv("YOUR_GITHUB_PERSONAL_TOKEN")
hf_token = os.getenv("HF_token")
# Load model function
def load_model(model="HuggingFaceH4/zephyr-7b-beta"):
    try:
        if not torch.cuda.is_available():
            return None, None , "GPU is not available, Rag only works with GPUs"
        model_name = model
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True, bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16
        )
        model = AutoModelForCausalLM.from_pretrained(model_name, quantization_config=bnb_config,use_auth_token=hf_token)
        tokenizer = AutoTokenizer.from_pretrained(model_name,use_auth_token=hf_token)
        return model, tokenizer
    except Exception as e:
        logging.error(f"Error loading RAG model: {e}")
        return None, None, "Failed to load the RAG model."

# GitHub loader function
def load_github_issues(repo, token):
    loader = GitHubIssuesLoader(repo=repo, access_token=token, include_prs=False, state="all")
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=30)
    chunked_docs = splitter.split_documents(docs)
    return chunked_docs

# Setup retriever function
def setup_retriever(chunked_docs, model="BAAI/bge-base-en-v1.5"):
    embeddings = HuggingFaceEmbeddings(model_name=model)
    db = FAISS.from_documents(chunked_docs, embeddings)
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})
    return retriever

# Create LLM chain
def create_llm_chain(model, tokenizer):
    text_generation_pipeline = pipeline(
        model=model,
        tokenizer=tokenizer,
        task="text-generation",
        temperature=0.2,
        do_sample=True,
        repetition_penalty=1.1,
        return_full_text=True,
        max_new_tokens=400,
    )
    llm = HuggingFacePipeline(pipeline=text_generation_pipeline)
    prompt_template = """
    <|system|>
    Answer the question based on your knowledge. Use the following context to help:

    {context}

    </s>
    <|user|>
    {question}
    </s>
    <|assistant|>

    """
    prompt = PromptTemplate(input_variables=["context", "question"], template=prompt_template)
    llm_chain = prompt | llm | StrOutputParser()
    return llm_chain

