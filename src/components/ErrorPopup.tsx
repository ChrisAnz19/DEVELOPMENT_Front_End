import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ErrorPopupProps {
  isVisible: boolean;
  onClose: () => void;
  errorMessage: string;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ isVisible, onClose, errorMessage }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-red-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <h2 className="text-white text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Search Error
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <p className="text-white/90 text-sm leading-relaxed bg-red-500/10 border border-red-500/20 rounded-lg p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {errorMessage}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 font-medium py-3 px-4 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-sm"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;