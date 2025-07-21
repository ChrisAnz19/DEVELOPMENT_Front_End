import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 max-w-sm mx-4 shadow-2xl">
        {/* Spinner */}
        <div className="mb-4 flex justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        
        {/* Loading Message */}
        <p className="text-white text-sm sm:text-base font-medium text-center leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Looking through nearly a trillion rows of behavioral data from this past month
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;