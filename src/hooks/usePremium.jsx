// src/hooks/usePremium.jsx
import { useState, useEffect, createContext, useContext } from "react";

const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const premiumStatus = localStorage.getItem("premiumStatus");
    if (premiumStatus === "true") {
      setIsPremium(true);
      setHasPaid(true);
    }
  }, []);

  const activatePremium = () => {
    setIsPremium(true);
    setHasPaid(true);
    localStorage.setItem("premiumStatus", "true");
  };

  return (
    <PremiumContext.Provider value={{ isPremium, hasPaid, activatePremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return context;
};
