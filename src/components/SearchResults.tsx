import React from 'react';
import { useState } from 'react';
import { X, Target, Mail, Linkedin, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Eye, EyeOff, Phone, TrendingUp, Shield, Heart, ChevronRight, Brain, Gift, Loader2, FileText, ExternalLink } from 'lucide-react';
import { SearchResponse, Candidate, BehavioralData, EvidenceUrl } from '../hooks/useKnowledgeGPT';
import { usePrismatic } from '../hooks/usePrismatic';
import { useAuth } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import AvatarComponent from './AvatarComponent';

// Evidence type configuration mapping
const evidenceTypeConfig: Record<string, { icon: string; label: string }> = {
  "pricing_page": { icon: "💰", label: "Pricing" },
  "product_page": { icon: "📦", label: "Product Info" },
  "official_company_page": { icon: "🏢", label: "Company Page" },
  "documentation": { icon: "📚", label: "Documentation" },
  "comparison_site": { icon: "📊", label: "Comparison" },
  "news_article": { icon: "📰", label: "News" },
  "industry_report": { icon: "📈", label: "Research" },
  "review_site": { icon: "⭐", label: "Reviews" },
  "case_study": { icon: "📋", label: "Case Study" },
  "blog_post": { icon: "✍️", label: "Blog" },
  "general_information": { icon: "ℹ️", label: "Information" }
};

// Evidence helper functions
const getEvidenceIcon = (evidenceType: string) => {
  return evidenceTypeConfig[evidenceType]?.icon || "🔗";
};

const getEvidenceLabel = (evidenceType: string) => {
  return evidenceTypeConfig[evidenceType]?.label || "Information";
};

