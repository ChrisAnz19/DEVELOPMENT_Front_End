import React from 'react';

interface SpinningWheelProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'pink';
  className?: string;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-400',
    white: 'text-white',
    pink: 'text-pink-400'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full animate-spin" style={{ animationDuration: '2s' }}>
        {/* Six circles arranged in a circle - one turns pink at a time */}
        <div className="static-circles">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`circle circle-${index} absolute w-2.5 h-2.5 rounded-full ${
                index === 0 ? 'bg-pink-400' : 'bg-white'
              }`}
              style={{
                transform: `rotate(${index * 60}deg) translateY(-${size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px'})`,
                left: '50%',
                top: '50%',
                marginLeft: '-5px',
                marginTop: '-5px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpinningWheel; 