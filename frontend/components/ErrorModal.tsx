import { AlertOctagon, X } from 'lucide-react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ message, onClose }: ErrorModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="animate-fade-up bg-white rounded-2xl max-w-[440px] w-full shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 p-5 sm:px-6 flex items-start gap-4">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <AlertOctagon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="m-0 mb-[6px] text-[18px] font-extrabold text-red-800">
              Connection Error
            </h3>
            <p className="m-0 text-[14px] text-red-700 leading-snug">
              The AI agent is currently unavailable or encountered an error.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-transparent border-none cursor-pointer text-red-400 p-1 flex transition-colors -mt-1 hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mono-font bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600 text-xs break-words">
            {message}
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose} 
              className="bg-gradient-to-br from-teal-600 to-teal-800 text-white px-6 py-2.5 rounded-lg border-none font-bold text-sm cursor-pointer shadow-md hover:from-teal-700 hover:to-teal-900 transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
