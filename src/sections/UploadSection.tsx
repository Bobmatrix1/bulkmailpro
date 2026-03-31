import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Check, Plus } from 'lucide-react';
import type { EmailData } from '@/types';
import { useCSVParser } from '@/hooks/useCSVParser';

interface UploadSectionProps {
  onEmailsLoaded: (emails: EmailData[]) => void;
  onManualStart: () => void;
}

export function UploadSection({ onEmailsLoaded, onManualStart }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseCSV, isParsing, error, clearError } = useCSVParser();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      return;
    }
    
    setFile(file);
    clearError();
    
    try {
      const emails = await parseCSV(file);
      onEmailsLoaded(emails);
    } catch {
      // Error is handled in the hook
    }
  }, [parseCSV, onEmailsLoaded, clearError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearError]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          <span className="gradient-text">Upload Your CSV</span>
        </h2>
        <p className="text-white/60 text-sm sm:text-base">
          Drag and drop your CSV file containing email addresses, or click to browse
        </p>
      </div>

      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            upload-zone p-8 sm:p-12 cursor-pointer
            flex flex-col items-center justify-center gap-4
            transition-all duration-300
            ${isDragOver ? 'drag-over scale-[1.02]' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className={`
            w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
            flex items-center justify-center
            bg-gradient-to-br from-indigo-500/20 to-purple-500/20
            border border-indigo-500/30
            transition-transform duration-300
            ${isDragOver ? 'scale-110' : ''}
          `}>
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium mb-1">
              {isDragOver ? 'Drop your file here' : 'Click or drag CSV file here'}
            </p>
            <p className="text-white/40 text-sm">
              Supports .csv files with email column
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <FileSpreadsheet className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-xs">Maximum file size: 10MB</span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-4 w-full px-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManualStart();
              }}
              className="glass-button-secondary px-6 py-2.5 flex items-center gap-2 text-sm hover:text-indigo-300 transition-all border-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Recipients Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card-strong p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              {isParsing ? (
                <div className="spinner" />
              ) : error ? (
                <X className="w-6 h-6 text-red-400" />
              ) : (
                <Check className="w-6 h-6 text-green-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{file.name}</p>
              <p className="text-white/50 text-sm">
                {(file.size / 1024).toFixed(1)} KB
                {isParsing && ' • Parsing...'}
              </p>
            </div>
            
            {!isParsing && (
              <button
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 glass-card p-4 sm:p-6 overflow-hidden">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          CSV Format Guide
        </h3>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-white/50 mb-2 text-[10px] uppercase font-bold tracking-wider">Supported columns</p>
              <ul className="space-y-1.5 text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="truncate">email, e-mail, mail</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="truncate">name, firstname, full name</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="min-w-0">
            <p className="text-white/50 mb-2 text-[10px] uppercase font-bold tracking-wider">Example CSV</p>
            <div className="relative">
              <code className="text-[10px] sm:text-xs text-white/60 bg-black/40 p-3 rounded-lg block overflow-x-auto whitespace-pre font-mono border border-white/10 w-full">
email,name
user@test.com,Name</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
