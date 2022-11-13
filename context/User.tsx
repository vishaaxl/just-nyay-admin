import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth,
} from "firebase/auth";

const AuthContext = createContext<any | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, [user, auth]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
