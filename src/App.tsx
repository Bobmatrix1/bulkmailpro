import React, { useState, useCallback } from 'react';
import { Mail, Upload, Users, Send, CheckCircle, X, Download } from 'lucide-react';
import type { EmailData, EmailFormData, AppStep, Toast } from '@/types';
import { UploadSection } from '@/sections/UploadSection';
import { ReviewSection } from '@/sections/ReviewSection';
import { ComposeSection } from '@/sections/ComposeSection';
import { SendingSection } from '@/sections/SendingSection';
import { useEmailSender } from '@/hooks/useEmailSender';

function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  React.useEffect(() => {
    const checkPlatform = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      
      const userAgent = window.navigator.userAgent.toLowerCase();
      const ios = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(ios);
    };
    
    checkPlatform();
    const handler = (e: any) => {
      e.preventDefault();
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setInstallPrompt(e);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  
  const { 
    sendEmails, 
    statuses, 
    isSending, 
    progress, 
    error: sendError,
    clearStatuses 
  } = useEmailSender();

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const handleEmailsLoaded = useCallback((loadedEmails: EmailData[]) => {
    setEmails(loadedEmails);
    setStep('review');
    addToast('success', `Loaded ${loadedEmails.length} email addresses`);
  }, [addToast]);

  const handleRemoveEmail = useCallback((email: string) => {
    setEmails(prev => prev.filter(e => e.email !== email));
  }, []);

  const handleAddEmail = useCallback((emailData: EmailData) => {
    let alreadyExists = false;
    setEmails(prev => {
      if (prev.some(e => e.email.toLowerCase() === emailData.email.toLowerCase())) {
        alreadyExists = true;
        return prev;
      }
      return [...prev, emailData];
    });

    if (alreadyExists) {
      addToast('error', 'This email is already in the list');
    } else {
      addToast('success', `Added ${emailData.email}`);
    }
  }, [addToast]);

  const handleClearEmails = useCallback(() => {
    setEmails([]);
    setStep('upload');
    addToast('info', 'All recipients removed');
  }, [addToast]);

  const handleSend = useCallback(async (formData: EmailFormData) => {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    
    if (!apiKey) {
      addToast('error', 'Resend API key is not configured in .env');
      return;
    }

    setStep('sending');
    try {
      await sendEmails(emails, formData, apiKey);
      const successCount = statuses.filter(s => s.status === 'success').length;
      if (successCount > 0) {
        addToast('success', `Successfully sent ${successCount} emails!`);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to send emails');
    }
  }, [emails, sendEmails, statuses, addToast]);

  const handleReset = useCallback(() => {
    setEmails([]);
    setStep('upload');
    clearStatuses();
  }, [clearStatuses]);

  const getStepIcon = (stepName: AppStep) => {
    switch (stepName) {
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'review':
        return <Users className="w-4 h-4" />;
      case 'compose':
        return <Mail className="w-4 h-4" />;
      case 'sending':
        return <Send className="w-4 h-4" />;
    }
  };

  const getStepLabel = (stepName: AppStep) => {
    switch (stepName) {
      case 'upload':
        return 'Upload';
      case 'review':
        return 'Review';
      case 'compose':
        return 'Compose';
      case 'sending':
        return 'Send';
    }
  };

  const steps: AppStep[] = ['upload', 'review', 'compose', 'sending'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="animated-bg" />
      
      {/* Main Content */}
      <div className="relative z-10 px-4 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="max-w-6xl mx-auto mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  BulkMail <span className="gradient-text">Pro</span>
                </h1>
                <p className="text-white/50 text-xs sm:text-sm">Powered by feel-flytech</p>
              </div>
            </div>
            
            {/* Install Prompt - Floating Top Right */}
            {(installPrompt || (isIOS && !isStandalone)) && (
              <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-500">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 border border-white/10 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:bounce" />
                  <span>Install App</span>
                </button>
              </div>
            )}

            {/* iOS Installation Instructions */}
            {isIOS && (
              <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-xs sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-indigo-400" />
                      Install on iOS
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      To install BulkMail Pro on your iPhone or iPad, follow these steps:
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-400">1</div>
                      <p className="text-sm text-white/80">
                        Tap the <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white"><Share className="w-3.5 h-3.5" /> Share</span> button in Safari.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-400">2</div>
                      <p className="text-sm text-white/80">
                        Scroll down and tap <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white"><PlusSquare className="w-3.5 h-3.5 mr-1" /> Add to Home Screen</span>.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setShowIOSInstructions(false)}
                      className="glass-button w-full py-3"
                    >
                      Got it
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Step Indicator */}
            <div className="flex items-center gap-1 sm:gap-2">
              {steps.map((s, index) => {
                const isActive = s === step;
                const isCompleted = index < currentStepIndex;
                const isClickable = index <= currentStepIndex && s !== 'sending';
                
                return (
                  <React.Fragment key={s}>
                    <button
                      onClick={() => isClickable && setStep(s)}
                      disabled={!isClickable}
                      className={`
                        flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' 
                          : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }
                        ${isClickable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        getStepIcon(s)
                      )}
                      <span className="hidden sm:inline">{getStepLabel(s)}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-4 sm:w-6 h-px transition-colors
                        ${index < currentStepIndex ? 'bg-green-500/50' : 'bg-white/10'}
                      `} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto">
          {step === 'upload' && (
            <UploadSection 
              onEmailsLoaded={handleEmailsLoaded}
              onManualStart={() => setStep('review')}
            />
          )}
          
          {step === 'review' && (
            <ReviewSection
              emails={emails}
              onBack={() => setStep('upload')}
              onContinue={() => setStep('compose')}
              onRemoveEmail={handleRemoveEmail}
              onAddEmail={handleAddEmail}
              onClearEmails={handleClearEmails}
            />
          )}
          
          {step === 'compose' && (
            <ComposeSection
              emailCount={emails.length}
              onBack={() => setStep('review')}
              onSend={handleSend}
              isSending={isSending}
            />
          )}
          
          {step === 'sending' && (
            <SendingSection
              statuses={statuses}
              progress={progress}
              isSending={isSending}
              error={sendError}
              onReset={handleReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto mt-12 sm:mt-16 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-white/40">
            <p>
              BulkMail Pro — A modern bulk email tool
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://resend.com/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                Resend API Docs
              </a>
              <span className="hidden sm:inline">•</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              toast flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              ${toast.type === 'success' 
                ? 'bg-green-500/90 text-white border border-green-400/50' 
                : toast.type === 'error'
                  ? 'bg-red-500/90 text-white border border-red-400/50'
                  : 'bg-indigo-500/90 text-white border border-indigo-400/50'
              }
              backdrop-blur-lg
            `}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : toast.type === 'error' ? (
              <X className="w-5 h-5" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
