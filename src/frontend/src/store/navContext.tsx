import { createContext, useContext } from "react";

export interface NavContextValue {
  path: string;
  navigate: (to: string) => void;
}

export const NavContext = createContext<NavContextValue>({
  path: "/login",
  navigate: () => {},
});

export function useNav() {
  return useContext(NavContext);
}
