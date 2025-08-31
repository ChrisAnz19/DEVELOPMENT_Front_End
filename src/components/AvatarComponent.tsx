import React, { useState, useEffect } from 'react';
import { Candidate } from '../hooks/useKnowledgeGPT';

interface AvatarComponentProps {
  candidate: Candidate;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface AvatarMetadata {
  has_linkedin_fallback: boolean;
  avatar_type: 'photo' | 'initials' | 'generated';
  initials_color: string;
  initials_background: string;
  photo_url?: string;
  initials?: string;
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({ 
  candidate, 
  size = 'md',
  className = '' 
}) => {
  const [avatarMetadata, setAvatarMetadata] = useState<AvatarMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 sm:w-14 sm:h-14 text-base',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-lg'
  };

  // Extract initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate photo URL - More permissive to allow valid LinkedIn photos
  const isValidPhotoUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') {
      console.log('❌ AvatarComponent: URL validation failed - no URL or not string:', url);
      return false;
    }
    
    // Only filter out obvious LinkedIn placeholder images
    const linkedinPlaceholderPatterns = [
      /static\.licdn\.com\/aero-v1\/sc\/h\/[a-zA-Z0-9]+/  // Generic LinkedIn placeholder
    ];
    
    // If it's an obvious LinkedIn placeholder, treat as invalid
    if (linkedinPlaceholderPatterns.some(pattern => pattern.test(url))) {
      console.log('❌ AvatarComponent: URL rejected as LinkedIn placeholder:', url);
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      console.log(`✅ AvatarComponent: URL validation ${isValid ? 'passed' : 'failed'} for:`, url);
      return isValid;
    } catch (error) {
      console.log('❌ AvatarComponent: URL validation error for:', url, error);
      return false;
    }
  };

  // Get profile photo with enhanced logic
  const getProfilePhoto = (candidate: Candidate): string | null => {
    console.log('🔍 AvatarComponent: Checking photo for candidate:', candidate.name);
    console.log('🔍 AvatarComponent: profile_photo_url:', candidate.profile_photo_url);
    console.log('🔍 AvatarComponent: linkedin_profile:', candidate.linkedin_profile);
    
    // Priority 1: Use the actual profile photo URL if available and valid
    if (candidate.profile_photo_url && isValidPhotoUrl(candidate.profile_photo_url)) {
      console.log('✅ AvatarComponent: Using profile_photo_url:', candidate.profile_photo_url);
      return candidate.profile_photo_url;
    }
    
    // Priority 2: Check LinkedIn profile picture fields
    if (candidate.linkedin_profile?.profile_picture && isValidPhotoUrl(candidate.linkedin_profile.profile_picture)) {
      console.log('✅ AvatarComponent: Using LinkedIn profile_picture:', candidate.linkedin_profile.profile_picture);
      return candidate.linkedin_profile.profile_picture;
    }
    
    // Priority 3: Check alternative LinkedIn photo field names
    if (candidate.linkedin_profile) {
      const possiblePhotoFields = ['profile_picture', 'picture', 'photo', 'avatar', 'image', 'profileImage', 'profilePhoto'];
      for (const field of possiblePhotoFields) {
        const photoUrl = (candidate.linkedin_profile as any)[field];
        if (photoUrl && isValidPhotoUrl(photoUrl)) {
          console.log(`✅ AvatarComponent: Using LinkedIn ${field}:`, photoUrl);
          return photoUrl;
        }
      }
    }
    
    console.log('❌ AvatarComponent: No valid photo found, will show initials');
    return null;
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

  useEffect(() => {
    const initializeAvatar = async () => {
      console.log('🚀 AvatarComponent: Initializing avatar for:', candidate.name);
      setIsLoading(true);
      setImageError(false);
      setShowFallback(false);

      const photoUrl = getProfilePhoto(candidate);
      console.log('🔍 AvatarComponent: Photo URL result:', photoUrl);
      
      if (photoUrl) {
        // We have a valid photo URL
        console.log('✅ AvatarComponent: Setting photo metadata for:', photoUrl);
        setAvatarMetadata({
          has_linkedin_fallback: false,
          avatar_type: 'photo',
          initials_color: '#ffffff',
          initials_background: '#fb4b76',
          photo_url: photoUrl
        });
      } else {
        // No valid photo, generate initials avatar
        console.log('🔄 AvatarComponent: No photo, generating initials for:', candidate.name);
        const colors = generateColorFromName(candidate.name);
        setAvatarMetadata({
          has_linkedin_fallback: true,
          avatar_type: 'initials',
          initials_color: colors.text,
          initials_background: colors.background,
          initials: getInitials(candidate.name)
        });
        setShowFallback(true);
      }
      
      setIsLoading(false);
    };

    initializeAvatar();
  }, [candidate]);

  // Handle image load success
  const handleImageLoad = () => {
    console.log('✅ AvatarComponent: Image loaded successfully for:', candidate.name);
    setImageError(false);
    setShowFallback(false);
    setIsLoading(false);
  };

  // Handle image load error
  const handleImageError = () => {
    console.log('❌ AvatarComponent: Image failed to load for:', candidate.name);
    setImageError(true);
    setShowFallback(true);
    setIsLoading(false);
    
    // Generate fallback colors if we don't have them
    if (!avatarMetadata?.initials_background) {
      const colors = generateColorFromName(candidate.name);
      setAvatarMetadata(prev => prev ? {
        ...prev,
        initials_color: colors.text,
        initials_background: colors.background,
        initials: getInitials(candidate.name)
      } : null);
    }
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-white/10 border-2 border-white/20 animate-pulse ${className}`}>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show initials fallback (either no photo or photo failed to load)
  if (showFallback || imageError || !avatarMetadata?.photo_url) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold border-2 border-white/20 ${className}`}
        style={{ 
          backgroundColor: avatarMetadata?.initials_background || '#fb4b76',
          color: avatarMetadata?.initials_color || '#ffffff'
        }}
      >
        {avatarMetadata?.initials || getInitials(candidate.name)}
      </div>
    );
  }

  // Show photo
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/20 ${className}`}>
      <img
        src={avatarMetadata.photo_url}
        alt={candidate.name}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default AvatarComponent;
