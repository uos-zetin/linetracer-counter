import { useMemo } from "react";
import { UserContext, createUserService } from "@/features/user";
import { useRepository } from "./use-repository";

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { userRepository } = useRepository();
  
  const userService = useMemo(() => {
    return createUserService({ userRepository });
  }, [userRepository]);

  return (
    <UserContext.Provider value={userService}>
      {children}
    </UserContext.Provider>
  );
}
