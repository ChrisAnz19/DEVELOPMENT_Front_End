import React from 'react';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  results?: any; // SearchResponse type
  error?: string | null;
}

interface HistorySidebarProps {
  isVisible: boolean;
  history: HistoryItem[];
  onSelectHistory: (historyItem: HistoryItem) => void;
  onClose: () => void;
  onClearHistory: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isVisible, history, onSelectHistory, onClose, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter history based on search term
  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Group history by date
  const groupedHistory = filteredHistory.reduce((groups: { [key: string]: HistoryItem[] }, item) => {
    const dateKey = formatDate(item.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {});

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    onClearHistory();
    setShowClearConfirm(false);
    setSearchTerm('');
  };

  const cancelClearHistory = () => {
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* Background - Always rendered */}
      <div className={`fixed left-0 top-0 bottom-0 w-64 z-40 border-r border-white/20 transition-transform duration-300 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: '#5B4EDB' }}>
        {/* Content Container */}
        <div className={`h-full flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                History
              </h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-2">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50 text-xs">🔍</div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-7 pr-2 py-1.5 text-white placeholder-white/50 text-xs focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>
          </div>

          {/* History Items */}
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto scrollbar-hidden">
            {Object.entries(groupedHistory).map(([dateGroup, items]) => (
              <div key={dateGroup} className="mb-4">
                {/* Date Header */}
                <h3 className="text-white/70 text-xs font-medium mb-2 sticky top-0 backdrop-blur-sm py-1 px-2 rounded" style={{ backgroundColor: 'rgba(91, 78, 219, 0.9)' }} 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {dateGroup}
                </h3>
                
                {/* History Items for this date */}
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectHistory(item)}
                      className="w-full text-left group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-2 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-2">
                        {/* Status indicator */}
                        <div className="flex-shrink-0 mt-1">
                          {item.results ? (
                            item.results.candidates?.length === 0 ? (
                              <div className="w-2 h-2 bg-red-400 rounded-full" title="Search completed with no results" />
                            ) : (
                              <div className="w-2 h-2 bg-green-400 rounded-full" title="Search completed successfully" />
                            )
                          ) : item.error ? (
                            <div className="w-2 h-2 bg-red-400 rounded-full" title="Search failed" />
                          ) : (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" title="No results stored" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-[10px] font-medium mb-1 line-clamp-2 group-hover:text-white truncate" 
                             style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {item.query}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-white/50 text-[9px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {formatTime(item.timestamp)}
                            </span>
                            {item.results && (
                              <span className={`text-[8px] font-medium ${item.results.candidates?.length === 0 ? 'text-red-400' : 'text-green-400'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {item.results.candidates?.length || 0} results
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredHistory.length === 0 && searchTerm && (
              <div className="text-center py-6">
                <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  No matches found
                </p>
              </div>
            )}
            
            {history.length === 0 && (
              <div className="text-center py-6">
                <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  No history yet
                </p>
              </div>
            )}
          </div>

          {/* Clear History Button - Bottom */}
          <div className="p-3 sm:p-4 border-t border-white/20 flex-shrink-0">
            <button
              onClick={handleClearHistory}
              className="group relative overflow-hidden w-full flex items-center justify-center space-x-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white/70 hover:text-white transition-all duration-200 text-xs"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#79D284' }}></div>
              <span className="relative z-10">Clear History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Clear History Confirmation Popup */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Clear History
            </h3>
            <p className="text-white/80 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Are you sure you want to delete your search history? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelClearHistory}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearHistory}
                className="flex-1 bg-red-600/80 backdrop-blur-sm border border-red-500/50 text-white font-medium py-2 px-4 rounded-xl hover:bg-red-600 transition-all duration-200 text-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistorySidebar;