import React, { useState } from 'react';
import { ArrowLeft, Send, Code, Type, Key, User, Mail, Eye, EyeOff, FileText, X } from 'lucide-react';
import type { EmailFormData } from '@/types';

interface ComposeSectionProps {
  emailCount: number;
  onBack: () => void;
  onSend: (formData: EmailFormData) => void;
  isSending: boolean;
}

export function ComposeSection({ emailCount, onBack, onSend, isSending }: ComposeSectionProps) {
  const [formData, setFormData] = useState<EmailFormData>({
    subject: '',
    body: '',
    isHtml: false,
    fromName: '',
    fromEmail: 'john@studentprenuer.site',
  });
  
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(formData);
  };

  const isDomainValid = formData.fromEmail.endsWith('@studentprenuer.site');
  const isValid = 
    formData.subject.trim() &&
    formData.body.trim() &&
    formData.fromEmail.trim() &&
    isDomainValid;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">Compose Email</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Sending to {emailCount} recipient{emailCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="glass-button-secondary px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Back</span>
          <span className="inline xs:hidden">List</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Configuration Note */}
        <div className="glass-card-strong p-4 sm:p-6 border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">API Configured</h3>
              <p className="text-white/50 text-xs">Using Resend API key from environment configuration.</p>
            </div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="glass-card-strong p-4 sm:p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Sender Information
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">
                From Name
              </label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                placeholder="Your Name or Company"
                className="glass-input w-full py-3"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/70 text-sm">
                  From Email <span className="text-red-400">*</span>
                </label>
                {isDomainValid && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-bold uppercase tracking-wider">
                    Verified Domain
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  placeholder="john@studentprenuer.site"
                  className={`glass-input w-full pl-10 py-3 ${!isDomainValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
                />
              </div>
              {!isDomainValid && (
                <p className="text-red-400 text-[10px] mt-1.5 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Must end with @studentprenuer.site
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="glass-card-strong p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Email Content
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isHtml: false })}
                className={`
                  px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all
                  ${!formData.isHtml 
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' 
                    : 'text-white/50 hover:bg-white/5'}
                `}
              >
                <Type className="w-4 h-4" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isHtml: true })}
                className={`
                  px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all
                  ${formData.isHtml 
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' 
                    : 'text-white/50 hover:bg-white/5'}
                `}
              >
                <Code className="w-4 h-4" />
                HTML
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject..."
                className="glass-input w-full py-3"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">
                  Body <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder={formData.isHtml 
                  ? '<h1>Hello!</h1><p>Your HTML content here...</p>' 
                  : 'Enter your message here...'}
                rows={8}
                className="glass-input w-full resize-none font-mono text-sm"
              />
              
              {formData.isHtml && (
                <p className="text-white/40 text-xs mt-2">
                  HTML content will be rendered in email clients that support it.
                </p>
              )}
              
              {showPreview && formData.body && (
                <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-3">Preview</p>
                  <div className="bg-white rounded-md p-4 overflow-x-auto">
                    {formData.isHtml ? (
                      <div 
                        className="prose prose-sm max-w-none break-words text-slate-900 [&_img]:max-w-full [&_img]:h-auto"
                        dangerouslySetInnerHTML={{ __html: formData.body }}
                      />
                    ) : (
                      <pre className="text-slate-800 text-sm whitespace-pre-wrap font-sans break-words">
                        {formData.body}
                      </pre>
                    )}
                  </div>
                  {formData.isHtml && formData.body.includes('<img') && (
                    <p className="mt-2 text-[10px] text-white/30 italic">
                      Note: Some images may not load in preview if they use external or inactive domains.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/50">
            <p>Ready to send to {emailCount} recipient{emailCount !== 1 ? 's' : ''}</p>
          </div>
          
          <button
            type="submit"
            disabled={!isValid || isSending}
            className="glass-button px-8 py-4 flex items-center gap-3 text-base w-full sm:w-auto justify-center disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="spinner" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Emails
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
