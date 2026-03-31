import * as React from 'react';
import { Users, Search, Trash2, ArrowLeft, ArrowRight, Mail, User, Plus, X } from 'lucide-react';
import type { EmailData } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReviewSectionProps {
  emails: EmailData[];
  onBack: () => void;
  onContinue: () => void;
  onRemoveEmail: (email: string) => void;
  onAddEmail: (emailData: EmailData) => void;
  onClearEmails: () => void;
}

export function ReviewSection({ 
  emails, 
  onBack, 
  onContinue, 
  onRemoveEmail,
  onAddEmail,
  onClearEmails
}: ReviewSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newName, setNewName] = React.useState('');

  const filteredEmails = React.useMemo(() => {
    if (!searchQuery.trim()) return emails;
    const query = searchQuery.toLowerCase();
    return emails.filter(e => 
      e.email.toLowerCase().includes(query) ||
      e.name?.toLowerCase().includes(query)
    );
  }, [emails, searchQuery]);

  const handleAddEmail = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    
    onAddEmail({
      email: newEmail.trim(),
      name: newName.trim() || undefined
    });
    
    setNewEmail('');
    setNewName('');
    setShowAddForm(false);
  }, [newEmail, newName, onAddEmail]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">Review Recipients</span>
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-white/60 text-sm">
              {emails.length} email{emails.length !== 1 ? 's' : ''} ready to send
            </p>
            {emails.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-red-400/60 hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      This will remove all {emails.length} recipients and return you to the upload step. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onClearEmails}
                      className="bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className="glass-button-secondary px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="sm:inline text-[10px] sm:text-sm uppercase font-bold tracking-widest opacity-60">Back</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm rounded-xl transition-all duration-300 border ${
              showAddForm 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="font-bold uppercase tracking-widest text-[10px] sm:text-sm">
              {showAddForm ? 'Cancel' : 'Add Recipient'}
            </span>
          </button>
          <button
            onClick={onContinue}
            disabled={emails.length === 0}
            className="glass-button px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-bold uppercase tracking-widest text-[10px] sm:text-sm">Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card-strong p-6 mb-6 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Email Address</label>
              <input
                type="email"
                required
                placeholder="recipient@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="glass-input w-full px-4 py-2"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Name (Optional)</label>
              <input
                type="text"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="glass-input w-full px-4 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="glass-button w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card-strong p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search emails or names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-3"
          />
        </div>
      </div>

      <div className="glass-card-strong overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-medium">Email List</span>
          </div>
          <span className="text-white/50 text-sm">
            {filteredEmails.length} of {emails.length} shown
          </span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No emails match your search</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredEmails.map((emailData, index) => (
                <div
                  key={emailData.email}
                  className="email-item p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-indigo-300">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="text-white truncate">{emailData.email}</span>
                    </div>
                    {emailData.name && (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <span className="text-white/50 text-sm truncate">{emailData.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                        aria-label={`Remove ${emailData.email}`}
                      >
                        <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Recipient?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          Are you sure you want to remove <span className="text-white font-medium">{emailData.email}</span> from the list?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onRemoveEmail(emailData.email)}
                          className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>{emails.length} valid</span>
          </div>
        </div>
        
        <button
          onClick={onContinue}
          className="glass-button px-6 py-3 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          Compose Email
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
