import React from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SignInPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess?: () => void;
}

const SignInPopup: React.FC<SignInPopupProps> = ({ isVisible, onClose, onSwitchToSignUp, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { signIn } = useAuth();

  if (!isVisible) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await signIn(formData.email, formData.password);
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      if (errorMessage.includes('Email not confirmed')) {
        setSubmitError('Your email address has not been confirmed. Please check your inbox for a confirmation link.');
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fb4b76' }}>
              <User size={16} className="text-white" />
            </div>
            <h2 className="text-white text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Sign In Required
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 transition-all duration-200"
            onMouseEnter={(e) => e.currentTarget.style.color = '#fb4b76'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-white/80 text-sm mb-6 text-center leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Please sign in to save your search history and access personalized results.
          </p>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                {submitError}
              </p>
            </div>
          )}
          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4 mb-6">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 text-sm focus:outline-none focus:border-pink-500 transition-all duration-200"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
                required
              />
            </div>
            
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 text-sm focus:outline-none focus:border-pink-500 transition-all duration-200"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
              onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.backgroundColor = '#fb4b76'; e.currentTarget.style.borderColor = '#fb4b76'; } }}
              onMouseLeave={(e) => { if (!isSubmitting) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = ''; } }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>



          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button 
              className="text-white/60 text-xs transition-colors duration-200" 
              style={{ fontFamily: 'Clash Display, sans-serif' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fb4b76'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPopup;