import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  ToolInvocation,
} from 'ai';
import { Message } from './types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Message as DBMessage, Document } from '@/lib/db/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAIN_URL="https://effective-acorn-p6jqqxqjp46frwr6-8080.app.github.dev"
//"https://4k20j2qo5lepbajk0dkglrg0hg.ingress.akashprovid.com"
// https://4k20j2qo5lepbajk0dkglrg0hg.ingress.akashprovid.com/

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(`${MAIN_URL}/send_message`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: "message",
        conversation_id: "currentChatId"
    })
})

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    return message;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
    });

    return chatMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {
  const toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true,
    );

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== "data") return message;


    const toolResultIds: Array<string> = []

    return {
      ...message,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content!.length > 0 
  );
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

["Meta-Llama-3-1-8B-Instruct-FP8","Meta-Llama-3-1-405B-Instruct-FP8","Meta-Llama-3-2-3B-Instruct","nvidia-Llama-3-1-Nemotron-70B-Instruct-HF"]


export const models = [
  
  {
    "id": 101,
    "label": "Meta Llama 3.2 1B",
    "apiidentifier": "Meta-Llama-3-1-8B-Instruct-FP8",
    "description": "A smaller version of Meta Llama 3.1 with 8B parameters, good for general language generation."
  },
  {
    "id": 102,
    "label": "Meta Llama 3.2 1B",
    "apiidentifier": "Meta-Llama-3-1-405B-Instruct-FP8",
    "description": "A smaller version of Meta Llama 3.1  with 405b parameters, good for general language generation."
  },
  {
    "id": 1,
    "label": "Meta Llama 3.2 3B ",
    "apiidentifier": "Meta-Llama-3-2-3B-Instruct",
    "description": "A smaller version of Llama 3.2 with 3B parameters, good for general language generation."
  },
  {
    "id": 2,
    "label": "nvidia-Llama 3.1 Nemotron",
    "apiidentifier": "nvidia-Llama-3-1-Nemotron-70B-Instruct-HF",
    "description": "A medium-size nvidia-Llama 3.1 model with Nemotron 70b parameters, suitable for a range of tasks."
  },
  {

    "id": 3,
    "label": "Meta Llama 3.2 1B Instruct",
    "apiidentifier": "Meta-Llama/Llama-3.2-1B-Instruct",
    "description": "Instruction-tuned variant of Llama 3.2 with 1B parameters for following specific tasks."
  },
  {
    "id": 4,
    "label": "Meta Llama 3.2 3B Instruct",
    "apiidentifier": "Meta-Llama/Llama-3.2-3B-Instruct",
    "description": "Instruction-tuned Llama 3.2 with 3B parameters for better task-oriented responses."
  },
  {
    "id": 5,
    "label": "Meta Llama 3.1 8B",
    "apiidentifier": "Meta-Llama/Llama-3.1-8B",
    "description": "A larger Llama 3.1 model with 8B parameters for advanced language tasks."
  },
  {
    "id": 6,
    "label": "Meta Llama 3.1 70B",
    "apiidentifier": "Meta-Llama/Llama-3.1-70B",
    "description": "A large-scale Llama 3.1 model with 70B parameters, powerful for complex tasks."
  },
  {
    "id": 7,
    "label": "Meta Llama 3.1 405B",
    "apiidentifier": "Meta-Llama/Llama-3.1-405B",
    "description": "Very large Llama 3.1 model with 405B parameters, designed for cutting-edge research."
  },
  {
    "id": 8,
    "label": "Meta Llama 3.1 8B Instruct",
    "apiidentifier": "Meta-Llama/Llama-3.1-8B-Instruct",
    "description": "Instruction-tuned variant of Llama 3.1 with 8B parameters for improved task-specific tasks."
  },
  {
    "id": 9,
    "label": "Meta Llama 3.1 70B Instruct",
    "apiidentifier": "Meta-Llama/Llama-3.1-70B-Instruct",
    "description": "Llama 3.1 70B, fine-tuned for instruction following tasks and complex problem-solving."
  },
  {
    "id": 10,
    "label": "Meta Llama 3.1 405B Instruct",
    "apiidentifier": "Meta-Llama/Llama-3.1-405B-Instruct",
    "description": "Instruction-tuned version of the massive 405B Llama 3.1, optimized for task completion."
  },
  {
    "id": 11,
    "label": "Qwen 32B Preview",
    "apiidentifier": "Qwen/QwQ-32B-Preview",
    "description": "A preview model with 32B parameters from Qwen, potentially for complex language tasks."
  },
  {
    "id": 12,
    "label": "Qwen 2.5 Coder 32B",
    "apiidentifier": "Qwen/Qwen2.5-Coder-32B",
    "description": "32B model from Qwen focused on coding tasks and programming-related challenges."
  },
  {
    "id": 13,
    "label": "Qwen 2.5 Coder 14B",
    "apiidentifier": "Qwen/Qwen2.5-Coder-14B",
    "description": "14B version of Qwen 2.5, optimized for code generation and programming applications."
  },
  {
    "id": 14,
    "label": "Qwen 2.5 Coder 14B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-Coder-14B-Instruct",
    "description": "Instruction-tuned 14B model from Qwen 2.5, specialized for coding tasks with instructions."
  },
  {
    "id": 15,
    "label": "Qwen 2.5 Coder 32B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-Coder-32B-Instruct",
    "description": "Instruction-tuned 32B Qwen model for coding-related tasks with detailed instructions."
  },
  {
    "id": 16,
    "label": "Qwen 2.5 0.5B",
    "apiidentifier": "Qwen/Qwen2.5-0.5B",
    "description": "Smallest Qwen 2.5 model with 0.5B parameters, suitable for lightweight language tasks."
  },
  {
    "id": 17,
    "label": "Qwen 2.5 1.5B",
    "apiidentifier": "Qwen/Qwen2.5-1.5B",
    "description": "1.5B version of Qwen 2.5, good for general NLP tasks requiring a balance of performance."
  },
  {
    "id": 18,
    "label": "Qwen 2.5 1.5B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-1.5B-Instruct",
    "description": "Instruction-following 1.5B Qwen model tailored for specific task completion."
  },
  {
    "id": 19,
    "label": "Qwen 2.5 0.5B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-0.5B-Instruct",
    "description": "Instruction-tuned 0.5B Qwen model, ideal for simple tasks with basic instructions."
  },
  {
    "id": 20,
    "label": "Qwen 2.5 7B",
    "apiidentifier": "Qwen/Qwen2.5-7B",
    "description": "A mid-size model with 7B parameters, suitable for general NLP tasks and more complex tasks."
  },
  {
    "id": 21,
    "label": "Qwen 2.5 7B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-7B-Instruct",
    "description": "Instruction-following variant of Qwen 2.5 with 7B parameters."
  },
  {
    "id": 22,
    "label": "Qwen 2.5 14B",
    "apiidentifier": "Qwen/Qwen2.5-14B",
    "description": "14B model for advanced NLP and contextual tasks requiring deeper understanding."
  },
  {
    "id": 23,
    "label": "Qwen 2.5 14B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-14B-Instruct",
    "description": "Instruction-tuned version of Qwen 2.5 with 14B parameters for detailed task performance."
  },
  {
    "id": 24,
    "label": "Qwen 2.5 32B",
    "apiidentifier": "Qwen/Qwen2.5-32B",
    "description": "32B model designed for high-performance NLP tasks and complex conversational applications."
  },
  {
    "id": 25,
    "label": "Qwen 2.5 32B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-32B-Instruct",
    "description": "Instruction-following 32B model from Qwen 2.5 for highly specific tasks."
  },
  {
    "id": 26,
    "label": "Qwen 2.5 72B",
    "apiidentifier": "Qwen/Qwen2.5-72B",
    "description": "A very large 72B model for advanced conversational and context-based tasks."
  },
  {
    "id": 27,
    "label": "Qwen 2.5 72B Instruct",
    "apiidentifier": "Qwen/Qwen2.5-72B-Instruct",
    "description": "Instruction-tuned 72B model for complex task execution and highly nuanced dialogues."
  },
  {
    "id": 28,
    "label": "Microsoft Phi 3.5 Mini Instruct",
    "apiidentifier": "microsoft/Phi-3.5-mini-instruct",
    "description": "Small Phi model with 3.5B parameters optimized for instruction-following tasks."
  },
  {
    "id": 29,
    "label": "Microsoft Phi 3.5 MoE Instruct",
    "apiidentifier": "microsoft/Phi-3.5-MoE-instruct",
    "description": "Mixture-of-Experts (MoE) Phi model with 3.5B parameters, optimized for instruction-based tasks."
  },
  {
    "id": 30,
    "label": "DeepSeek V2 Chat",
    "apiidentifier": "deepseek-ai/DeepSeek-V2-Chat",
    "description": "DeepSeek's V2 chat-focused model for conversational AI applications."
  },
  {
    "id": 31,
    "label": "DeepSeek V2",
    "apiidentifier": "deepseek-ai/DeepSeek-V2",
    "description": "General-purpose model from DeepSeek for various NLP tasks."
  },
  {
    "id": 32,
    "label": "DeepSeek V2 Lite",
    "apiidentifier": "deepseek-ai/DeepSeek-V2-Lite",
    "description": "Lightweight version of DeepSeek V2 for resource-constrained environments."
  },
  {
    "id": 33,
    "label": "DeepSeek V2 Lite Chat",
    "apiidentifier": "deepseek-ai/DeepSeek-V2-Lite-Chat",
    "description": "Chat-optimized Lite version of DeepSeek V2."
  },
  {
    "id": 34,
    "label": "DeepSeek V2.5",
    "apiidentifier": "deepseek-ai/DeepSeek-V2.5",
    "description": "Improved version of DeepSeek V2 for more advanced conversational and task completion capabilities."
  }
];