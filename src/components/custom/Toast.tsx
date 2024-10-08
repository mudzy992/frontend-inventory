import React, { useEffect, useState } from 'react';

interface ToastProps {
  variant?: "info" | "danger" | "success" | "warning" | "dark" | string;
  message: string | undefined;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ variant, message, onClose }) => {
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    if (message === "" || message === undefined) {
      setShowToast(false);
    } else {
      setShowToast(true);
      const timeoutId = setTimeout(() => {
        setShowToast(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  useEffect(() => {
    if (!showToast && onClose) {
      onClose();
    }
  }, [showToast]);

  const handleClose = () => {
    setShowToast(false);
  };

  let backgroundColor = "";
  let textColor = "";
  let borderColor = "";
  let shadowColor = "";

  switch (variant) {
    case "info":
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-blue-700";
      shadowColor = "shadow-blue-400";
      break;
    case "danger":
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-red-700";
      shadowColor = "shadow-red-400";
      break;
    case "success":
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-green-600";
      shadowColor = "shadow-green-400";
      break;
    case "warning":
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-yellow-600";
      shadowColor = "shadow-yellow-400";
      break;
    case "dark":
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-gray-700";
      shadowColor = "shadow-gray-400";
      break;
    default:
      backgroundColor = "bg-default-100";
      textColor = "text-white";
      borderColor = "border-gray-700";
      shadowColor = "shadow-gray-400";
  }

  return showToast ? (
    <div style={{zIndex:"51"}} className="justify-right fixed inset-x-0 top-14 flex items-end justify-end px-4 py-6">
      <div
        className={`relative w-full max-w-sm rounded border-l-4 ${borderColor} ${backgroundColor} px-4 py-3 ${textColor} shadow-2xl ${shadowColor}`}
      >
        <div className="p-2">
          <div className="flex items-start">
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium leading-5">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex text-white transition duration-700 ease-in-out"
                onClick={handleClose}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Toast;
