import React, { useState } from 'react';

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

interface SimpleAvatarComponentProps {
  person: TrackedPerson;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SimpleAvatarComponent: React.FC<SimpleAvatarComponentProps> = ({ 
  person, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 sm:w-14 sm:h-14 text-base',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-lg'
  };

  // Extract initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Validate photo URL - More permissive to allow valid LinkedIn photos
  const isValidPhotoUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // Only filter out obvious LinkedIn placeholder images
    const linkedinPlaceholderPatterns = [
      /static\.licdn\.com\/aero-v1\/sc\/h\/[a-zA-Z0-9]+/  // Generic LinkedIn placeholder
    ];
    
    // If it's an obvious LinkedIn placeholder, treat as invalid
    if (linkedinPlaceholderPatterns.some(pattern => pattern.test(url))) {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Generate consistent color based on name
  const generateColorFromName = (name: string): { background: string; text: string } => {
    const colors = [
      { background: '#fb4b76', text: '#ffffff' }, // Pink (your brand color)
      { background: '#3b82f6', text: '#ffffff' }, // Blue
      { background: '#10b981', text: '#ffffff' }, // Green
      { background: '#f59e0b', text: '#ffffff' }, // Amber
      { background: '#8b5cf6', text: '#ffffff' }, // Purple
      { background: '#ef4444', text: '#ffffff' }, // Red
      { background: '#06b6d4', text: '#ffffff' }, // Cyan
      { background: '#84cc16', text: '#ffffff' }, // Lime
    ];
    
    // Generate hash from name for consistent color assignment
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Show initials fallback (either no photo or photo failed to load)
  if (imageError || !isValidPhotoUrl(person.profilePhoto)) {
    const colors = generateColorFromName(person.name);
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold border-2 border-white/20 ${className}`}
        style={{ 
          backgroundColor: colors.background,
          color: colors.text
        }}
      >
        {getInitials(person.name)}
      </div>
    );
  }

  // Show photo
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/20 ${className}`}>
      <img
        src={person.profilePhoto}
        alt={person.name}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default SimpleAvatarComponent;
