import { useState, useCallback } from 'react';
import type { EmailData, EmailFormData, SendStatus } from '@/types';

interface UseEmailSenderReturn {
  sendEmails: (emails: EmailData[], formData: EmailFormData, apiKey: string) => Promise<void>;
  statuses: SendStatus[];
  isSending: boolean;
  progress: number;
  error: string | null;
  clearStatuses: () => void;
}

export function useEmailSender(): UseEmailSenderReturn {
  const [statuses, setStatuses] = useState<SendStatus[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearStatuses = useCallback(() => {
    setStatuses([]);
    setProgress(0);
    setError(null);
  }, []);

  const sendSingleEmail = async (
    emailData: EmailData,
    formData: EmailFormData,
    apiKey: string
  ): Promise<SendStatus> => {
    try {
      const response = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${formData.fromName} <${formData.fromEmail}>`,
          to: emailData.email,
          subject: formData.subject,
          [formData.isHtml ? 'html' : 'text']: formData.body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return {
        email: emailData.email,
        status: 'success',
      };
    } catch (err) {
      return {
        email: emailData.email,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  };

  const sendEmails = useCallback(async (
    emails: EmailData[],
    formData: EmailFormData,
    apiKey: string
  ): Promise<void> => {
    setIsSending(true);
    setError(null);
    setProgress(0);

    // Initialize statuses
    const initialStatuses = emails.map(e => ({ email: e.email, status: 'pending' as const }));
    setStatuses(initialStatuses);

    // Validate API key
    if (!apiKey.trim()) {
      setError('Please enter your Resend API key');
      setIsSending(false);
      return;
    }

    // Validate form data
    if (!formData.subject.trim()) {
      setError('Please enter an email subject');
      setIsSending(false);
      return;
    }

    if (!formData.body.trim()) {
      setError('Please enter an email body');
      setIsSending(false);
      return;
    }

    if (!formData.fromEmail.trim()) {
      setError('Please enter a from email address');
      setIsSending(false);
      return;
    }

    // Send emails with rate limiting (2 per second for Resend free tier)
    const results: SendStatus[] = [];
    const rateLimitDelay = 500; // 500ms between requests

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      // Update status to sending
      setStatuses(prev => 
        prev.map(s => s.email === email.email ? { ...s, status: 'sending' } : s)
      );

      // Send the email
      const result = await sendSingleEmail(email, formData, apiKey);
      results.push(result);

      // Update status
      setStatuses(prev => 
        prev.map(s => s.email === email.email ? result : s)
      );

      // Update progress
      setProgress(Math.round(((i + 1) / emails.length) * 100));

      // Rate limiting delay (except for last email)
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
      }
    }

    setIsSending(false);

    // Check if any failed
    const failedCount = results.filter(r => r.status === 'error').length;
    if (failedCount > 0) {
      setError(`${failedCount} email(s) failed to send`);
    }
  }, []);

  return {
    sendEmails,
    statuses,
    isSending,
    progress,
    error,
    clearStatuses,
  };
}
