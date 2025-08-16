import React, { useState } from 'react';
import { Paperclip, ArrowUp, Heart } from 'lucide-react';
import SlotCounter from 'react-slot-counter';
import { useDemoSearches } from '../hooks/useDemoSearches';

interface MainContentProps {
  onSearch: (query: string) => void;
  pendingSearch?: string;
}

const MainContent: React.FC<MainContentProps> = ({ onSearch, pendingSearch = '' }) => {
  const [input, setInput] = useState(pendingSearch);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { currentSearch, isLoading } = useDemoSearches();

  // Update input when pendingSearch changes
  React.useEffect(() => {
    if (pendingSearch) {
      setInput(pendingSearch);
    }
  }, [pendingSearch]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Check for easter egg
      if (input.trim().toLowerCase() === 'find my perfect wife') {
        setShowEasterEgg(true);
        setInput('');
        return;
      }
      onSearch(input.trim());
      setInput('');
    }
  };

  const handleDemoSearchClick = () => {
    if (currentSearch && !isLoading) {
      setInput(currentSearch);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSearch(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
      {/* Headers */}
      <div className="text-center mb-6 sm:mb-8 max-w-4xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium max-w-xs sm:max-w-md mx-auto px-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', filter: 'brightness(1.3)' }}>
          Who do you want to find?
        </h2>
      </div>

      {/* Demo Search Display */}
      <div className="mb-6 sm:mb-8 w-full">
        <div className="w-full max-w-sm sm:max-w-xl md:max-w-3xl px-2 mx-auto">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg w-full min-h-[80px] flex flex-col justify-center">
            <div className="text-center">
              <p className="text-white/60 text-[9px] sm:text-[10px] font-normal mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Searches from our community
              </p>
              <div className="flex items-center justify-center min-h-[3rem] px-2 overflow-hidden">
                {isLoading ? (
                  <div className="animate-pulse text-white/50 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Loading...
                  </div>
                ) : currentSearch ? (
                  <div className="relative w-full h-10 overflow-hidden">
                    <style jsx>{`
                      @keyframes rollInPauseOut {
                        0% { 
                          transform: translateY(100%);
                        }
                        15% {
                          transform: translateY(0);
                        }
                        90% {
                          transform: translateY(0);
                        }
                        100% { 
                          transform: translateY(-100%);
                        }
                      }
                      .vertical-slider {
                        animation: rollInPauseOut 4.8s ease-in-out forwards;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                      }
                    `}</style>
                    <div 
                      className="vertical-slider text-sm sm:text-base font-medium text-white px-2"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif',
                        lineHeight: '1.3',
                        letterSpacing: '0.3px',
                        wordBreak: 'break-word',
                        hyphens: 'auto'
                      }}
                      key={currentSearch}
                    >
                      {currentSearch}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/50 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    No search available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Large Centered Input */}
      <div className="w-full max-w-sm sm:max-w-xl md:max-w-3xl px-2">
        <form onSubmit={handleSubmit} className="relative">
          <div className="backdrop-blur-sm rounded-3xl shadow-2xl" style={{ backgroundColor: '#1B2A5C', border: '1px solid #fb4b76' }}>
            {/* Large Input Field */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find anyone..."
              className="w-full bg-transparent placeholder-white/50 px-4 sm:px-6 py-4 sm:py-6 focus:outline-none text-base sm:text-xl resize-none leading-relaxed min-h-[80px] sm:min-h-[120px] rounded-t-3xl"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#FFFFFF' }}
              rows={3}
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-white/10">
              {/* Left side - Attachment */}
              <button
                type="button"
                className="hover:opacity-80 transition-colors duration-200"
                style={{ color: '#fb4b76' }}
              >
                <Paperclip size={18} className="sm:w-5 sm:h-5" />
              </button>

              {/* Center - Empty space */}
              <div></div>

              {/* Right side - Send Button */}
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#fb4b76' }}
              >
                <ArrowUp size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Easter Egg Popup */}
      {showEasterEgg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <Heart 
                size={48} 
                className="text-red-400 fill-red-400 animate-pulse" 
              />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              You already found her
            </h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-white/90 text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                CA
              </span>
              <Heart size={16} className="text-red-400 fill-red-400" />
              <span className="text-white/90 text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                RP
              </span>
            </div>
            <p className="text-white/70 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              July 30, 2025
            </p>
            <button
              onClick={() => setShowEasterEgg(false)}
              className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-full transition-colors duration-200 font-medium"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              ❤️ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;