// Evidence Section Component
const EvidenceSection: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show loading state if evidence is being processed
  if (candidate.evidence_processing_time !== undefined && candidate.evidence_processing_time < 0) {
    return (
      <div className="mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Loader2 size={14} className="text-blue-400 animate-spin" />
            <h5 className="text-blue-400 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              🔍 Finding supporting evidence...
            </h5>
          </div>
          <p className="text-blue-400/60 text-xs mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Analyzing candidate behavior to find concrete evidence URLs
          </p>
        </div>
      </div>
    );
  }
  
  // Show demo evidence if no real evidence is available (for development/testing)
  const showDemoEvidence = !candidate.evidence_urls || candidate.evidence_urls.length === 0;
  const evidenceUrls: EvidenceUrl[] = showDemoEvidence ? [
    {
      url: "https://www.salesforce.com/products/platform/pricing/",
      title: "Salesforce Platform Pricing | Plans & Packages",
      description: "Official Salesforce pricing page showing current plans and costs",
      evidence_type: "pricing_page",
      relevance_score: 0.95,
      confidence_level: "high" as const,
      supporting_explanation: "Directly supports claim about researching Salesforce pricing options"
    },
    {
      url: "https://www.g2.com/categories/crm",
      title: "Best CRM Software 2024 | G2",
      description: "Comprehensive comparison of CRM solutions including pricing and features",
      evidence_type: "comparison_site",
      relevance_score: 0.87,
      confidence_level: "medium" as const,
      supporting_explanation: "Shows research into CRM alternatives and competitive analysis"
    },
    {
      url: "https://www.capterra.com/p/salesforce/",
      title: "Salesforce Reviews & Ratings | Capterra",
      description: "User reviews and ratings for Salesforce CRM platform",
      evidence_type: "review_site",
      relevance_score: 0.82,
      confidence_level: "medium" as const,
      supporting_explanation: "Provides user feedback and real-world usage insights"
    },
    {
      url: "https://www.trustradius.com/products/salesforce/reviews",
      title: "Salesforce Reviews | TrustRadius",
      description: "Detailed product reviews and comparisons from TrustRadius",
      evidence_type: "review_site",
      relevance_score: 0.79,
      confidence_level: "medium" as const,
      supporting_explanation: "Additional validation from trusted review platform"
    },
    {
      url: "https://www.softwareadvice.com/crm/salesforce-profile/",
      title: "Salesforce CRM Software Review | Software Advice",
      description: "Expert analysis and recommendations for Salesforce CRM",
      evidence_type: "review_site",
      relevance_score: 0.76,
      confidence_level: "medium" as const,
      supporting_explanation: "Professional software evaluation and insights"
    }
  ] : candidate.evidence_urls || [];
  
  if (showDemoEvidence && !candidate.evidence_urls) {
    return (
      <div className="mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText size={14} className="text-blue-400" />
              <h5 className="text-blue-400 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📋 SUPPORTING EVIDENCE
              </h5>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded-full border border-blue-500/30">
                DEMO
              </span>
              {/* Tooltip */}
              <div className="relative group">
                <div className="w-4 h-4 text-blue-400/60 cursor-help">ℹ️</div>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 w-64">
                    <div className="font-semibold mb-1">Supporting Evidence (Demo)</div>
                    <div className="text-gray-300">This shows how evidence URLs will appear when the API provides real data. Evidence URLs provide concrete, verifiable links supporting behavioral insights.</div>
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {/* Demo Evidence Summary */}
          <p className="text-blue-400/80 text-xs mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Found 5 supporting URLs including pricing, reviews, and comparisons • 87% confidence • Processed in 2.3s
            <br />
            <span className="text-blue-400/60">
              🔗 Connected to: /api/evidence/stats • /api/search • /api/search/{'{request_id}'}
            </span>
          </p>

          {/* Demo Evidence URLs */}
          {isExpanded && (
            <div className="space-y-3">
              {evidenceUrls.map((evidence, index) => (
                <div key={index} className="bg-white/5 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-lg">{getEvidenceIcon(evidence.evidence_type)}</span>
                      <div className="min-w-0 flex-1">
                        <h6 className="text-blue-400 font-medium text-xs truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {evidence.title}
                        </h6>
                        <span className="text-blue-400/60 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10">
                          {getEvidenceLabel(evidence.evidence_type)}
                        </span>
                      </div>
                    </div>

                  </div>
                  
                  <p className="text-blue-400/70 text-xs mb-3 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {evidence.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400/50 text-[10px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Relevance: {Math.round(evidence.relevance_score * 100)}%
                    </span>
                    <button
                      onClick={() => window.open(evidence.url, '_blank', 'noopener,noreferrer')}
                      className="flex items-center space-x-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/40 text-blue-400 text-xs px-3 py-1.5 rounded transition-all duration-200"
                    >
                      <ExternalLink size={12} />
                      <span>Visit Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!candidate.evidence_urls || candidate.evidence_urls.length === 0) {
    return null;
  }

  return null;
};

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
  const { 
    hubspot, 
    pushContactsToHubSpot, 
    isPushingToHubSpot, 
    hubspotPushResult 
  } = usePrismatic();

  // Debug logging to understand component state
  console.log('🔍 SearchResults component state:', {
    hasSearchResults: !!searchResults,
    candidatesCount: searchResults?.candidates?.length || 0,
    hasEvidenceStats: false, // evidenceStatsLoading and evidenceStatsError are removed
    evidenceStatsLoading: false,
    evidenceStatsError: null
  });

  // Debug logging for evidence data structure
  if (searchResults?.candidates) {
    searchResults.candidates.forEach((candidate, index) => {
      console.log(`🔍 Candidate ${index + 1} evidence data:`, {
        name: candidate.name,
        evidence_urls: candidate.evidence_urls,
        evidence_urls_count: candidate.evidence_urls?.length || 0,
        evidence_summary: candidate.evidence_summary,
        evidence_confidence: candidate.evidence_confidence,
        evidence_processing_time: candidate.evidence_processing_time
      });
      
      // Log the actual evidence_urls array structure
      if (candidate.evidence_urls && candidate.evidence_urls.length > 0) {
        console.log(`🔍 Candidate ${index + 1} evidence_urls array:`, candidate.evidence_urls);
        candidate.evidence_urls.forEach((evidence, evIndex) => {
          console.log(`  Evidence ${evIndex + 1}:`, {
            url: evidence.url,
            title: evidence.title,
            description: evidence.description,
            evidence_type: evidence.evidence_type,
            relevance_score: evidence.relevance_score,
            confidence_level: evidence.confidence_level
          });
        });
      }
      
      // Log the FULL candidate object to see what's actually there
      console.log(`🔍 Candidate ${index + 1} FULL OBJECT:`, candidate);
      console.log(`🔍 Candidate ${index + 1} ALL KEYS:`, Object.keys(candidate));
      
      // Check for potential field name mismatches
      const possibleEvidenceFields = [
        'evidence_urls', 'evidenceUrls', 'evidence_urls_list', 'evidence_list',
        'validation_urls', 'validationUrls', 'urls', 'links', 'sources',
        'evidence_data', 'evidenceData', 'supporting_evidence', 'supportingEvidence'
      ];
      
      possibleEvidenceFields.forEach(field => {
        if ((candidate as any)[field]) {
          console.log(`🔍 Found potential evidence field '${field}':`, (candidate as any)[field]);
        }
      });
      
      // Check data types and null/undefined values
      console.log(`🔍 Candidate ${index + 1} type analysis:`, {
        evidence_urls_type: typeof candidate.evidence_urls,
        evidence_urls_is_array: Array.isArray(candidate.evidence_urls),
        evidence_urls_is_null: candidate.evidence_urls === null,
        evidence_urls_is_undefined: candidate.evidence_urls === undefined,
        evidence_urls_length: candidate.evidence_urls?.length,
        evidence_urls_constructor: candidate.evidence_urls?.constructor?.name
      });
    });
  }

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showPhoneNumbers, setShowPhoneNumbers] = useState<Set<string>>(new Set());
  const [expandedBehavioralSections, setExpandedBehavioralSections] = useState<Set<string>>(new Set());
  const [showReferralSection, setShowReferralSection] = useState<boolean>(true);
  const [expandedDebugSections, setExpandedDebugSections] = useState<Set<string>>(new Set());
  const [expandedEvidenceSections, setExpandedEvidenceSections] = useState<Set<string>>(new Set());

  // Security utility functions
  const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };



  const openUrlSafely = (url: string) => {
    if (isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };



  // Reset all expanded states when modal opens or search results change
  React.useEffect(() => {
    if (isVisible) {
      setExpandedCards(new Set());
      setShowPhoneNumbers(new Set());
      setExpandedBehavioralSections(new Set());
      setShowReferralSection(true); // Always show referral section when modal opens
      setExpandedDebugSections(new Set()); // Reset debug sections
      setExpandedEvidenceSections(new Set()); // Reset evidence sections
    }
  }, [isVisible, searchResults]);

  if (!isVisible) return null;

  const toggleCard = (candidateEmail: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateEmail)) {
        newSet.delete(candidateEmail);
      } else {
        newSet.add(candidateEmail);
      }
      return newSet;
    });
  };

  const handleFeedback = (candidateEmail: string, feedback: 'positive' | 'negative') => {
    // TODO: Implement secure feedback handling with proper API call
    // Removed console.log for security - sensitive data should not be logged to console
    // Consider implementing proper analytics/logging service for production
  };

  const handlePushToHubSpot = async () => {
    if (!candidates.length) {
      return;
    }

    try {
      // Convert candidates to the format expected by Prismatic
      const candidatesData = candidates.map(candidate => ({
        name: candidate.name,
        title: candidate.title,
        company: candidate.company,
        email: candidate.email || '',
        accuracy: candidate.accuracy,
        reasons: candidate.reasons || [],
        linkedin_url: candidate.linkedin_url,
        profile_photo_url: candidate.profile_photo_url,
        location: candidate.location,
        behavioral_data: candidate.behavioral_data
      }));

      await pushContactsToHubSpot(candidatesData);
    } catch (error) {
      console.error('Failed to push contacts to HubSpot:', error);
    }
  };

  const handleToggleTrackingLocal = (candidate: Candidate) => {
    if (onToggleTracking) {
      onToggleTracking(candidate);
    }
  };

  const togglePhoneNumbers = (candidateEmail: string) => {
    setShowPhoneNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateEmail)) {
        newSet.delete(candidateEmail);
      } else {
        newSet.add(candidateEmail);
      }
      return newSet;
    });
  };

  const toggleBehavioralSection = (candidateEmail: string) => {
    setExpandedBehavioralSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateEmail)) {
        newSet.delete(candidateEmail);
      } else {
        newSet.add(candidateEmail);
      }
      return newSet;
    });
  };

  const toggleDebugSection = (candidateEmail: string) => {
    setExpandedDebugSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateEmail)) {
        newSet.delete(candidateEmail);
      } else {
        newSet.add(candidateEmail);
      }
      return newSet;
    });
  };

  const toggleEvidenceSection = (candidateEmail: string) => {
    setExpandedEvidenceSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateEmail)) {
        // If closing evidence section, also close debug section
        newSet.delete(candidateEmail);
        setExpandedDebugSections(debugPrev => {
          const newDebugSet = new Set(debugPrev);
          newDebugSet.delete(candidateEmail);
          return newDebugSet;
        });
      } else {
        // If opening evidence section, also open debug section
        newSet.add(candidateEmail);
        setExpandedDebugSections(debugPrev => {
          const newDebugSet = new Set(debugPrev);
          newDebugSet.add(candidateEmail);
          return newDebugSet;
        });
      }
      return newSet;
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if can't format
  };



  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'target']
    });
  };

  // Get the first candidate for referral section
  const firstCandidate = searchResults?.candidates?.[0];

  // Get candidates from API results or use empty array
  const candidates: Candidate[] = searchResults?.candidates || [];

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
            // Debug: Log the raw candidate data to see what we're working with
            (() => {
              console.log('🔍 Raw candidates data:', candidates);
              candidates.forEach((candidate, index) => {
                console.log(`📋 Candidate ${index + 1} (${candidate.name}):`, {
                  profile_photo_url: candidate.profile_photo_url,
                  linkedin_url: candidate.linkedin_url,
                  linkedin_profile: candidate.linkedin_profile,
                  has_linkedin_profile: !!candidate.linkedin_profile,
                  linkedin_profile_keys: candidate.linkedin_profile ? Object.keys(candidate.linkedin_profile) : []
                });
              });
              return null;
            })(),
            candidates.map((candidate, index) => (
              <div key={candidate.email || candidate.name} className="backdrop-blur-sm border rounded-xl overflow-hidden" style={{ backgroundColor: '#1a2332', borderColor: '#fb4b76' }}>
                {/* Clickable Card Header */}
                <div
                  onClick={() => toggleCard(candidate.email || candidate.name)}
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    {/* Enhanced Avatar Component */}
                    <AvatarComponent 
                      candidate={candidate}
                      size="md"
                      className="flex-shrink-0"
                    />

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
                    {expandedCards.has(candidate.email || candidate.name) ? (
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
                          onClick={() => candidate.linkedin_url && openUrlSafely(candidate.linkedin_url)}
                          disabled={!candidate.linkedin_url}
                          className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Linkedin size={16} className="text-white/70 group-hover:text-white" />
                        </button>
                        <button
                          onClick={() => candidate.email && openUrlSafely(`mailto:${candidate.email}`)}
                          disabled={!candidate.email}
                          className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mail size={16} className="text-white/70 group-hover:text-white" />
                        </button>
                        <button
                          onClick={() => togglePhoneNumbers(candidate.email || candidate.name)}
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
                                {candidate.phone ? formatPhoneNumber(candidate.phone) : 'Not available'}
                              </span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex justify-between items-center">
                              <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Mobile:
                              </span>
                              <span className="text-white text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {candidate.mobile ? formatPhoneNumber(candidate.mobile) : 'Not available'}
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

                      {/* Combined Validation & Evidence Section */}
                      <div className="mb-6">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 pt-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <Brain size={14} className="text-yellow-400" />
                            <h5 className="text-yellow-400 font-medium text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              MODEL VALIDATION & EVIDENCE
                            </h5>
                            <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded-full border border-yellow-500/30">
                              DEV
                            </span>
                            <button
                              onClick={() => toggleEvidenceSection(candidate.email || candidate.name)}
                              className="ml-auto text-yellow-400/60 hover:text-yellow-400 transition-colors p-1 rounded hover:bg-yellow-500/20"
                              title="Toggle evidence section"
                            >
                              {expandedEvidenceSections.has(candidate.email || candidate.name) ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )}
                            </button>
                          </div>
                          
                          {/* Evidence Section Content - Collapsible */}
                          {expandedEvidenceSections.has(candidate.email || candidate.name) && (
                            <>
                              <p className="text-yellow-400/80 text-xs mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Reference URLs for AI response validation and supporting evidence
                              </p>
                              
                              {/* Debug Info - Collapsible */}
                              {expandedDebugSections.has(candidate.email || candidate.name) && (
                                <div className="bg-white/5 border border-yellow-500/20 rounded px-3 py-2 mb-3">
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="text-yellow-400/60 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Evidence URLs:
                                      </span>
                                      <span className="text-yellow-400/60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {candidate.evidence_urls?.length || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-yellow-400/60 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Evidence Summary:
                                      </span>
                                      <span className="text-yellow-400/60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {candidate.evidence_summary ? 'Available' : 'Loading...'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-yellow-400/60 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Confidence:
                                      </span>
                                      <span className="text-yellow-400/60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {candidate.evidence_confidence ? `${Math.round(candidate.evidence_confidence * 100)}%` : 'Processing...'}
                                      </span>
                                    </div>

                                    <div className="text-yellow-400/40 text-center pt-1 border-t border-yellow-500/20" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      Validation URLs from evidence_urls array
                                    </div>
                                  </div>
                                </div>
                              )}
                              

                              
                          {/* URL Display Fields with Open Buttons */}
                          <div className="space-y-3">
                            {/* Column Headers */}
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex-1 text-yellow-400/60 text-xs font-medium px-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                URL
                              </div>
                              <div className="flex items-center space-x-3 text-xs">
                                <div className="text-center w-16">
                                  <span className="text-yellow-400/60 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Relevance
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Validation URLs - Show evidence URLs from backend */}
                            {candidate.evidence_urls && candidate.evidence_urls.length > 0 && (
                              <>
                                {candidate.evidence_urls.map((evidence, index) => (
                                  <div key={`validation-${index}`} className="flex items-center space-x-2">
                                    <button
                                      onClick={() => window.open(evidence.url, '_blank', 'noopener,noreferrer')}
                                      className="flex-1 bg-white/5 border border-yellow-500/30 rounded px-3 py-2 text-xs text-yellow-400 truncate hover:bg-white/10 hover:border-yellow-500/40 transition-all duration-200 text-left"
                                      style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                      {evidence.url}
                                    </button>
                                    <div className="flex items-center space-x-3 text-xs">
                                      <div className="text-center w-16">
                                        <span className="text-yellow-400/60 px-2 py-1 rounded border border-yellow-500/30 bg-yellow-500/10">
                                          {Math.round(evidence.relevance_score * 100)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                            
                            {/* Loading State for Validation URLs */}
                            {(!candidate.evidence_urls || candidate.evidence_urls.length === 0) && (
                              <div className="text-center py-4">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Loader2 size={16} className="text-yellow-400 animate-spin" />
                                  <span className="text-yellow-400/60 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    LOADING VALIDATION URLS...
                                  </span>
                                </div>
                                <p className="text-yellow-400/30 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  AI model is processing and validating candidate data
                                </p>
                              </div>
                            )}
                          </div>
                            </>
                          )}
                        </div>
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
                      <div className="flex items-center justify-end space-x-4 mb-4">
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
          <div className="p-4 sm:p-6 border-t border-white/10 space-y-4">
            {/* HubSpot Push Result */}
            {hubspotPushResult && (
              <div className={`p-3 rounded-lg text-sm ${
                hubspotPushResult.includes('Successfully') || hubspotPushResult.includes('Pushed')
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {hubspotPushResult}
              </div>
            )}

            {/* Push to HubSpot Button */}
            <button
              onClick={handlePushToHubSpot}
              disabled={isPushingToHubSpot}
              className="group relative overflow-hidden w-full text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl border border-white/20 hover:border-pink-500/50 transition-all duration-200 text-sm sm:text-base flex items-center justify-center space-x-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-pink-500"></div>
              {isPushingToHubSpot ? (
                <>
                  <Loader2 size={16} className="animate-spin relative z-10" />
                  <span className="relative z-10">Pushing to HubSpot...</span>
                </>
              ) : (
                <span className="relative z-10">Push to HubSpot</span>
              )}
            </button>


          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;