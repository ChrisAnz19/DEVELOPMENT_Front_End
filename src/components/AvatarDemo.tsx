import React from 'react';
import AvatarComponent from './AvatarComponent';
import SimpleAvatarComponent from './SimpleAvatarComponent';

// Mock data for testing
const mockCandidate = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  title: 'CEO',
  company: 'Tech Corp',
  accuracy: 95,
  reasons: ['Strong leadership experience', 'Industry expertise'],
  profile_photo_url: 'https://example.com/photo.jpg', // This will fail to load, triggering fallback
  linkedin_url: 'https://linkedin.com/in/johnsmith',
  linkedin_profile: {
    profile_picture: 'https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2' // LinkedIn fallback
  },
  evidence_urls: [],
  evidence_summary: null,
  evidence_confidence: null,
  evidence_processing_time: null,
  behavioral_data: null,
  phone: null,
  mobile: null,
  location: null
};

const mockTrackedPerson = {
  id: '1',
  name: 'Jane Doe',
  title: 'CTO',
  company: 'Innovation Inc',
  profilePhoto: 'https://example.com/jane.jpg', // This will fail to load, triggering fallback
  trackedSince: '2024-01-15',
  lastEvent: '2024-01-20',
  isTracking: true,
  trackingReason: 'Evaluating enterprise solutions',
  cmi: 85,
  rbfs: 70,
  ias: 90
};

const AvatarDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Avatar Component Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AvatarComponent Demo */}
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              AvatarComponent (Search Results)
            </h2>
            <p className="text-gray-300 mb-4">
              Used in search results with Candidate interface. Automatically detects LinkedIn fallback images and generates consistent initials avatars.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <AvatarComponent candidate={mockCandidate} size="sm" />
                <div>
                  <p className="text-white font-medium">Small Size</p>
                  <p className="text-gray-400 text-sm">w-10 h-10</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <AvatarComponent candidate={mockCandidate} size="md" />
                <div>
                  <p className="text-white font-medium">Medium Size</p>
                  <p className="text-gray-400 text-sm">w-12 h-12 sm:w-14 sm:h-14</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <AvatarComponent candidate={mockCandidate} size="lg" />
                <div>
                  <p className="text-white font-medium">Large Size</p>
                  <p className="text-gray-400 text-sm">w-16 h-16 sm:w-20 sm:h-20</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Features:</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Automatic LinkedIn fallback detection</li>
                <li>• Consistent color generation based on name</li>
                <li>• Smooth fallback from photos to initials</li>
                <li>• Loading states with spinners</li>
                <li>• Responsive sizing</li>
              </ul>
            </div>
          </div>
          
          {/* SimpleAvatarComponent Demo */}
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              SimpleAvatarComponent (Modals)
            </h2>
            <p className="text-gray-300 mb-4">
              Used in PersonDetailModal and TrackingModal with TrackedPerson interface. Simplified version for modal displays.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <SimpleAvatarComponent person={mockTrackedPerson} size="sm" />
                <div>
                  <p className="text-white font-medium">Small Size</p>
                  <p className="text-gray-400 text-sm">w-10 h-10</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <SimpleAvatarComponent person={mockTrackedPerson} size="md" />
                <div>
                  <p className="text-white font-medium">Medium Size</p>
                  <p className="text-gray-400 text-sm">w-12 h-12 sm:w-14 sm:h-14</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <SimpleAvatarComponent person={mockTrackedPerson} size="lg" />
                <div>
                  <p className="text-white font-medium">Large Size</p>
                  <p className="text-gray-400 text-sm">w-16 h-16 sm:w-20 sm:h-20</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-500/20 rounded-lg">
              <h3 className="text-green-400 font-medium mb-2">Features:</h3>
              <ul className="text-green-300 text-sm space-y-1">
                <li>• Simplified interface for modals</li>
                <li>• Same color generation algorithm</li>
                <li>• Automatic fallback handling</li>
                <li>• Consistent with main avatar component</li>
                <li>• Optimized for modal usage</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Integration Notes */}
        <div className="mt-8 bg-yellow-500/20 rounded-lg p-6">
          <h3 className="text-yellow-400 font-medium mb-4 text-lg">
            🎯 Integration Complete!
          </h3>
          <div className="text-yellow-300 space-y-2">
            <p><strong>✅ SearchResults.tsx:</strong> Now uses AvatarComponent for enhanced avatar display</p>
            <p><strong>✅ PersonDetailModal.tsx:</strong> Uses SimpleAvatarComponent for consistent avatar rendering</p>
            <p><strong>✅ TrackingModal.tsx:</strong> Uses SimpleAvatarComponent for tracked people avatars</p>
            <p><strong>✅ Automatic Fallback:</strong> LinkedIn photos automatically fall back to generated initials</p>
            <p><strong>✅ Consistent Colors:</strong> Each person gets a consistent color based on their name</p>
            <p><strong>✅ Responsive Design:</strong> Avatars scale appropriately across different screen sizes</p>
          </div>
        </div>
        
        {/* Backend Integration Notes */}
        <div className="mt-6 bg-blue-500/20 rounded-lg p-6">
          <h3 className="text-blue-400 font-medium mb-4 text-lg">
            🔗 Backend Integration Ready
          </h3>
          <div className="text-blue-300 space-y-2">
            <p>The frontend is now ready to integrate with your enhanced backend avatar system:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Avatar generation functions with initials extraction</li>
              <li>Enhanced API responses with avatar metadata</li>
              <li>Photo validation with automatic fallback detection</li>
              <li>Caching and performance optimizations</li>
              <li>Comprehensive unit and integration tests</li>
            </ul>
            <p className="mt-4 text-blue-200">
              <strong>Next Step:</strong> Your backend team can now deploy the enhanced avatar system, and the frontend will automatically use the new avatar metadata when available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;
