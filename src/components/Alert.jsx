import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose }) => {
  const config = {
    info: {
      icon: <FiInfo className="w-5 h-5" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
    },
    success: {
      icon: <FiCheckCircle className="w-5 h-5" />,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
    },
    warning: {
      icon: <FiAlertCircle className="w-5 h-5" />,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
    },
    error: {
      icon: <FiXCircle className="w-5 h-5" />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
    },
  };

  const { icon, bg, border, text } = config[type];

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 mb-4 animate-slide-up`}>
      <div className="flex items-start">
        <div className={`${text} mr-3 mt-0.5`}>{icon}</div>
        <div className="flex-1">
          <p className={`${text} text-sm`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${text} hover:opacity-80 transition-opacity`}
          >
            <FiXCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;