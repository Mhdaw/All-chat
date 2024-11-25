export interface Message {
    id?:string;
    content?:string;
    createdAt?:Date,
    role?:"user" | "data" | "system"
  }

export  type JSONValue = null | string | number | boolean | {
    [value: string]: JSONValue;
} | Array<JSONValue>