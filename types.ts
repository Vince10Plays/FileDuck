export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string; // Base64
}

export interface User {
  email: string;
  name: string;
}

export type AuthMode = 'signin' | 'signup' | 'forgot-password';

export interface ChatSession {
  id: string;
  messages: Message[];
}