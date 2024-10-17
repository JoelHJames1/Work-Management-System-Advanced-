import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  loginUser,
  logoutUser,
  signUpUser,
  getUserRole,
} from '../utils/firebase';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    role: string
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      setUser(user);
      const role = await getUserRole(user.uid);
      setUserRole(role);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await logoutUser();
    setUserRole(null);
    setUser(null);
  };

  const signup = async (email: string, password: string, role: string) => {
    try {
      const userCredential = await signUpUser(email, password, role);
      return {
        success: true,
        message: 'Sign-up successful. Welcome!',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An error occurred during sign-up.',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};