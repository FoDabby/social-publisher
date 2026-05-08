import { createContext, useContext, useEffect } from "react";

type Theme = "light";

const ThemeProviderContext = createContext({ theme: "light" as Theme });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    // Clear any stored dark theme preference
    localStorage.removeItem("vite-ui-theme");
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
