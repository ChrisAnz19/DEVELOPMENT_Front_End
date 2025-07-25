import React from 'react';
import { useState } from 'react';
import { User, History, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onToggleHistory?: () => void;
  showHistoryButton?: boolean;
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleHistory, showHistoryButton = false, onLoginClick }) => {
  const { user, userProfile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        {/* Knowledge Logo - Left */}
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="h-8 sm:h-10 w-auto object-contain"
            onError={(e) => {
              console.log('Logo failed to load');
              // Fallback to text if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.style.display = 'block';
            }}
          />
          <span 
            className="text-white font-semibold text-base sm:text-lg hidden" 
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Knowledge
          </span>
        </div>

        {/* Auth Button - Right */}
        {user ? (
          <div className="relative flex items-center space-x-2">
            {/* User Initials Icon */}
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 hover:bg-white/20 transition-all duration-200"
            >
              {/* Initials Circle */}
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#79D284' }}>
                <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {userProfile 
                    ? `${userProfile.first_name.charAt(0).toUpperCase()}${userProfile.last_name.charAt(0).toUpperCase()}`
                    : user.email.charAt(0).toUpperCase()
                  }
                </span>
              </div>
              {/* Name - Hidden on mobile, shown on larger screens */}
              <span className="hidden sm:inline text-xs font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user.email}
              </span>
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-white text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user.email}
                    </p>
                    <p className="text-white/70 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {user.email}
                    </p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 mt-1"
                  >
                    <LogOut size={14} />
                    <span className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-white hover:bg-white/20 transition-all duration-200"
          >
            <User size={14} className="sm:w-4 sm:h-4" />
            <span className="text-xs font-medium hidden sm:inline">Login</span>
            <span className="text-xs font-medium sm:hidden">Log</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;