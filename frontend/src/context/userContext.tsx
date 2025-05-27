import { JwtPayload } from "@roshi/shared/models/api.model";
import { QueryObserverResult } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useCallback, useContext, useMemo } from "react";
import { useGetCurrentUser } from "../api/useAccountApi";
import { CONSTANTS, KEYS } from "../data/constants";

interface UserContextType {
  user?: Partial<ReturnType<typeof useGetCurrentUser>["data"] & { id: string; email: string; role: string }>;
  refetch?: () => Promise<QueryObserverResult<ReturnType<typeof useGetCurrentUser>["data"]>>;
  isLoading?: boolean;
  logout?: () => Promise<void>;
  isSuperAdmin?: boolean;
}
const userContext = createContext<UserContextType>({});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const tokenFromStorage = localStorage.getItem(KEYS.AUTH_TOKEN);
  const { data: user, refetch, isLoading, dataUpdatedAt } = useGetCurrentUser({ enabled: !!tokenFromStorage });

  const token = useMemo(() => {
    const token = localStorage.getItem(KEYS.AUTH_TOKEN);
    if (!token) return undefined;
    const decoded = jwtDecode<JwtPayload>(token);
    //If token is expired, remove it from local storage
    if (decoded.exp && new Date(decoded.exp * 1000) < new Date()) {
      localStorage.removeItem(KEYS.AUTH_TOKEN);
      return undefined;
    }
    return decoded;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want to re-run this if user is refetched
  }, [dataUpdatedAt]);

  const logout = useCallback(async () => {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    await refetch?.();
    window.location.reload();
  }, [refetch]);

  const value = useMemo(
    () => ({
      user: user ? user : token ? { id: token!.sub, email: token!.email, role: token!.role } : undefined,
      isSuperAdmin: user?.email === CONSTANTS.SUPERADMIN_EMAIL,
      refetch,
      isLoading,
      logout,
    }),
    [user, token, refetch, isLoading, logout]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
