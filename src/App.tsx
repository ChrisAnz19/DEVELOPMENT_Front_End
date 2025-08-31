import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import SearchResults from './components/SearchResults';
import SignInPopup from './components/SignInPopup';
import SignUpPopup from './components/SignUpPopup';
import TrackingModal from './components/TrackingModal';
import IntegrationsModal from './components/IntegrationsModal';
import ErrorPopup from './components/ErrorPopup';
import HistorySidebar from './components/HistorySidebar';
import LoadingOverlay from './components/LoadingOverlay';
import { useAuth } from './context/AuthContext';
import { useKnowledgeGPT, SearchResponse, Candidate } from './hooks/useKnowledgeGPT';
import { useSearchApi } from './hooks/useSearchApi';
import { saveSearchHistory, loadSearchHistory, clearSearchHistory, loadTrackedPeople, saveTrackedPerson, deleteTrackedPerson } from './lib/supabaseData';
import { HistoryItem, TrackedPerson } from './lib/supabaseData';
import { Heart, History as HistoryIcon } from 'lucide-react';

// Error Boundary Component to catch runtime errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-6xl mb-4">🚨</div>
            <h1 className="text-xl font-semibold mb-4">Runtime Error</h1>
            <p className="text-gray-300 mb-4">Something went wrong while running the application.</p>
            <details className="text-left text-sm text-gray-400 mb-6">
              <summary className="cursor-pointer mb-2">Error Details</summary>
              <pre className="bg-gray-800 p-3 rounded overflow-auto text-xs">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  const [trackedPeople, setTrackedPeople] = useState<TrackedPerson[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<SearchResponse | null>(null);
  const [currentSearchError, setCurrentSearchError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newApiSearchId, setNewApiSearchId] = useState<number | null>(null); // New state for the new API's search ID
  const [pendingSearch, setPendingSearch] = useState<string>(''); // Store search query for after auth
  
  // Add error state for component errors
  const [componentError, setComponentError] = useState<string | null>(null);
  
  console.log('🚀 App component rendering...');
  
  const { createSearch, pollSearchResult, isLoading: apiLoading, error: apiError } = useKnowledgeGPT();
  const { user, loading: authLoading } = useAuth();
  const { createSearchRecord, addPersonToSearchRecord } = useSearchApi(); // New hook usage
  
  console.log('✅ Hooks loaded successfully:', { user, authLoading });

  // Add debugging to track component lifecycle
  useEffect(() => {
    console.log('🚀 App component mounted successfully');
    return () => {
      console.log('🔄 App component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('🔐 Auth state updated:', { user, authLoading });
  }, [user, authLoading]);

  // Load user data when user changes
  React.useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          // Load search history
          const history = await loadSearchHistory(user.id);
          setSearchHistory(history);

          // Load tracked people
          const tracked = await loadTrackedPeople(user.id);
          setTrackedPeople(tracked);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // Clear data when user logs out
        setSearchHistory([]);
        setTrackedPeople([]);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleSearch = (query: string) => {
    // Check for easter egg first
    if (query.toLowerCase().trim() === 'find my perfect wife') {
      setShowEasterEgg(true);
      return;
    }

    // Temporarily bypass authentication for development
    // if (!user) {
    //   setPendingSearch(query); // Store the search query
    //   setShowSignInPopup(true);
    //   return;
    // }

    setSearchQuery(query);
    setShowResults(false);
    setApiSearchResults(null);
    setCurrentSearchError(null); // Clear any previous search error
    
    setIsLoading(true);
    
    // Perform actual API search
    const performSearch = async () => {
      try {
        // 1. Call existing KnowledgeGPT API to initiate search
        console.log('Creating search for:', query);
        const requestId = await createSearch(query, 2); // Request 2 candidates
        console.log('KnowledgeGPT Search created with ID:', requestId);

        // 2. Call new User Database API to create a search record
        // Temporarily bypass user authentication for development
        try {
          const newSearchRecord = await createSearchRecord({
            request_id: requestId, // Use KnowledgeGPT's requestId here
            prompt: query,
            filters: {} // Add relevant filters if available
          });
          console.log('New API Search Record created with ID:', newSearchRecord.id);
          setNewApiSearchId(newSearchRecord.id); // Store the new API's search ID
        } catch (recordError) {
          console.error('Error creating new API search record:', recordError);
          // Continue with KnowledgeGPT search even if record creation fails
          setNewApiSearchId(null);
        }
        
        // 3. Poll for KnowledgeGPT results
        console.log('Polling for KnowledgeGPT results...');
        const result = await pollSearchResult(requestId);
        console.log('KnowledgeGPT Search completed:', result);

        // Debug: Log the detailed structure of candidates to see LinkedIn profile data
        if (result.status === 'completed' && result.candidates) {
          console.log('🔍 Detailed candidates data structure:');
          result.candidates.forEach((candidate, index) => {
            console.log(`📋 Candidate ${index + 1} (${candidate.name}):`, {
              profile_photo_url: candidate.profile_photo_url,
              linkedin_url: candidate.linkedin_url,
              linkedin_profile: candidate.linkedin_profile,
              linkedin_profile_keys: candidate.linkedin_profile ? Object.keys(candidate.linkedin_profile) : [],
              full_candidate_data: candidate
            });
          });
        }
        
        if (result.status === 'completed') {
          console.log('✅ Search completed, setting results:', {
            request_id: result.request_id,
            candidates_count: result.candidates?.length || 0,
            has_candidates: !!result.candidates
          });
          
          if (result.candidates && result.candidates.length > 0) {
            result.candidates.forEach((candidate, index) => {
              console.log(`🔍 Candidate ${index + 1} in completed result:`, {
                name: candidate.name,
                evidence_urls_count: candidate.evidence_urls?.length || 0,
                evidence_summary: candidate.evidence_summary,
                evidence_confidence: candidate.evidence_confidence
              });
            });
          }
          
          setApiSearchResults(result);
          setShowResults(true);
          
          // Evidence processing happens asynchronously, so poll for updates
          if (result.status === 'completed' && result.candidates && result.candidates.length > 0) {
            console.log('🔄 Starting evidence polling for updated results...');
            
            const pollForEvidence = async () => {
              try {
                const updatedResult = await pollSearchResult(result.request_id);
                console.log('🔄 Polled result:', {
                  request_id: updatedResult.request_id,
                  status: updatedResult.status,
                  candidates_count: updatedResult.candidates?.length || 0
                });
                
                if (updatedResult.candidates && updatedResult.candidates.length > 0) {
                  let hasEvidence = false;
                  updatedResult.candidates.forEach((candidate: Candidate, index: number) => {
                    const evidenceCount = candidate.evidence_urls?.length || 0;
                    console.log(`🔍 Polled Candidate ${index + 1}:`, {
                      name: candidate.name,
                      evidence_urls_count: evidenceCount
                    });
                    if (evidenceCount > 0) hasEvidence = true;
                  });
                  
                  if (hasEvidence) {
                    console.log('✅ Evidence data found, updating results!');
                    setApiSearchResults(updatedResult);
                    return true; // Stop polling
                  }
                }
                
                return false; // Continue polling
              } catch (error) {
                console.log('⚠️ Polling error:', error);
                return false;
              }
            };
            
            // Poll every 2 seconds until evidence appears or timeout
            let pollCount = 0;
            const maxPolls = 30; // 60 seconds max (30 * 2 seconds)
            
            const pollInterval = setInterval(async () => {
              pollCount++;
              console.log(`🔄 Poll attempt ${pollCount}/${maxPolls}`);
              
              const shouldStop = await pollForEvidence();
              if (shouldStop || pollCount >= maxPolls) {
                clearInterval(pollInterval);
                if (pollCount >= maxPolls) {
                  console.log('⏰ Evidence polling timed out after 60 seconds');
                }
              }
            }, 2000);
          }
        } else if (result.status === 'failed') {
          console.error('KnowledgeGPT Search failed:', result.error);
          const errorMsg = result.error || 'Search failed';
          setCurrentSearchError(errorMsg);
          setErrorMessage(errorMsg);
          setShowErrorPopup(true);
        }
        
        // Add to history regardless of success/failure
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          results: result.status === 'completed' ? result : null,
          error: result.status === 'failed' ? (result.error || 'Search failed') : null
        };
        
        setSearchHistory(prev => [newHistoryItem, ...prev]);
        
        // Save to Supabase if user is authenticated
        // Temporarily bypass user authentication for development
        // if (user?.id && result.status === 'completed') {
        //   await saveSearchHistory(user.id, newHistoryItem);
        // }
        
        setShowHistory(false); // Hide history when showing results
        
      } catch (error) {
        console.error('Search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setCurrentSearchError(errorMessage);
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
        
        // Add failed search to history
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          results: null,
          error: errorMessage
        };
        
        setSearchHistory(prev => [newHistoryItem, ...prev]);
        
        // Don't save failed searches to Supabase for now
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setNewApiSearchId(null); // Clear the search ID when results are closed
    setCurrentSearchError(null); // Clear the current search error
    // Don't automatically show history - let user choose
  };

  const handleSelectHistory = (historyItem: HistoryItem) => {
    setShowHistory(false); // Hide history when starting new search
    
    // Set the search query and results from history
    setSearchQuery(historyItem.query);
    
    if (historyItem.results) {
      // Show stored results
      setApiSearchResults(historyItem.results);
      setCurrentSearchError(null); // Clear any error state
      setShowResults(true);
    } else if (historyItem.error) {
      // Show stored error
      setCurrentSearchError(historyItem.error);
      setErrorMessage(historyItem.error);
      setShowErrorPopup(true);
    } else {
      // Fallback: re-run search if no stored results/error
      handleSearch(historyItem.query);
    }
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    
    // Clear from Supabase if user is authenticated
    if (user?.id) {
      clearSearchHistory(user.id);
    }
  };

  const handleDeleteHistoryItem = (itemId: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== itemId));
    
    // Delete from Supabase if user is authenticated
    if (user?.id) {
      // Note: You'll need to implement deleteSearchHistoryItem in your Supabase functions
      // For now, we'll just update the local state
      console.log('Deleting history item:', itemId);
    }
  };

  const handleCloseSignInPopup = () => {
    setShowSignInPopup(false);
  };

  const handleCloseSignUpPopup = () => {
    setShowSignUpPopup(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignInPopup(false);
    setShowSignUpPopup(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpPopup(false);
    setShowSignInPopup(true);
  };

  const handleAuthSuccess = () => {
    // Close any open popups when auth succeeds
    setShowSignInPopup(false);
    setShowSignUpPopup(false);
    
    // If there's a pending search, execute it
    if (pendingSearch) {
      const searchToExecute = pendingSearch;
      setPendingSearch(''); // Clear the pending search
      handleSearch(searchToExecute); // Execute the search
    }
  };

  const handlePushToCrm = () => {
    console.log('Push to CRM clicked');
    // Implement CRM push logic here
  };

  const handleToggleTrackingModal = () => {
    setShowTrackingModal(!showTrackingModal);
  };

  const handleCloseTrackingModal = () => {
    setShowTrackingModal(false);
  };

  const handleToggleIntegrationsModal = () => {
    setShowIntegrationsModal(!showIntegrationsModal);
  };

  const handleCloseIntegrationsModal = () => {
    setShowIntegrationsModal(false);
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  const handleToggleTracking = async (candidate: Candidate) => { // Added async
    const candidateKey = candidate.email || candidate.name;
    
    // Record tracking action with the new API if a search ID is available
    if (newApiSearchId && user) { // Only record if user is authenticated and search ID exists
      try {
        const personData = {
          name: candidate.name,
          title: candidate.title,
          company: candidate.company,
          email: candidate.email,
          linkedin_url: candidate.linkedin_url,
          profile_photo_url: candidate.profile_photo_url,
          location: candidate.location,
          accuracy: candidate.accuracy,
          reasons: candidate.reasons,
          linkedin_profile: candidate.linkedin_profile?.summary ? { summary: candidate.linkedin_profile.summary } : undefined, // Only send summary if available
          behavioral_data: candidate.behavioral_data,
          // linkedin_posts is not directly available in Candidate type, omit for now
        };
        await addPersonToSearchRecord(newApiSearchId, personData);
        console.log(`Person ${candidate.name} added to new API search record ${newApiSearchId}`);
      } catch (recordError) {
        console.error('Error adding person to new API search record:', recordError);
        // Decide how to handle this error (e.g., show a popup)
      }
    } else {
      console.warn('Skipping recording tracked person to new API: No authenticated user or search ID available.');
    }

    // Calculate new state synchronously
    const currentTrackedPeople = trackedPeople;
    const existingIndex = currentTrackedPeople.findIndex(person => person.id === candidateKey);
    
    let updatedTrackedPeople;
    let updatedPerson;
    
    if (existingIndex >= 0) {
      // Person exists, toggle their tracking status
      updatedTrackedPeople = [...currentTrackedPeople];
      updatedTrackedPeople[existingIndex] = {
        ...updatedTrackedPeople[existingIndex],
        isTracking: !updatedTrackedPeople[existingIndex].isTracking
      };
      updatedPerson = updatedTrackedPeople[existingIndex];
    } else {
      // Person doesn't exist, add them with tracking enabled
      const newTrackedPerson: TrackedPerson = {
        id: candidateKey,
        name: candidate.name,
        title: candidate.title,
        company: candidate.company,
        profilePhoto: candidate.profile_photo_url || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
        trackedSince: new Date().toISOString().split('T')[0],
        lastEvent: new Date().toISOString().split('T')[0],
        isTracking: true,
        trackingReason: `Added from search: "${searchQuery}"`,
        cmi: candidate.behavioral_data?.scores.cmi.score || Math.floor(Math.random() * 40) + 60,
        rbfs: candidate.behavioral_data?.scores.rbfs.score || Math.floor(Math.random() * 40) + 30,
        ias: candidate.behavioral_data?.scores.ias.score || Math.floor(Math.random() * 40) + 60
      };
      updatedTrackedPeople = [...currentTrackedPeople, newTrackedPerson];
      updatedPerson = newTrackedPerson;
    }
    
    // Update state synchronously
    setTrackedPeople(updatedTrackedPeople);
    
    // Save to Supabase asynchronously
    if (user?.id && updatedPerson) {
      try {
        await saveTrackedPerson(user.id, updatedPerson);
      } catch (error) {
        console.error('Error saving tracked person:', error);
      }
    }
  };

  const getTrackingStatus = (candidate: Candidate): boolean => {
    // Ensure trackedPeople is an array
    if (!Array.isArray(trackedPeople)) {
      return false;
    }
    
    const candidateKey = candidate.email || candidate.name;
    const trackedPerson = trackedPeople.find(person => person.id === candidateKey);
    return trackedPerson?.isTracking || false;
  };

  // Show loading while checking auth state
  // Removed auth loading overlay to prevent brief flash during sign up/in

  // If there's a component error, show error message
  if (componentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-4">Application Error</h1>
          <p className="text-gray-300 mb-6">{componentError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading while hooks are initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          <Header 
            onLoginClick={() => setShowSignInPopup(true)}
            onIntegrationsClick={handleToggleIntegrationsModal}
          />
          {/* Main Content */}
          <MainContent onSearch={handleSearch} pendingSearch={pendingSearch} />
          
          {/* Bottom Buttons - History and Tracking */}
          {!showResults && (
            <div className="fixed bottom-12 left-6 z-30 flex items-center space-x-3">
              {/* History Button */}
              {searchHistory.length > 0 && !showHistory && (
                <button
                  onClick={handleToggleHistory}
                  className="flex items-center space-x-2 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 text-white transition-all duration-200 shadow-lg"
                  style={{ backgroundColor: '#1a2332' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fb4b76'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1a2332'; }}
                >
                  <HistoryIcon size={16} />
                  <span className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>History</span>
                </button>
              )}
              
              {/* Tracking Button */}
              {user && (
                <button
                  onClick={handleToggleTrackingModal}
                  className="flex items-center space-x-2 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 text-white transition-all duration-200 shadow-lg"
                  style={{ backgroundColor: '#1a2332' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fb4b76'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1a2332'; }}
                >
                  <span className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Tracking</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Elements - Fixed positioning */}
        {!showResults && (
          <div className="fixed bottom-4 left-0 right-0 px-4 sm:px-6 flex justify-between items-end text-xs text-white/50 z-10">
            {/* Copyright - Bottom Left */}
            <div style={{ fontFamily: 'Poppins, sans-serif' }}>
              © 2025 Knowledge All Rights Reserved
            </div>
            
            {/* Legal Links - Bottom Right */}
            <div className="flex space-x-2 sm:space-x-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <button className="hover:text-white/70 transition-colors duration-200">
                Privacy Policy
              </button>
              <span>|</span>
              <button className="hover:text-white/70 transition-colors duration-200">
                Terms of Service
              </button>
              <span>|</span>
              <button className="hover:text-white/70 transition-colors duration-200">
                Don't Sell My Info
              </button>
            </div>
          </div>
        )}
        
        <HistorySidebar 
          isVisible={showHistory}
          history={searchHistory}
          onSelectHistory={handleSelectHistory}
          onClose={handleCloseHistory}
          onClearHistory={handleClearHistory}
          onDeleteHistoryItem={handleDeleteHistoryItem}
        />
        
        <LoadingOverlay isVisible={isLoading} />
        
        <SearchResults 
          isVisible={showResults} 
          onClose={handleCloseResults}
          searchQuery={searchQuery}
          searchResults={apiSearchResults}
          apiError={currentSearchError}
          onPushToCrm={handlePushToCrm}
          onToggleTracking={handleToggleTracking}
          getTrackingStatus={getTrackingStatus}
        />
        
        <SignInPopup 
          isVisible={showSignInPopup}
          onClose={handleCloseSignInPopup}
          onSwitchToSignUp={handleSwitchToSignUp}
          onSuccess={handleAuthSuccess}
        />
        
        <SignUpPopup 
          isVisible={showSignUpPopup}
          onClose={handleCloseSignUpPopup}
          onSwitchToSignIn={handleSwitchToSignIn}
          onSuccess={handleAuthSuccess}
        />
        
        <TrackingModal 
          isVisible={showTrackingModal}
          onClose={handleCloseTrackingModal}
          trackedPeople={trackedPeople}
          onToggleTracking={(personId: string) => {
            // Calculate new state synchronously
            const currentTrackedPeople = trackedPeople;
            const updatedTrackedPeople = currentTrackedPeople.map(person => 
              person.id === personId 
                ? { ...person, isTracking: !person.isTracking }
                : person
            );
            
            // Update state synchronously
            setTrackedPeople(updatedTrackedPeople);
            
            // Save to Supabase asynchronously
            if (user?.id) {
              const updatedPerson = updatedTrackedPeople.find(person => person.id === personId);
              if (updatedPerson) {
                saveTrackedPerson(user.id, updatedPerson).catch(error => {
                  console.error('Error saving tracked person:', error);
                });
              }
            }
          }}
          onDeletePerson={async (personId: string) => {
            // Update state synchronously
            setTrackedPeople(prev => prev.filter(person => person.id !== personId));
            
            // Delete from Supabase asynchronously
            if (user?.id) {
              try {
                await deleteTrackedPerson(user.id, personId);
              } catch (error) {
                console.error('Error deleting tracked person:', error);
              }
            }
          }}
          onPushToCrm={handlePushToCrm}
        />
        
        <IntegrationsModal 
          isVisible={showIntegrationsModal}
          onClose={handleCloseIntegrationsModal}
        />
        
        <ErrorPopup 
          isVisible={showErrorPopup}
          onClose={handleCloseErrorPopup}
          errorMessage={errorMessage}
        />
        
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
      </>
    </ErrorBoundary>
  );
}

export default App;