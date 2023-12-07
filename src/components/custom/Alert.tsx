import React from 'react';

type AlertProps = {
  variant: 'info' | 'danger' | 'success' | 'warning' | 'dark';
  title: string;
  body: string;
};

export const Alert: React.FC<AlertProps> = ({ variant, title, body }) => {
  let backgroundColor = '';
  let textColor = '';
  let borderColor = '';
  let iconColor = '';
  let darkTextColor = '';
  let darkBackgroundColor = 'bg-gray-800';
  let darkBorderColor = '';

  switch (variant) {
    case 'info':
      backgroundColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-300';
      iconColor = 'text-blue-800';
      darkTextColor = 'text-blue-400';
      darkBorderColor = 'border-blue-800';
      break;
    case 'danger':
      backgroundColor = 'bg-red-50';
      textColor = 'text-red-800';
      borderColor = 'border-red-300';
      iconColor = 'text-red-800';
      darkTextColor = 'text-red-400';
      darkBorderColor = 'border-red-800';
      break;
    case 'success':
      backgroundColor = 'bg-green-50';
      textColor = 'text-green-800';
      borderColor = 'border-green-300';
      iconColor = 'text-green-800';
      darkTextColor = 'text-green-400';
      darkBorderColor = 'border-green-800';
      break;
    case 'warning':
      backgroundColor = 'bg-yellow-50';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-300';
      iconColor = 'text-yellow-800';
      darkTextColor = 'text-yellow-400';
      darkBorderColor = 'border-yellow-800';
      break;
    case 'dark':
      backgroundColor = 'bg-gray-50';
      textColor = 'text-gray-800';
      borderColor = 'border-gray-300';
      iconColor = 'text-gary-800';
      darkTextColor = 'text-gray-300';
      darkBorderColor = 'border-gray-600';
      break;
    default:
      backgroundColor = 'bg-gray-50';
      textColor = 'text-gray-800';
      borderColor = 'border-gray-600';
      iconColor = 'text-gray-800';
      darkTextColor = 'text-gray-300';
      darkBorderColor = 'border-gray-600';
  }

  return (
    <div className={`flex items-center p-4 text-sm border-1 rounded-lg ${borderColor} ${backgroundColor} ${textColor} dark:${darkBorderColor} dark:${darkBackgroundColor} dark:${darkTextColor}`} role="alert">
      <svg className={`flex-shrink-0 inline w-4 h-4 me-3 ${iconColor}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span className="font-medium">{title}</span> {body}
    </div>
    
  );
};
