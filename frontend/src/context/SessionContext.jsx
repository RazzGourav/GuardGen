import { createContext, useState } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("IDLE");

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, status, setStatus }}>
      {children}
    </SessionContext.Provider>
  );
};