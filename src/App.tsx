import React from 'react';
import { useState } from 'react';
import { History } from 'lucide-react';
import { useKnowledgeGPT, SearchResponse } from './hooks/useKnowledgeGPT';
import { useAuth } from './hooks/useAuth';
import { useSearchApi } from './hooks/useSearchApi'; // New import for useSearchApi
import { 
  loadSearchHistory, 
  saveSearchHistory, 
  clearSearchHistory,
  loadTrackedPeople,
  saveTrackedPerson,
  deleteTrackedPerson,
  HistoryItem,
  TrackedPerson
} from './lib/supabaseData';
import Header from './components/Header';
import MainContent from './components/MainContent';
import LoadingOverlay from './components/LoadingOverlay';
import SearchResults from './components/SearchResults';
import HistorySidebar from './components/HistorySidebar';
import SignInPopup from './components/SignInPopup';
import SignUpPopup from './components/SignUpPopup';
import TrackingModal from './components/TrackingModal';
import ErrorPopup from './components/ErrorPopup';

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
  const [apiSearchResults, setApiSearchResults] = useState<SearchResponse | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newApiSearchId, setNewApiSearchId] = useState<number | null>(null); // New state for the new API's search ID
  const [pendingSearch, setPendingSearch] = useState<string>(''); // Store search query for after auth
  
  const { createSearch, pollSearchResult, isLoading: apiLoading, error: apiError } = useKnowledgeGPT();
  const { user, loading: authLoading } = useAuth();
  const { createSearchRecord, addPersonToSearchRecord } = useSearchApi(); // New hook usage

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
    if (!user) {
      setPendingSearch(query); // Store the search query
      setShowSignInPopup(true);
      return;
    }

    setSearchQuery(query);
    setShowResults(false);
    setApiSearchResults(null);
    console.log('🎯 Setting isLoading to true');
    setIsLoading(true);
    
    // Perform actual API search
    const performSearch = async () => {
      try {
        // 1. Call existing KnowledgeGPT API to initiate search
        console.log('Creating search for:', query);
        const requestId = await createSearch(query, 2); // Request 2 candidates
        console.log('KnowledgeGPT Search created with ID:', requestId);

        // 2. Call new User Database API to create a search record
        if (user) { // Only create search record if user is authenticated
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
            // Decide how to handle this error (e.g., show a popup, but continue with KnowledgeGPT search)
          }
        } else {
          console.warn('User not authenticated, skipping creation of new API search record.');
          setNewApiSearchId(null); // Ensure it's null if no user
        }
        
        // 3. Poll for KnowledgeGPT results
        console.log('Polling for KnowledgeGPT results...');
        const result = await pollSearchResult(requestId);
        console.log('KnowledgeGPT Search completed:', result);
        
        if (result.status === 'completed') {
          setApiSearchResults(result);
          setShowResults(true);
        } else if (result.status === 'failed') {
          console.error('KnowledgeGPT Search failed:', result.error);
          setErrorMessage(result.error || 'Search failed');
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
        if (user?.id && result.status === 'completed') {
          await saveSearchHistory(user.id, newHistoryItem);
        }
        
        setShowHistory(false); // Hide history when showing results
        
      } catch (error) {
        console.error('Search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
    // Don't automatically show history - let user choose
  };

  const handleSelectHistory = (historyItem: HistoryItem) => {
    setShowHistory(false); // Hide history when starting new search
    
    // Set the search query and results from history
    setSearchQuery(historyItem.query);
    
    if (historyItem.results) {
      // Show stored results
      setApiSearchResults(historyItem.results);
      setShowResults(true);
    } else if (historyItem.error) {
      // Show stored error
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

  return (
    <>
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <Header 
          onLoginClick={() => setShowSignInPopup(true)}
        />
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
                <History size={16} />
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
        apiError={apiError}
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
      <ErrorPopup 
        isVisible={showErrorPopup}
        onClose={handleCloseErrorPopup}
        errorMessage={errorMessage}
      />
    </>
  );
}

export default App;