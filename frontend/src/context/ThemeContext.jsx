import {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      return saved === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (isTransitioning) {
      root.classList.add('theme-transition');
    }

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";

    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (isTransitioning) {
      const timer = setTimeout(() => {
        root.classList.remove('theme-transition');
        setIsTransitioning(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isDark, isTransitioning]);

  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setIsDark(prev => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      theme: isDark ? "dark" : "light",
      isTransitioning,
    }),
    [isDark, toggleTheme, isTransitioning]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;