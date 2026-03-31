import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import type { EmailData } from '@/types';

interface UseCSVParserReturn {
  parseCSV: (file: File) => Promise<EmailData[]>;
  isParsing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCSVParser(): UseCSVParserReturn {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const parseCSV = useCallback(async (file: File): Promise<EmailData[]> => {
    setIsParsing(true);
    setError(null);

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsParsing(false);
          
          if (results.errors.length > 0 && results.data.length === 0) {
            const errorMsg = results.errors[0].message || 'Failed to parse CSV';
            setError(errorMsg);
            reject(new Error(errorMsg));
            return;
          }

          // Extract email addresses from the parsed data
          const data = results.data as Record<string, string>[];
          const emails: EmailData[] = [];
          const seenEmails = new Set<string>();

          data.forEach((row) => {
            // Look for email column (common variations)
            const emailKey = Object.keys(row).find(key => 
              key.toLowerCase().includes('email') || 
              key.toLowerCase() === 'e-mail' ||
              key.toLowerCase() === 'mail'
            );

            // Look for name column
            const nameKey = Object.keys(row).find(key => 
              key.toLowerCase().includes('name') || 
              key.toLowerCase() === 'first name' ||
              key.toLowerCase() === 'firstname' ||
              key.toLowerCase() === 'full name' ||
              key.toLowerCase() === 'fullname'
            );

            const email = emailKey ? row[emailKey]?.trim() : null;
            const name = nameKey ? row[nameKey]?.trim() : undefined;

            if (email && email.includes('@') && !seenEmails.has(email.toLowerCase())) {
              seenEmails.add(email.toLowerCase());
              emails.push({ email, name, ...row });
            }
          });

          if (emails.length === 0) {
            // Try to find any column that looks like an email
            data.forEach((row) => {
              Object.values(row).forEach((value) => {
                const trimmedValue = value?.trim();
                if (trimmedValue && 
                    trimmedValue.includes('@') && 
                    trimmedValue.includes('.') &&
                    !seenEmails.has(trimmedValue.toLowerCase())) {
                  seenEmails.add(trimmedValue.toLowerCase());
                  emails.push({ email: trimmedValue });
                }
              });
            });
          }

          if (emails.length === 0) {
            const errorMsg = 'No valid email addresses found in the CSV file';
            setError(errorMsg);
            reject(new Error(errorMsg));
            return;
          }

          resolve(emails);
        },
        error: (err) => {
          setIsParsing(false);
          const errorMsg = err.message || 'Failed to parse CSV file';
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    });
  }, []);

  return { parseCSV, isParsing, error, clearError };
}
