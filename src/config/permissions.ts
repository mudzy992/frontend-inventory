import { useUserContext } from "../components/Contexts/UserContext/UserContext";

// Definicija tipove permisija
type Permission = "view" | "add" | "edit" | "delete";

// Definicija permisije po rolama
const rolePermissions: Record<"administrator" | "moderator" | "user", Permission[]> = {
  administrator: ["view", "add", "edit", "delete"],
  moderator: ["view", "edit"],
  user: ["view"],
};

// Funkcija za provjeru permisija
export const useHasPermission = (permission: Permission): boolean => {
  const { role } = useUserContext();
  return role ? rolePermissions[role]?.includes(permission) ?? false : false;
};

// Helper funkcije
export const useCanView = () => useHasPermission("view");
export const useCanAdd = () => useHasPermission("add");
export const useCanEdit = () => useHasPermission("edit");
export const useCanDelete = () => useHasPermission("delete");
