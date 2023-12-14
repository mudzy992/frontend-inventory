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
    const fetchUserFromLocalStorage = () => {
      let storedUserIDKey: string;
      let storedUserRoleKey;
      /* const storedUserRole = localStorage.getItem('api_identity_role'); */
      const storedUserRole = localStorage.getItem(`api_identity_role`);

      if (storedUserRole) {
        storedUserIDKey = `api_identity_id_${storedUserRole}`;
        storedUserRoleKey = `api_identity_${storedUserRole}`;

        const storedUserID = localStorage.getItem(storedUserIDKey);

        if (storedUserID) {
          setUserId(parseInt(storedUserID, 10));
        }
        setRole(storedUserRole as UserRole);
      } else if (initialRole) {
        storedUserIDKey = `api_identity_id_${initialRole}`;
        storedUserRoleKey = `api_identity_${initialRole}`;
        setRole(initialRole);
      } else {
        storedUserIDKey = 'api_identity_id_default';
        storedUserRoleKey = 'api_identity_default';
      }

    };
    fetchUserFromLocalStorage();
  }, [initialRole]);

  const contextValue: UserContextType = {
    userId,
    role,
    setUserId,
    setRole,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export function saveIdentity(role: 'user' | 'administrator', userId: string, setRole: (role: UserRole | undefined) => void, setUserId: (id: number | undefined) => void) {
  if (role === 'administrator' || role === 'user') {
    localStorage.setItem(`api_identity_role`, role);
    localStorage.setItem(`api_identity_id_${role}`, userId);

    // Odmah nakon postavljanja u localStorage, ažuriraj kontekst
    setRole(role);
    setUserId(parseInt(userId, 10));
  } else {
    console.error('Invalid user role:', role);
  }
}

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }

  return context;
};
