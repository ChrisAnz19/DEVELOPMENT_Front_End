import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Linkedin } from 'lucide-react';
import { useExclusions } from '../hooks/useExclusions';

interface ExclusionsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Exclusion {
  id: number;
  linkedin_url: string;
  created_at: string;
}

const ExclusionsModal: React.FC<ExclusionsModalProps> = ({ isVisible, onClose }) => {
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [newLinkedinUrl, setNewLinkedinUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addExclusion, removeExclusion, getExclusions, isLoading, error } = useExclusions();

  useEffect(() => {
    if (isVisible) {
      loadExclusions();
    }
  }, [isVisible]);

  const loadExclusions = async () => {
    try {
      const data = await getExclusions();
      setExclusions(data);
    } catch (error) {
      console.error('Failed to load exclusions:', error);
    }
  };

  const handleAddExclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkedinUrl.trim()) return;

    setIsAdding(true);
    try {
      const newExclusion = await addExclusion(newLinkedinUrl.trim());
      setExclusions(prev => [newExclusion, ...prev]);
      setNewLinkedinUrl('');
    } catch (error) {
      console.error('Failed to add exclusion:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveExclusion = async (exclusion: Exclusion) => {
    try {
      await removeExclusion(exclusion.linkedin_url);
      setExclusions(prev => prev.filter(e => e.id !== exclusion.id));
    } catch (error) {
      console.error('Failed to remove exclusion:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const extractNameFromLinkedIn = (url: string) => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Excluded Profiles
            </h2>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Manage LinkedIn profiles to exclude from search results
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add New Exclusion */}
        <div className="p-4 sm:p-6 border-b border-white/20">
          <form onSubmit={handleAddExclusion} className="flex space-x-3">
            <div className="flex-1 relative">
              <Linkedin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="url"
                value={newLinkedinUrl}
                onChange={(e) => setNewLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/profile-name"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
                pattern="https://.*linkedin\.com/in/.*"
                title="Please enter a valid LinkedIn profile URL"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newLinkedinUrl.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              className="flex items-center space-x-2 text-white font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#79D284' }}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Plus size={16} />
              <span>{isAdding ? 'Adding...' : 'Add'}</span>
            </button>
          </form>
        </div>

        {/* Exclusions List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-hidden">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-white/70 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Loading exclusions...
              </p>
            </div>
          ) : exclusions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/40 mx-auto mb-4 text-4xl">🚫</div>
              <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No exclusions yet
              </p>
              <p className="text-white/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Add LinkedIn profiles to exclude them from future searches
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exclusions.map((exclusion) => (
                <div key={exclusion.id} className="bg-white/5 border border-white/20 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Linkedin size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {extractNameFromLinkedIn(exclusion.linkedin_url)}
                      </h4>
                      <p className="text-white/60 text-xs mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {exclusion.linkedin_url}
                      </p>
                      <p className="text-white/50 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Added {formatDate(exclusion.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveExclusion(exclusion)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    title="Remove exclusion"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExclusionsModal;