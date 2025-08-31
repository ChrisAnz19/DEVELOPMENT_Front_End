import React, { useState } from 'react';
import { X, Target, Mail, Linkedin, Phone, Eye, EyeOff, ChevronDown, ChevronUp, ChevronRight, Brain, TrendingUp, TrendingDown, Shield, Heart } from 'lucide-react';
import SimpleAvatarComponent from './SimpleAvatarComponent';

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

interface PersonDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  person: TrackedPerson | null;
  onToggleTracking: (personId: string) => void;
  onPushToCrm?: () => void;
}

const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ 
  isVisible, 
  onClose, 
  person,
  onToggleTracking,
  onPushToCrm
}) => {
  const [showPhoneNumbers, setShowPhoneNumbers] = useState(false);
  const [expandedBehavioralSection, setExpandedBehavioralSection] = useState(false);

  if (!isVisible || !person) return null;

  const handleTogglePhone = () => {
    setShowPhoneNumbers(!showPhoneNumbers);
  };

  const toggleBehavioralSection = () => {
    setExpandedBehavioralSection(!expandedBehavioralSection);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <SimpleAvatarComponent 
              person={person}
              size="lg"
              className="flex-shrink-0"
            />
            <div>
              <h2 className="text-white text-lg sm:text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {person.name}
              </h2>
              <p className="text-white/80 text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {person.title}
              </p>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {person.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Tracking Status Box */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white/90 font-medium text-sm mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Real Time Tracking
                </h4>
                <p className="text-white/70 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tracked since {formatDate(person.trackedSince)}
                </p>
              </div>
              <button
                disabled={true}
                                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-not-allowed opacity-60 ${
                    person.isTracking
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                  }`}
              >
                {person.isTracking ? (
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
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/80 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {person.trackingReason}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white/90 font-medium text-sm mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Contact Information
            </h4>
            <div className="flex items-center space-x-3 mb-4">
              <button 
                className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
              >
                <Linkedin size={16} className="text-white/70 group-hover:text-white" />
              </button>
              <button 
                className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
              >
                <Mail size={16} className="text-white/70 group-hover:text-white" />
              </button>
              <button 
                onClick={handleTogglePhone}
                className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
              >
                <Phone size={16} className="text-white/70 group-hover:text-white" />
              </button>
              
              {/* Phone Numbers - Inline */}
              {showPhoneNumbers && (
                <div className="flex flex-col space-y-1 ml-4 min-w-[220px]">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex justify-between items-center">
                    <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Direct:
                    </span>
                    <span className="text-white text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      +1 (555) 123-4567
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex justify-between items-center">
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
          </div>

          {/* Behavioral Analysis */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
            <button
              onClick={toggleBehavioralSection}
              className="w-full flex items-center justify-between hover:bg-white/5 rounded-lg py-3 px-3 -m-2 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <Brain size={16} className="text-blue-400" />
                <h4 className="text-white/90 font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Behavioral Analysis
                </h4>
              </div>
              <div className="text-white/50">
                {expandedBehavioralSection ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
            </button>
            
            {expandedBehavioralSection && (
              <>
                {/* Behavioral Intelligence Gauges */}
                <div className="mb-6">
                  <h5 className="text-white/90 font-medium text-sm mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Behavioral Scores:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Communication Maturity Index */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
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
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {person.cmi}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${person.cmi}%` }}></div>
                      </div>
                      {/* CMI Line Chart */}
                      <div className="mt-2">
                        <svg width="100%" height="20" viewBox="0 0 100 20" className="mb-1">
                          <defs>
                            <linearGradient id="cmiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <polyline
                            fill="none"
                            stroke="url(#cmiGradient)"
                            strokeWidth="1.5"
                            points={(() => {
                              const currentScore = person.cmi;
                              const range = 10; // Show ±5 points around current score
                              const minY = Math.max(0, currentScore - 5);
                              const maxY = Math.min(100, currentScore + 5);
                              const dataPoints = [
                                minY + 1,
                                minY + 2,
                                minY + 1.5,
                                minY + 3,
                                minY + 4,
                                currentScore
                              ];
                              return dataPoints.map((point, index) => {
                                const x = (index / 5) * 100;
                                const y = 20 - ((point - minY) / range) * 20;
                                return `${x},${y}`;
                              }).join(' ');
                            })()}
                          />
                        </svg>
                        <div className="flex justify-between text-[8px] text-white/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <span>6mo</span>
                          <span>Now</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk-Barrier Focus Score */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
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
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {person.rbfs}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full" style={{ width: `${person.rbfs}%` }}></div>
                      </div>
                      {/* RBFS Line Chart */}
                      <div className="mt-2">
                        <svg width="100%" height="20" viewBox="0 0 100 20" className="mb-1">
                          <defs>
                            <linearGradient id="rbfsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <polyline
                            fill="none"
                            stroke="url(#rbfsGradient)"
                            strokeWidth="1.5"
                            points={(() => {
                              const currentScore = person.rbfs;
                              const range = 10; // Show ±5 points around current score
                              const minY = Math.max(0, currentScore - 5);
                              const maxY = Math.min(100, currentScore + 5);
                              const dataPoints = [
                                minY + 4,
                                minY + 3.5,
                                minY + 2,
                                minY + 1.5,
                                minY + 1,
                                currentScore
                              ];
                              return dataPoints.map((point, index) => {
                                const x = (index / 5) * 100;
                                const y = 20 - ((point - minY) / range) * 20;
                                return `${x},${y}`;
                              }).join(' ');
                            })()}
                          />
                        </svg>
                        <div className="flex justify-between text-[8px] text-white/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <span>6mo</span>
                          <span>Now</span>
                        </div>
                      </div>
                    </div>

                    {/* Identity Alignment Signal */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
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
                        <div className="flex items-center space-x-1">
                          <span className="text-purple-400 font-semibold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {person.ias}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full" style={{ width: `${person.ias}%` }}></div>
                      </div>
                      {/* IAS Line Chart */}
                      <div className="mt-2">
                        <svg width="100%" height="20" viewBox="0 0 100 20" className="mb-1">
                          <defs>
                            <linearGradient id="iasGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <polyline
                            fill="none"
                            stroke="url(#iasGradient)"
                            strokeWidth="1.5"
                            points={(() => {
                              const currentScore = person.ias;
                              const range = 10; // Show ±5 points around current score
                              const minY = Math.max(0, currentScore - 5);
                              const maxY = Math.min(100, currentScore + 5);
                              const dataPoints = [
                                minY + 0.5,
                                minY + 1,
                                minY + 2,
                                minY + 3,
                                minY + 4,
                                currentScore
                              ];
                              return dataPoints.map((point, index) => {
                                const x = (index / 5) * 100;
                                const y = 20 - ((point - minY) / range) * 20;
                                return `${x},${y}`;
                              }).join(' ');
                            })()}
                          />
                        </svg>
                        <div className="flex justify-between text-[8px] text-white/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <span>6mo</span>
                          <span>Now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            

          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-white/90 font-medium text-sm mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Recent Activity
            </h4>
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Visited company website
                  </span>
                  <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    2 hours ago
                  </span>
                </div>
                <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Spent 4 minutes on pricing page
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Downloaded whitepaper
                  </span>
                  <span className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Yesterday
                  </span>
                </div>
                <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  "Enterprise Cloud Migration Best Practices"
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonDetailModal;