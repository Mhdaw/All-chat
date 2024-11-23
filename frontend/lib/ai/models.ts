// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-nano',
    label: 'Gemini Nano',
    apiIdentifier: 'gemini-nano',
    description: 'Efficient, on-device AI model for mobile and edge devices',
  },
  {
    id: 'gemini-pro',
    label: 'Gemini Pro',
    apiIdentifier: 'gemini-pro',
    description: 'Advanced model for complex reasoning and multi-turn conversations',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-nano';