import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

type UserRole = "administrator" | "moderator" | "user";

interface UserContextType {
  userId: number | undefined;
  role: UserRole | undefined;
  phoneIp: string | null;
  isAuthenticated: boolean;
  setPhoneIp: (phoneIp: string | null) => void;
  setUserId: (id: number | undefined) => void;
  setRole: (role: UserRole | undefined) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  children,
  initialRole,
}) => {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [phoneIp, setPhoneIp] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | undefined>(initialRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);


  useEffect(() => {
    const storedToken = localStorage.getItem("api_token");
    if (storedToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const fetchUserFromLocalStorage = () => {
      let storedUserIDKey: string;
      let storedPhoneIpKey: string;
      let storedUserRoleKey;

      const storedUserRole = localStorage.getItem(`api_identity_role`);
      const storedUserID = localStorage.getItem(`api_identity_id`);
      const storedPhoneIp = localStorage.getItem(`api_identity_phone_ip`);

      if (storedUserRole && storedUserID && storedPhoneIp) {
        setRole(storedUserRole as UserRole);
        setPhoneIp(storedPhoneIp)
        setUserId(parseInt(storedUserID, 10));
      } else if (initialRole) {
        setRole(initialRole);
      }

      if (storedUserRole) {
        storedUserIDKey = `api_identity_id`;
        storedUserRoleKey = `api_identity_role`;
        storedPhoneIpKey = `api_identity_phone_ip`

        const storedUserID = localStorage.getItem(storedUserIDKey);

        if (storedUserID) {
          setUserId(parseInt(storedUserID, 10));
        }
        setRole(storedUserRole as UserRole);
      } else if (initialRole) {
        storedUserIDKey = `api_identity_id`;
        storedUserRoleKey = `api_identity_role`;
        storedPhoneIpKey = `api_identity_phone_ip`
        setRole(initialRole);
      } else {
        storedUserIDKey = "api_identity_id_default";
        storedUserRoleKey = "api_identity_default";
        storedPhoneIpKey = `api_identity_phone_ip_default`
      }
    };

    fetchUserFromLocalStorage();
  }, [initialRole]);

  const setupContextOnRefresh = () => {
    // Implementirajte logiku kako želite postaviti kontekst prilikom osvježavanja
    // Možete koristiti localStorage, sessionStorage ili druge mehanizme za pohranu stanja između osvježavanja
    const storedUserRole = localStorage.getItem(`api_identity_role`);
    const storedUserID = localStorage.getItem(`api_identity_id`);
    const storedPhoneIp = localStorage.getItem(`api_identity_phone_ip`);

    if (storedUserRole) {
      setRole(storedUserRole as UserRole);
    }

    if (storedUserID) {
      setUserId(parseInt(storedUserID, 10));
    }

    if (storedPhoneIp) {
      setPhoneIp(storedPhoneIp)
    }
  };

  useEffect(() => {
    // Dodajte event listener za osvježavanje (F5)
    window.addEventListener("beforeunload", setupContextOnRefresh);

    // Čišćenje event listenera prilikom unmounta komponente
    return () => {
      window.removeEventListener("beforeunload", setupContextOnRefresh);
    };
  }, []);

  const contextValue: UserContextType = {
    userId,
    role,
    isAuthenticated,
    phoneIp,
    setUserId,
    setRole,
    setIsAuthenticated,
    setPhoneIp
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export function saveIdentity(
  role: "user" | "administrator" | "moderator",
  userId: string,
  phoneIp: string,
  setRole: (role: UserRole | undefined) => void,
  setUserId: (id: number | undefined) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void,
  setPhoneIp: (phoneIp: string | null) => void,
) {
  if (role === "administrator" || role === "moderator" || role === "user") {
    localStorage.setItem(`api_identity_role`, role);
    localStorage.setItem(`api_identity_id`, userId);
    localStorage.setItem(`api_identity_phone_ip`, phoneIp);

    setRole(role);
    setUserId(parseInt(userId, 10));
    setIsAuthenticated(true);
    setPhoneIp(phoneIp)
  } else {
    console.error("Invalid user role:", role);
  }
}

export async function removeIdentity(
  setIsAuthenticated: (isAuthenticated: boolean) => void,
  setUserId: (id: number | undefined) => void,
  setRole: (role: UserRole | undefined) => void,
  setPhoneIp: (phoneIp: string | null) => void,
) {
  await Promise.all(
      ['api_token', 'api_refresh_token', 'api_identity_role', 'api_identity_id', 'api_identity_phone_ip'].map((key) => {
          if (localStorage.getItem(key)) {
              localStorage.removeItem(key);
          }
      })
  );

  // Postavi vrednosti u kontekstu
  setIsAuthenticated(false);
  setUserId(undefined);
  setRole(undefined);
  setPhoneIp(null)
}


export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
};
