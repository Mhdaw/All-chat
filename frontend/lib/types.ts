export interface Message {
    id?:string;
    content?:string;
    createdAt?:Date;
    role?:"user" | "data" | "system"|"assistant";
    audio_url?: string;
    audio_file?:string
  }

export  type JSONValue = null | string | number | boolean | {
    [value: string]: JSONValue;
} | Array<JSONValue>

export interface Attachment {

  name?: string;

  contentType?: string;

  url: string;
}