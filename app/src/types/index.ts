export interface EmailData {
  email: string;
  name?: string;
  [key: string]: string | undefined;
}

export interface EmailFormData {
  subject: string;
  body: string;
  isHtml: boolean;
  fromName: string;
  fromEmail: string;
}

export interface SendStatus {
  email: string;
  status: 'pending' | 'sending' | 'success' | 'error';
  message?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AppStep = 'upload' | 'review' | 'compose' | 'sending';
