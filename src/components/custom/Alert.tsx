import React, { useEffect, useState } from 'react';

type AlertProps = {
  variant: 'info' | 'danger' | 'success' | 'warning' | 'dark';
  title?: string;
  body: string;
  showCloseButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
};

export const Alert: React.FC<AlertProps> = ({ variant, title, body, showCloseButton = false, isOpen = true, onClose, className }) => {
  const [closed, setClosed] = useState(false);

  const handleClose = () => {
    setClosed(true);
    if (onClose) {
        onClose(); 
    }
  };

  useEffect(() => {
    setClosed(!isOpen); // Promijeni zatvoreno stanje kada se promijeni isOpen prop
  }, [isOpen]);

  let backgroundColor = '';
  let textColor = '';
  let borderColor = '';
  let iconColor = '';
  let darkTextColor = '';
  let darkBackgroundColor = 'bg-gray-800';
  let darkBorderColor = '';

  switch (variant) {
    case 'info':
      backgroundColor = 'bg-default-50';
      textColor = 'text-blue-400';
      borderColor = 'border-blue-700';
      iconColor = 'text-blue-400';
      darkTextColor = 'text-blue-800';
      darkBorderColor = 'border-blue-400';
      break;
    case 'danger':
      backgroundColor = 'bg-default-50';
      textColor = 'text-red-400';
      borderColor = 'border-red-700';
      iconColor = 'text-red-400';
      darkTextColor = 'text-red-800';
      darkBorderColor = 'border-red-400';
      break;
    case 'success':
      backgroundColor = 'bg-default-50';
      textColor = 'text-green-400';
      borderColor = 'border-green-700';
      iconColor = 'text-green-400';
      darkTextColor = 'text-green-800';
      darkBorderColor = 'border-green-400';
      break;
    case 'warning':
      backgroundColor = 'bg-default-50';
      textColor = 'text-yellow-400';
      borderColor = 'border-yellow-700';
      iconColor = 'text-yellow-400';
      darkTextColor = 'text-yellow-800';
      darkBorderColor = 'border-yellow-400';
      break;
    case 'dark':
      backgroundColor = 'bg-default-50';
      textColor = 'text-gray-400';
      borderColor = 'border-gray-700';
      iconColor = 'text-gary-400';
      darkTextColor = 'text-gray-800';
      darkBorderColor = 'border-gray-400';
      break;
    default:
      backgroundColor = 'bg-default-50';
      textColor = 'text-gray-400';
      borderColor = 'border-gray-700';
      iconColor = 'text-gray-400';
      darkTextColor = 'text-gray-800';
      darkBorderColor = 'border-gray-400';
  }

  if (closed) {
    return null; // Ako je Alert zatvoren, ne prikazuj ništa
  }

  const combinedClassNames = className ? className : '';

  return (
    <div className={`flex items-center p-4 m-3 text-sm border-1 rounded-lg ${borderColor} ${backgroundColor} ${textColor} dark:${darkBorderColor} dark:${darkBackgroundColor} dark:${darkTextColor} ${combinedClassNames}`} role="alert">
      {showCloseButton && (
        <button onClick={handleClose} className="flex-shrink-0 inline w-4 h-4 me-3 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Zatvori">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
      <svg className={`flex-shrink-0 inline w-4 h-4 me-3 ${iconColor}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span className="font-medium pr-2">{title}</span> {body}
    </div>
    
  );
};
