import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, RotateCcw, Mail, AlertCircle, Info } from 'lucide-react';
import type { SendStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SendingSectionProps {
  statuses: SendStatus[];
  progress: number;
  isSending: boolean;
  error: string | null;
  onReset: () => void;
}

export function SendingSection({ statuses, progress, isSending, error, onReset }: SendingSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<SendStatus | null>(null);

  const successCount = statuses.filter(s => s.status === 'success').length;
  const errorCount = statuses.filter(s => s.status === 'error').length;
  const pendingCount = statuses.filter(s => s.status === 'pending' || s.status === 'sending').length;

  const getStatusIcon = (status: SendStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'sending':
        return <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-white/30" />;
    }
  };

  const getStatusBadge = (status: SendStatus['status']) => {
    switch (status) {
      case 'success':
        return <span className="badge badge-success">Sent</span>;
      case 'error':
        return <span className="badge badge-error">Failed</span>;
      case 'sending':
        return <span className="badge badge-pending">Sending...</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  const allComplete = !isSending && statuses.length > 0 && pendingCount === 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          <span className="gradient-text">
            {allComplete ? 'Sending Complete!' : 'Sending Emails...'}
          </span>
        </h2>
        <p className="text-white/60 text-sm">
          {allComplete 
            ? `Successfully sent ${successCount} of ${statuses.length} emails`
            : 'Please wait while we send your emails'
          }
        </p>
      </div>

      {/* Progress Overview */}
      <div className="glass-card-strong p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium">Progress</span>
          <span className="text-white/70">{progress}%</span>
        </div>
        
        <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <div className="text-xs text-green-400/70 uppercase tracking-wider font-semibold">Success</div>
            <div className="text-2xl font-bold text-green-400">{successCount}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <div className="text-xs text-red-400/70 uppercase tracking-wider font-semibold">Failed</div>
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <div className="text-xs text-yellow-400/70 uppercase tracking-wider font-semibold">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Status List */}
      <div className="glass-card-strong overflow-hidden mb-6">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-medium">Status Details</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest hidden sm:inline">
              Click failed items for details
            </span>
            <span className="text-white/50 text-sm">
              {statuses.length} total
            </span>
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {statuses.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-white/50">Preparing to send...</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {statuses.map((status) => (
                <div
                  key={status.email}
                  onClick={() => status.status === 'error' && setSelectedStatus(status)}
                  className={`
                    email-item p-4 flex items-center gap-4 transition-all
                    ${status.status === 'error' ? 'cursor-pointer hover:bg-red-500/10' : ''}
                  `}
                >
                  {getStatusIcon(status.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate font-medium">{status.email}</p>
                    {status.status === 'error' && (
                      <p className="text-red-400/60 text-[10px] flex items-center gap-1 mt-0.5">
                        <Info className="w-3 h-3" />
                        Click to see error details
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(status.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">Summary Error</p>
              <p className="text-red-400/70 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {allComplete && (
        <div className="flex items-center justify-center">
          <button
            onClick={onReset}
            className="glass-button px-8 py-4 flex items-center gap-3 text-base shadow-xl shadow-indigo-500/20"
          >
            <RotateCcw className="w-5 h-5" />
            Send More Emails
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedStatus} onOpenChange={(open) => !open && setSelectedStatus(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Delivery Failed
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Details for <span className="text-white font-medium">{selectedStatus?.email}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-2">Error Message</h4>
            <p className="text-sm text-red-200/90 leading-relaxed font-mono whitespace-pre-wrap break-words">
              {selectedStatus?.message || "No specific error message provided by the server."}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedStatus(null)}
              className="glass-button-secondary px-6 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
