# All-Chat
## the worlds first(probably) AI platform running on decentralized cloud

## Introducing All-Chat:
Your Ultimate AI-Powered Conversational Assistant for Text, Images, and Beyond

All-chat is a platform where users can intract with LLMs as agents with abblities like image generation and web search with APIs

## All-Chat features:
1. using Llama 3.1 model family with akash chat api
2. using model like llama, gemma, qwen, mistral and deepseek
3. using Image generation models like stable diffusion and FLUX
4. using Llama 3.2 vision text models
5. using the new Pixtral by mistral ai
6. using the new Marco-o1 by which is the open soruse equivalant of the openai's newst model family meaning O models
7. uses tavily api to perform web search and url fetching
8. uses yfinance to extract live stock market prices when asked to
9. has a simple calculator(on development)

## Overview
All-Chat is a comprehensive and multi-functional conversational AI platform designed to integrate state-of-the-art technologies and models into a unified, feature-rich solution. It offers advanced natural language processing (NLP), image generation, real-time web search, and retrieval capabilities, combining cutting-edge models like Whisper, Llama, Gemma, and Mistral with seamless APIs. Whether you’re exploring creative applications, conducting research, or developing robust solutions for complex problems, All-Chat delivers unparalleled functionality and innovation.

With its unique ability to handle text, images, and contextual data retrieval, All-Chat empowers developers, researchers, and end-users to interact in ways that were previously unimaginable. This project is open-source and designed to provide a scalable, efficient, and user-friendly experience.

## Key Features
### 1. Advanced Conversational AI Models
- **Whisper Family:** Leverage the power of Whisper models for state-of-the-art speech-to-text conversion. This enables transcription from voice inputs with exceptional accuracy and support for multiple languages.
- **Llama Family (via Akash API):** Harness the potential of Llama models for robust conversational AI that supports context-aware and multi-turn interactions. Its flexibility in managing dynamic discussions 
  enhances both productivity and engagement.
