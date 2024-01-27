import React, { useEffect, useState } from "react";

type AlertProps = {
  variant: "info" | "danger" | "success" | "warning" | "dark";
  title?: string;
  body: string;
  showCloseButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  body,
  showCloseButton = false,
  isOpen = true,
  onClose,
  className,
}) => {
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

  let backgroundColor = "";
  let textColor = "";
  let iconColor = "";

  switch (variant) {
    case "info":
      backgroundColor = "bg-gray-800";
      textColor = "text-blue-400";
      iconColor = "text-blue-400";
      break;
    case "danger":
      backgroundColor = "bg-gray-800";
      textColor = "text-red-400";
      iconColor = "text-red-400";
      break;
    case "success":
      backgroundColor = "bg-gray-800";
      textColor = "text-green-400";
      iconColor = "text-green-400";
      break;
    case "warning":
      backgroundColor = "bg-gray-800";
      textColor = "text-yellow-400";
      iconColor = "text-yellow-400";
      break;
    case "dark":
      backgroundColor = "bg-gray-800";
      textColor = "text-gray-400";
      iconColor = "text-gary-400";
      break;
    default:
      backgroundColor = "bg-gray-800";
      textColor = "text-gray-400";
      iconColor = "text-gray-400";
  }

  if (closed) {
    return null; // Ako je Alert zatvoren, ne prikazuj ništa
  }

  const combinedClassNames = className ? className : "";

  return (
    <div
      className={`flex items-center 
      rounded-lg p-4 text-sm 
      ${backgroundColor} 
      ${textColor} 
      ${combinedClassNames}`}
    >
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="me-3 inline h-4 w-4 flex-shrink-0 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Zatvori"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      )}
      <svg
        className={`me-3 inline h-4 w-4 flex-shrink-0 ${iconColor}`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span className="pr-2 font-bold">{title}</span> {body}
    </div>
  );
};
