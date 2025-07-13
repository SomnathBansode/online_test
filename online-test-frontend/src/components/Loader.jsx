import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';

const Loader = ({ 
  size = 20,
  lightColor = '#a1724e', 
  darkColor = '#4ade80',
  className = '',
  strokeWidth = 2.5,
  message = '',
  inline = false
}) => {
  const { isDark } = useTheme();
  const color = isDark ? darkColor : lightColor;
  
  const containerClasses = inline 
    ? `inline-flex items-center gap-2 ${className}`
    : `flex items-center gap-2 ${className}`;

  return (
    <div className={containerClasses}>
      <Loader2
        className="animate-spin"
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        aria-hidden="true"
      />
      {message && <span className="text-sm text-current">{message}</span>}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.number,
  lightColor: PropTypes.string,
  darkColor: PropTypes.string,
  className: PropTypes.string,
  strokeWidth: PropTypes.number,
  message: PropTypes.string,
  inline: PropTypes.bool
};

export default Loader;