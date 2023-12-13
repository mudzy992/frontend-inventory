// UserContext.tsx
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

type UserRole = 'administrator' | 'user';

interface UserContextType {
  userId: number | undefined;
  role: UserRole | undefined;
  setUserId: (id: number | undefined) => void;
  setRole: (role: UserRole | undefined) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children, initialRole }) => {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [role, setRole] = useState<UserRole | undefined>(initialRole);

  useEffect(() => {  
    let storedUserIDKey: string;
    let storedUserRoleKey: string;
  
    // Provjeri je li uloga administrator
    if (role === 'administrator') {
      storedUserIDKey = 'api_identity_id_administrator';
      storedUserRoleKey = 'api_identity_administrator';
    } else {
      storedUserIDKey = 'api_identity_id_user';
      storedUserRoleKey = 'api_identity_user';
    }
  
    const storedUserID = localStorage.getItem(storedUserIDKey);
    const storedUserRole = localStorage.getItem(storedUserRoleKey);
  
    if (storedUserID) {
      setUserId(parseInt(storedUserID, 10));
    }
  
    if (storedUserRole) {
      setRole(storedUserRole as UserRole);
    } else if (initialRole) {
      setRole(initialRole);
    }
  }, [role, initialRole]);
  

  const contextValue: UserContextType = {
    userId,
    role,
    setUserId,
    setRole,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};


export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }

  return context;
};
