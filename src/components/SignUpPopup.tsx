import React, { useState } from 'react';
import { X, User, Mail, Building, Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SignUpPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onSuccess?: () => void;
}

const SignUpPopup: React.FC<SignUpPopupProps> = ({ isVisible, onClose, onSwitchToSignIn, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
    companyWebsite: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signUp } = useAuth();

  if (!isVisible) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          company_website: formData.companyWebsite
        }
      );
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        company: '',
        companyWebsite: ''
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#79D284' }}>
              <User size={16} className="text-white" />
            </div>
            <h2 className="text-white text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Create Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-white/80 text-sm mb-6 text-center leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join Knowledge to access the first ever contextual AI search.
          </p>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {submitError}
              </p>
            </div>
          )}
          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-3">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  required
                />
              </div>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Company */}
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company name"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
              />
            </div>

            {/* Company Website */}
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                placeholder="Company website"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm mt-4"
              style={{ backgroundColor: '#79D284' }}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <div className="text-center mt-4">
            <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              By creating an account, you agree to our{' '}
              <button className="text-white/70 hover:text-white/90 underline transition-colors duration-200">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-white/70 hover:text-white/90 underline transition-colors duration-200">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPopup;