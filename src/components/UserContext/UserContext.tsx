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
    const storedUserID = localStorage.getItem(`api_identity_id_${role}`);
    const storedUserRole = localStorage.getItem(`api_identity_${role}`);

    if (storedUserID) {
      setUserId(parseInt(storedUserID, 10));
    }

    if (storedUserRole) {
      setRole(storedUserRole as UserRole);
    }
  }, [role]); // Dodano je "role" kao dependency jer želimo pratiti promjene u ulozi

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
