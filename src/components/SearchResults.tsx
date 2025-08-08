import React from 'react';
import { useState } from 'react';
import { X, Target, Mail, Linkedin, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Eye, EyeOff, Phone, TrendingUp, Shield, Heart, ChevronRight, Brain, Gift } from 'lucide-react';
import { SearchResponse, Candidate } from '../hooks/useKnowledgeGPT';
import DOMPurify from 'dompurify';

interface SearchResultsProps {
  isVisible: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: SearchResponse | null;
  apiError: string | null;
  onPushToCrm?: () => void;
  onToggleTracking?: (candidate: Candidate) => void;
  getTrackingStatus?: (candidate: Candidate) => boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  isVisible,
  onClose,
  searchQuery,
  searchResults,
  apiError,
  onPushToCrm,
  onToggleTracking,
  getTrackingStatus
}) => {

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showPhoneNumbers, setShowPhoneNumbers] = useState<Set<string>>(new Set());
  const [expandedBehavioralSections, setExpandedBehavioralSections] = useState<Set<string>>(new Set());
  const [showReferralSection, setShowReferralSection] = useState<boolean>(true);

  // Security utility functions
  const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const openSafeLink = (url: string): void => {
    if (!isValidUrl(url)) {
      console.warn('Invalid URL blocked:', url);
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  // Reset all expanded states when modal opens or search results change
  React.useEffect(() => {
    if (isVisible) {
      setExpandedCards(new Set());
      setShowPhoneNumbers(new Set());
      setExpandedBehavioralSections(new Set());
    }
  }, [isVisible, searchResults]);

  if (!isVisible) return null;

  const toggleCard = (candidateEmail: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(candidateEmail)) {
      newExpanded.delete(candidateEmail);
    } else {
      newExpanded.add(candidateEmail);
    }
    setExpandedCards(newExpanded);
  };

  const handleFeedback = (candidateEmail: string, feedback: 'positive' | 'negative') => {
    // TODO: Implement secure feedback handling with proper API call
    // Removed console.log for security - sensitive data should not be logged to console
    // Consider implementing proper analytics/logging service for production
  };

  const handleToggleTrackingLocal = (candidate: Candidate) => {
    if (onToggleTracking) {
      onToggleTracking(candidate);
    }
  };

  const handleTogglePhone = (candidateEmail: string) => {
    const newShowPhone = new Set(showPhoneNumbers);
    if (newShowPhone.has(candidateEmail)) {
      newShowPhone.delete(candidateEmail);
    } else {
      newShowPhone.add(candidateEmail);
    }
    setShowPhoneNumbers(newShowPhone);
  };

  const toggleBehavioralSection = (candidateKey: string) => {
    const newExpanded = new Set(expandedBehavioralSections);
    if (newExpanded.has(candidateKey)) {
      newExpanded.delete(candidateKey);
    } else {
      newExpanded.add(candidateKey);
    }
    setExpandedBehavioralSections(newExpanded);
  };

  // Get candidates from API results or use empty array
  const candidates: Candidate[] = searchResults?.candidates || [];

  // Get initials from candidate name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Default photo for candidates without profile photos
  const getProfilePhoto = (candidate: Candidate): string => {
    if (candidate.profile_photo_url && isValidUrl(candidate.profile_photo_url)) {
      // Additional validation for image URLs
      const url = new URL(candidate.profile_photo_url);
      const allowedDomains = ['images.pexels.com', 'media.licdn.com', 'avatars.githubusercontent.com'];
      if (allowedDomains.some(domain => url.hostname.includes(domain))) {
        return candidate.profile_photo_url;
      }
    }
    // Use a default photo from Pexels based on candidate name hash
    const photoIds = [774909, 2379004, 1239291, 1681010, 1043471, 1181686];
    const hash = (candidate.name || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const photoId = photoIds[hash % photoIds.length];
    return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Search Results
            </h2>
            <p className="text-sm text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {apiError ? (
                <span className="text-red-400">Error: {sanitizeText(apiError)}</span>
              ) : candidates.length > 0 ? (
                <span style={{ color: '#fb4b76' }}>{sanitizeText(searchQuery)}</span>
              ) : (
                `No matches found for "${sanitizeText(searchQuery)}"`
              )}
            </p>
            {candidates.length > 0 && (
              <p className="text-white/60 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Found {searchResults?.estimated_count || candidates.length} results. Here are the top {candidates.length}. <span className="text-blue-400 font-medium">Upgrade for more</span>
              </p>
            )}


          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200 p-1 z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Referral Section */}
          {candidates.length > 0 && showReferralSection && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              {/* Close button */}
              <button
                onClick={() => setShowReferralSection(false)}
                className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors duration-200 p-1"
              >
                <X size={14} />
              </button>

              <div className="flex items-start space-x-3 pr-4">
                <Gift size={20} className="text-pink-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-white/90 font-medium text-sm mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Love Knowledge?
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Share it with a friend — when they sign up, you both get free bonus credits.{' '}
                    <button
                      className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs transition-all duration-200 border text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-white ml-2 whitespace-nowrap"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <span>Share Now</span>
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {apiError ? (
            <div className="text-center py-8">
              <div className="text-red-400 mx-auto mb-4 text-4xl">⚠️</div>
              <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Search failed
              </p>
              <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {apiError}
              </p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/40 mx-auto mb-4 text-4xl">🔍</div>
              <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No people found
              </p>
              <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            candidates.map((candidate, index) => (
              <div key={candidate.email || candidate.name} className="backdrop-blur-sm border rounded-xl overflow-hidden" style={{ backgroundColor: '#1a2332', borderColor: '#fb4b76' }}>
                {/* Clickable Card Header */}
                <div
                  onClick={() => toggleCard(candidate.email || candidate.name)}
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    {/* Photo with fallback to initials */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                      <img
                        src={getProfilePhoto(candidate)}
                        alt={candidate.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white/20"
                        onError={(e) => {
                          // Hide the image on error
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Show the initials div
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const initialsDiv = parent.querySelector('.initials-fallback');
                            if (initialsDiv) initialsDiv.classList.remove('hidden');
                          }
                        }}
                      />
                      <div
                        className="initials-fallback hidden absolute inset-0 w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-white/20"
                        style={{ backgroundColor: '#fb4b76' }}
                      >
                        {getInitials(candidate.name)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base sm:text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {sanitizeText(candidate.name || '')}
                      </h3>
                      <p className="text-white/80 text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {sanitizeText(candidate.title || '')}
                      </p>
                      <p className="text-white/60 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {sanitizeText(candidate.company || '')}
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                      <Target size={12} className="text-pink-400" />
                      <span className="text-pink-400 font-medium text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {candidate.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div className="ml-4 text-white/50">
                    {expandedCards.has(candidate.email) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedCards.has(candidate.email || candidate.name) && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/10">
                    <div className="pt-4 mb-6">
                      {/* Real Time Tracking Box */}
                      <div className="mb-6">
                        <div className="border rounded-lg p-4" style={{ backgroundColor: '#1a2332', borderColor: '#fb4b76', borderWidth: '0.5px' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white/90 font-medium text-sm mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Real Time Tracking
                              </h4>
                              <p className="text-white/70 text-xs leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Get notified in Slack when this prospect engages with related content
                              </p>
                            </div>
                            <button
                              onClick={() => handleToggleTrackingLocal(candidate)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${getTrackingStatus?.(candidate)
                                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                                }`}
                            >
                              {getTrackingStatus?.(candidate) ? (
                                <>
                                  <Eye size={14} />
                                  <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Tracking
                                  </span>
                                </>
                              ) : (
                                <>
                                  <EyeOff size={14} />
                                  <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Track
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Contact Icons - Left */}
                      <div className="flex items-center space-x-3 mb-4">
                        <button
                          onClick={() => candidate.linkedin_url && openSafeLink(candidate.linkedin_url)}
                          disabled={!candidate.linkedin_url}
                          className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Linkedin size={16} className="text-white/70 group-hover:text-white" />
                        </button>
                        <button
                          onClick={() => candidate.email && openSafeLink(`mailto:${candidate.email}`)}
                          disabled={!candidate.email}
                          className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mail size={16} className="text-white/70 group-hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleTogglePhone(candidate.email || candidate.name)}
                          className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
                        >
                          <Phone size={16} className="text-white/70 group-hover:text-white" />
                        </button>

                        {/* Phone Numbers - Inline */}
                        {showPhoneNumbers.has(candidate.email || candidate.name) && (
                          <div className="flex flex-col space-y-1 ml-4 min-w-[220px]">
                            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex justify-between items-center">
                              <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Direct:
                              </span>
                              <span className="text-white text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                +1 (555) 123-4567
                              </span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex justify-between items-center">
                              <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Mobile:
                              </span>
                              <span className="text-white text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                +1 (555) 987-6543
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reasons */}
                      <div className="mb-6">
                        <h4 className="text-white/90 font-medium text-sm mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Why this person matches:
                        </h4>
                        <ul className="space-y-3">
                          {candidate.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#fb4b76' }}></div>
                              <span className="text-white/70 text-xs sm:text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {sanitizeText(reason || '')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Candidate Behavioral Data */}
                      {candidate.behavioral_data && (
                        <div className="mb-6 backdrop-blur-sm border rounded-xl p-3" style={{ backgroundColor: '#1a2332', borderColor: '#fb4b76', borderWidth: '0.5px' }}>
                          <button
                            onClick={() => toggleBehavioralSection(candidate.email || candidate.name)}
                            className="w-full flex items-center justify-between rounded-lg py-3 px-3 -m-2"
                          >
                            <div className="flex items-center space-x-2">
                              <Brain size={16} className="text-blue-400" />
                              <h4 className="text-white/90 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Behavioral Analysis
                              </h4>
                            </div>
                            <div className="text-white/50">
                              {expandedBehavioralSections.has(candidate.email || candidate.name) ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </div>
                          </button>

                          {expandedBehavioralSections.has(candidate.email || candidate.name) && (
                            <>
                              {/* Behavioral Intelligence Gauges */}
                              <div className="mb-6">
                                <h5 className="text-white/90 font-medium text-sm mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  Behavioral Scores:
                                </h5>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {/* Communication Maturity Index */}
                                    <div className="border border-white/20 rounded-lg p-3" style={{ backgroundColor: '#1a2332' }}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-1 relative group">
                                          <TrendingUp size={12} className="text-blue-400" />
                                          <h6 className="text-white/80 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                            CMI
                                          </h6>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 w-64">
                                              <div className="font-semibold mb-1">Commitment Momentum Index (CMI)</div>
                                              <div className="text-gray-300">Forward motion vs. idle curiosity—i.e., is the person merely researching or already lining up next steps?</div>
                                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-blue-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                          {candidate.behavioral_data?.scores?.cmi?.score || 0}
                                        </span>
                                      </div>
                                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${candidate.behavioral_data?.scores?.cmi?.score || 0}%` }}></div>
                                      </div>
                                      <p className="text-white/60 text-[10px] leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {sanitizeText(candidate.behavioral_data?.scores?.cmi?.explanation || 'No data available')}
                                      </p>
                                    </div>

                                    {/* Risk-Barrier Focus Score */}
                                    <div className="border border-white/20 rounded-lg p-3" style={{ backgroundColor: '#1a2332' }}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-1 relative group">
                                          <Shield size={12} className="text-yellow-400" />
                                          <h6 className="text-white/80 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                            RBFS
                                          </h6>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 w-64">
                                              <div className="font-semibold mb-1">Risk-Barrier Focus Score (RBFS)</div>
                                              <div className="text-gray-300">How sensitive the person is to downside and friction.</div>
                                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-yellow-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                          {candidate.behavioral_data?.scores?.rbfs?.score || 0}
                                        </span>
                                      </div>
                                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full" style={{ width: `${candidate.behavioral_data?.scores?.rbfs?.score || 0}%` }}></div>
                                      </div>
                                      <p className="text-white/60 text-[10px] leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {sanitizeText(candidate.behavioral_data?.scores?.rbfs?.explanation || 'No data available')}
                                      </p>
                                    </div>

                                    {/* Identity Alignment Signal */}
                                    <div className="border border-white/20 rounded-lg p-3" style={{ backgroundColor: '#1a2332' }}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-1 relative group">
                                          <Heart size={12} className="text-purple-400" />
                                          <h6 className="text-white/80 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                            IAS
                                          </h6>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 w-64">
                                              <div className="font-semibold mb-1">Identity Alignment Signal (IAS)</div>
                                              <div className="text-gray-300">Whether the choice aligns with their self-image and personal goals.</div>
                                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-purple-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                          {candidate.behavioral_data?.scores?.ias?.score || 0}
                                        </span>
                                      </div>
                                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full" style={{ width: `${candidate.behavioral_data?.scores?.ias?.score || 0}%` }}></div>
                                      </div>
                                      <p className="text-white/60 text-[10px] leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {sanitizeText(candidate.behavioral_data?.scores?.ias?.explanation || 'No data available')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}


                        </div>
                      )}

                      {/* Feedback Buttons */}
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(candidate.email || candidate.name, 'positive');
                          }}
                          className="flex items-center space-x-2 bg-white/10 hover:bg-green-500/20 border border-white/20 hover:border-green-500/30 rounded-full px-3 py-2 transition-all duration-200 group"
                        >
                          <ThumbsUp size={14} className="text-white/70 group-hover:text-green-400" />
                          <span className="text-white/70 group-hover:text-green-400 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Good match
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(candidate.email || candidate.name, 'negative');
                          }}
                          className="flex items-center space-x-2 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 rounded-full px-3 py-2 transition-all duration-200 group"
                        >
                          <ThumbsDown size={14} className="text-white/70 group-hover:text-red-400" />
                          <span className="text-white/70 group-hover:text-red-400 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Poor match
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

        </div>

        {/* Footer */}
        {candidates.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/10">
            <button
              onClick={onPushToCrm}
              className="group relative overflow-hidden w-full text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl border border-white/20 transition-all duration-200 text-sm sm:text-base"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#fb4b76' }}></div>
              <span className="relative z-10">Push to CRM</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;