- **Gemma, Qwen, and Mistral Models:** Extend All-Chat’s capabilities to a global audience by integrating multilingual and culturally contextual conversational AI. These models provide superior support for a wide variety of languages and dialects.
- **Marco-O1 with Chain of Thought (CoT** Implement complex problem-solving with Marco-O1, which uses a step-by-step reasoning approach to address intricate challenges, ideal for educational and analytical use 
  cases.

### 2. Image Generation and Vision Capabilities
- **Stable Diffusion and Flux Models:** Create stunning, high-quality visuals using advanced text-to-image models. These models allow for highly creative and detailed outputs based on user prompts.
- **Pixtral:** Engage in visual conversations with Pixtral, a chat system that combines conversational AI with image generation. This feature is particularly suited for artists, designers, and educators.
- **Llama 3.2 Vision Models:** Incorporate advanced vision models for understanding and responding to image-based queries, enabling deeper interactions with visual data.

### 3. Web Search & Retrieval-Augmented Generation (RAG)
- **Tavily API:** Seamlessly integrate real-time web search into your conversational workflows. This feature fetches URLs and analyzes web content dynamically, allowing users to retrieve the latest information 
  effortlessly.
- **RAG App:** Leverage Retrieval-Augmented Generation to enhance information extraction from GitHub issue pages. This tool allows developers to integrate AI-driven insights directly into their repositories, 
  improving productivity and collaboration.

### 4. Financial Data Integration
- **YFinance API:** Query real-time financial data and generate reports or analyses. All-Chat integrates seamlessly with YFinance to deliver financial insights directly within the platform. Ideal for traders, 
  analysts, and educators in finance.

### 5. Custom Function Call Framework
All-Chat introduces a custom function call methodology that allows users to unify diverse capabilities, enabling seamless interaction between multiple models and APIs. This framework bridges text-based AI, image generation, and real-time data retrieval for a cohesive user experience.

### 6. Highly Extensible Open-Source Framework
Built for scalability, All-Chat is open-source, allowing developers to customize and extend its functionalities. The integration of popular libraries like PyTorch, Hugging Face Transformers, and Flask ensures compatibility and flexibility for diverse use cases.

## Tech Stack
### Backend
- **Python:** The backbone of our robust backend development.
- **PyTorch:** Powering the deep learning models for training and inference.
- **Hugging Face Transformers:** Offering the latest in natural language understanding and generation.
- **Diffusers:** High-performance library for image generation.
- **Tavily API:** For web search and URL fetching capabilities.
- **YFinance:** Integration for real-time financial data.
- **Flask:** Lightweight and efficient web framework for API deployment.
### Frontend
....


## Installation
- ### Prerequisites
Ensure you have the following installed:

1. Python >= 3.9
2. Node.js >= 16.x
3. Flask >= 2.x

**Clone the Repository**
```
git clone https://github.com/Mhdaw/All-chat.git  
cd all-chat  
```
**Backend Setup**

0. **Open The Backend Folder:**
```
cd backend
```
1. **Create a Virtual Environment:**
```
python -m venv venv  
source venv/bin/activate # On Windows, use `venv\Scripts\activate`  
```
2. **Install Dependencies:**
```
pip install -r requirements.txt  
```
3. **Run the Backend Server:**
```
python app.py  
```


**Frontend Setup**
1. **Navigate to the Frontend Directory:**
```
cd frontend
```
2. **Install Dependencies:**
```
npm install
```
3. **Build The App:**
```
npm run build
```
4. **Start the Development Server:**
```
npm start
```

### Usage Instructions
Access the platform at http://localhost:3000.
Explore various features, including:
Conversational AI for text, voice and image inputs.
Image generation with Stable Diffusion and Flux.
Real-time web search and data analysis.
Financial data insights using YFinance.


## Contribution Guidelines
We welcome contributions from the community! Here's how you can contribute:

Fork the repository.
Create a feature branch:
```
git checkout -b feature-name
```
Commit your changes and push them to your branch.
Submit a pull request with a detailed description of the changes.

## License
This project is licensed under the Apache License. Please refer to the LICENSE file for more details.

## Acknowledgments
We extend our deepest gratitude to:

**Open-source contributors** for creating tools and libraries that made All-Chat possible.
**Akash API, Tavily API, and YFinance** for their robust integration capabilities.
The global AI research community for pushing the boundaries of innovation.
Contact Us
For support, feedback, or collaboration opportunities, feel free to reach out:
📧 mahdi.seddigh05@gmail.com


## Future Path
All-Chat is at the cutting edge of conversational AI and image-generation technology, but this is only the beginning. Here's our vision for the future:

1. **Enhancing Model Diversity and Performance**
- Integration of Emerging Models: Continuously incorporate the latest advancements in AI models to enhance accuracy, multilingual capabilities, and context awareness.
- Fine-Tuning for Niche Use Cases: Expand functionality by fine-tuning existing models to serve specific industries like healthcare, education, and finance.
2. Advanced User Interactivity
- Real-Time Collaboration Features: Enable multi-user interactions within All-Chat, allowing teams to collaborate dynamically through AI-driven insights.
- Emotion-Aware Conversations: Develop models that recognize and adapt to user emotions, providing more empathetic and human-like responses.
3. Decentralized AI Evolution
- Increased Decentralized Cloud Usage: Broaden deployment capabilities to fully leverage decentralized cloud platforms for unparalleled scalability and resilience.
- Community-Led Model Development: Empower the global AI and decentralized computing communities to collaboratively design, test, and deploy custom models.
4. Scalable Multi-Modality
- Unified Multi-Modal Systems: Build deeper integrations between text, images, and other modalities, enabling seamless transitions and interactions across formats.
- Video Understanding and Generation: Expand capabilities into video processing for tasks like summarization, transcription, and creative generation.
5. Democratization of AI Access
- Open Ecosystem for Developers: Introduce APIs and SDKs for third-party developers to build on the All-Chat platform.
- Accessibility Enhancements: Optimize the platform for accessibility to ensure inclusivity across diverse demographics and technical expertise.
## Potential Impact
1. **Transforming AI and Decentralized Cloud Ecosystems**
All-Chat is probably the first AI platform hosted on a decentralized cloud, a revolutionary step that bridges AI innovation with decentralized technology. This advancement significantly reduces reliance on centralized infrastructure, making AI:

- **More Accessible:** Democratizes access to state-of-the-art AI tools for users worldwide, particularly in regions with limited centralized resources.
- **Highly Resilient:** Ensures robustness and uptime by eliminating single points of failure inherent in traditional cloud systems.
- **Cost-Efficient:** Reduces hosting costs, allowing businesses and developers to deploy solutions without prohibitive expenses.
2. **Impact on AI Communities**
- **Accelerated AI Development:** By merging cutting-edge AI models with decentralized hosting, All-Chat empowers researchers and developers to innovate rapidly and collaboratively.
- **Cross-Disciplinary Use Cases:** From healthcare to education and creative industries, All-Chat opens doors to AI-powered solutions for diverse applications.
- **Sustainability:** Decentralized hosting ensures energy-efficient scaling, reducing the carbon footprint compared to traditional cloud setups.
3. **Advancing Decentralized Ecosystems**
- **Boosting Decentralized Adoption:** By showcasing the capabilities of AI on decentralized platforms, All-Chat encourages adoption within the decentralized computing community.
- **Setting a New Standard:** Demonstrates the feasibility of high-performance AI in decentralized environments, paving the way for other applications to follow suit.
4. **Empowering End-Users and Developers**
- **Global Inclusion:** Enables seamless integration of multilingual AI models, breaking language barriers and fostering a more connected world.
- **Enhanced Creativity:** Features like Pixtral and Stable Diffusion empower creators to push the boundaries of art and design.
- **Developer-Centric Tools:** Offers developers a robust toolkit for creating custom AI-powered solutions across industries.
5. **Bridging AI and Blockchain Innovation**
As the first decentralized AI platform, All-Chat creates a synergistic link between the blockchain and AI worlds, showcasing the untapped potential of decentralized technologies in AI development and deployment.

All-Chat is not just an application—it’s a movement toward a future where AI is decentralized, accessible, scalable, and sustainable.

Help us in shaping the future of conversational AI with All-Chat!
