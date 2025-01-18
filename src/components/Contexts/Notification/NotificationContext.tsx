import React, { createContext, useContext, ReactNode } from "react";
import { notification, message } from "antd";

// Tip za NotificationContext
interface NotificationContextType {
  success: {
    message: (messageText: string) => void;
    notification: (description: string) => void;
  };
  error: {
    message: (messageText: string) => void;
    notification: (description: string) => void;
  };
  info: {
    message: (messageText: string) => void;
    notification: (description: string) => void;
  };
  warning: {
    message: (messageText: string) => void;
    notification: (description: string) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [api, contextHolderNotification] = notification.useNotification();
  const [messageApi, contextHolderMessage] = message.useMessage();
  
  // Funkcije za success
  const successMessage = (messageText: string) => {
    messageApi.success(messageText); // Koristi message.success
  };

  const successNotification = (description: string) => {
    api.success({ message: 'Uspješno!', description }); // Koristi notification.success
  };

  // Funkcije za error
  const errorMessage = (messageText: string) => {
    messageApi.error(messageText); // Koristi message.error
  };

  const errorNotification = (description: string) => {
    api.error({ message: 'Greška!', description }); // Koristi notification.error
  };

  // Funkcije za info
  const infoMessage = (messageText: string) => {
    messageApi.info(messageText); // Koristi message.info
  };

  const infoNotification = (description: string) => {
    api.info({ message: 'Informacija!', description }); // Koristi notification.info
  };

  // Funkcije za warning
  const warningMessage = (messageText: string) => {
    messageApi.warning(messageText); // Koristi message.warning
  };

  const warningNotification = (description: string) => {
    api.warning({ message: 'Upozorenje!', description }); // Koristi notification.warning
  };

  return (
    <NotificationContext.Provider
      value={{
        success: { message: successMessage, notification: successNotification },
        error: { message: errorMessage, notification: errorNotification },
        info: { message: infoMessage, notification: infoNotification },
        warning: { message: warningMessage, notification: warningNotification },
      }}
    >
      {contextHolderNotification} {/* Ovo omogućava prikaz notifikacija */}
      {contextHolderMessage}
      {children}
    </NotificationContext.Provider>
  );
};
