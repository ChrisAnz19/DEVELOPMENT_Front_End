import React, { useState } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';

interface MainContentProps {
  onSearch: (query: string) => void;
  pendingSearch?: string;
}

const MainContent: React.FC<MainContentProps> = ({ onSearch, pendingSearch = '' }) => {
  const [input, setInput] = useState(pendingSearch);

  // Update input when pendingSearch changes
  React.useEffect(() => {
    if (pendingSearch) {
      setInput(pendingSearch);
    }
  }, [pendingSearch]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput('');
    }
  };

  const handlePillClick = (pillText: string) => {
    if (pillText === 'More') {
      // Do nothing for "More" button
      return;
    }
    setInput(pillText);
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

  const pills = [
    'Manufacturing CIOs Researching Cloud ERP',
    'Series-B Engineers Open to New Roles',
    'Finance Leaders Looking for HIPAA Audit Tools',
    'Executives Looking to Invest in Early Stage Funds',
    'More'
  ];

  // Split pills into rows: 2 on top, 3 on bottom
  const topRowPills = pills.slice(0, 2);
  const bottomRowPills = pills.slice(2);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
      {/* Headers */}
      <div className="text-center mb-6 sm:mb-8 max-w-4xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium max-w-xs sm:max-w-md mx-auto px-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', filter: 'brightness(1.3)' }}>
          Who do you want to find?
        </h2>
      </div>

      {/* Pills */}
      <div className="mb-6 sm:mb-8 w-full">
        <div className="flex flex-col items-center gap-y-2 sm:gap-y-3 max-w-4xl mx-auto px-2">
          {/* Top row - 2 pills */}
          <div className="flex justify-center gap-x-1 sm:gap-x-2 flex-wrap">
            {topRowPills.map((pill, index) => (
              <button
                key={index}
                onClick={() => handlePillClick(pill)}
                className="group relative overflow-hidden bg-transparent rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-white hover:border-transparent transition-all duration-300 h-7 sm:h-8 flex items-center text-center mb-1 sm:mb-0"
                style={{ fontFamily: 'Poppins, sans-serif', border: '1px solid #fb4b76' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#fb4b76' }}></div>
                <span className="relative z-10 font-medium text-[9px] sm:text-[11px] leading-tight">
                  {pill}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom row - 3 pills */}
          <div className="flex justify-center gap-x-1 sm:gap-x-2 flex-wrap">
            {bottomRowPills.map((pill, index) => (
              <button
                key={index + topRowPills.length}
                onClick={() => handlePillClick(pill)}
                className="group relative overflow-hidden bg-transparent rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-white hover:border-transparent transition-all duration-300 h-7 sm:h-8 flex items-center text-center mb-1 sm:mb-0"
                style={{ fontFamily: 'Poppins, sans-serif', border: '1px solid #fb4b76' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#fb4b76' }}></div>
                <span className="relative z-10 font-medium text-[9px] sm:text-[11px] leading-tight">
                  {pill}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Large Centered Input */}
      <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl px-2">
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
    </div>
  );
};

export default MainContent;