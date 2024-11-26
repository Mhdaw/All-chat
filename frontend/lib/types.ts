export interface Message {
    id?:string;
    content?:string;
    createdAt?:Date;
    role?:"user" | "data" | "system"|"assistant";
    audio_url?: string;
  }

export  type JSONValue = null | string | number | boolean | {
    [value: string]: JSONValue;
} | Array<JSONValue>