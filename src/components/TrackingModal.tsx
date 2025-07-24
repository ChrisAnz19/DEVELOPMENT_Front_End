import React, { useState } from 'react';
import { X, Eye, EyeOff, TrendingUp, Shield, Heart, Trash2 } from 'lucide-react';
import PersonDetailModal from './PersonDetailModal';

interface TrackedPerson {
  id: string;
  name: string;
  title: string;
  company: string;
  profilePhoto: string;
  trackedSince: string;
  lastEvent: string;
  isTracking: boolean;
  trackingReason: string;
  cmi: number;
  rbfs: number;
  ias: number;
}

interface TrackingModalProps {
  isVisible: boolean;
  onClose: () => void;
  trackedPeople: TrackedPerson[];
  onToggleTracking: (personId: string) => void;
  onDeletePerson?: (personId: string) => void;
  onPushToCrm?: () => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ 
  isVisible, 
  onClose, 
  trackedPeople, 
  onToggleTracking,
  onDeletePerson,
  onPushToCrm
}) => {
  const [selectedPerson, setSelectedPerson] = useState<TrackedPerson | null>(null);
  const [showPersonDetail, setShowPersonDetail] = useState(false);

  if (!isVisible) return null;

  const handleToggleTracking = (personId: string) => {
    onToggleTracking(personId);
  };

  const handleDeletePerson = (personId: string) => {
    if (onDeletePerson) {
      onDeletePerson(personId);
    }
  };

  const handlePersonClick = (person: TrackedPerson) => {
    setSelectedPerson(person);
    setShowPersonDetail(true);
  };

  const handleClosePersonDetail = () => {
    setShowPersonDetail(false);
    setSelectedPerson(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get initials from person name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Real-Time Tracking
            </h2>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Continuously track engagement and receive instant alerts whenever a key action occurs
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-white/80 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Person
                  </th>
                  <th className="text-left py-3 px-2 text-white/80 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Title
                  </th>
                  <th className="text-left py-3 px-2 text-white/80 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Company
                  </th>
                  <th className="text-left py-3 px-2 text-white/80 font-medium text-sm whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif', minWidth: '120px' }}>
                    Tracked Since
                  </th>
                  <th className="text-left py-3 px-2 text-white/80 font-medium text-sm whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif', minWidth: '120px' }}>
                    Last Event
                  </th>
                  <th className="text-center py-3 px-2 text-white/80 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Tracking
                  </th>
                </tr>
              </thead>
              <tbody>
                {trackedPeople.map((person) => (
                  <tr key={person.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                    <td className="py-4 px-2" onClick={() => handlePersonClick(person)}>
                      <div className="flex items-start space-x-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <img
                            src={person.profilePhoto}
                            alt={person.name}
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
                            className="initials-fallback hidden absolute inset-0 w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white/20"
                            style={{ backgroundColor: '#79D284' }}
                          >
                            {getInitials(person.name)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {person.name}
                          </div>
                          <div className="text-white/60 text-xs mb-2 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {person.trackingReason}
                          </div>
                          <div className="flex items-center space-x-3">
                            {/* CMI Score */}
                            <div className="flex items-center space-x-1 relative group">
                              <TrendingUp size={10} className="text-blue-400" />
                              <span className="text-blue-400 font-medium text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {person.cmi}
                              </span>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg border border-gray-700 w-48">
                                  <div className="font-semibold mb-1">Commitment Momentum Index (CMI)</div>
                                  <div className="text-gray-300">Forward motion vs. idle curiosity—i.e., is the person merely researching or already lining up next steps?</div>
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* RBFS Score */}
                            <div className="flex items-center space-x-1 relative group">
                              <Shield size={10} className="text-yellow-400" />
                              <span className="text-yellow-400 font-medium text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {person.rbfs}
                              </span>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg border border-gray-700 w-48">
                                  <div className="font-semibold mb-1">RBFS: Risk-Barrier Focus</div>
                                  <div className="text-gray-300">How sensitive the person is to downside and friction.</div>
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* IAS Score */}
                            <div className="flex items-center space-x-1 relative group">
                              <Heart size={10} className="text-purple-400" />
                              <span className="text-purple-400 font-medium text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {person.ias}
                              </span>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg border border-gray-700 w-48">
                                  <div className="font-semibold mb-1">IAS: Identity Alignment</div>
                                  <div className="text-gray-300">Whether the choice aligns with their self-image and personal goals.</div>
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2" onClick={() => handlePersonClick(person)}>
                      <span className="text-white/80 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {person.title}
                      </span>
                    </td>
                    <td className="py-4 px-2" onClick={() => handlePersonClick(person)}>
                      <span className="text-white/80 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {person.company}
                      </span>
                    </td>
                    <td className="py-4 px-2" onClick={() => handlePersonClick(person)}>
                      <span className="text-white/70 text-sm whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatDate(person.trackedSince)}
                      </span>
                    </td>
                    <td className="py-4 px-2" onClick={() => handlePersonClick(person)}>
                      <span className="text-white/70 text-sm whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatDate(person.lastEvent)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTracking(person.id);
                          }}
                          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                            person.isTracking
                              ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                              : 'bg-white/10 border-white/20 text-white/50 hover:bg-white/20'
                          }`}
                        >
                          {person.isTracking ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>
                        
                        {/* Delete button - only show when tracking is off */}
                        {!person.isTracking && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePerson(person.id);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                            title="Delete person"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {trackedPeople.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No tracked prospects yet
              </p>
              <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Start tracking prospects from your search results
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Person Detail Modal */}
      <PersonDetailModal
        isVisible={showPersonDetail}
        onClose={handleClosePersonDetail}
        person={selectedPerson}
        onToggleTracking={onToggleTracking}
        onPushToCrm={onPushToCrm}
      />
    </div>
  );
};

export default TrackingModal;