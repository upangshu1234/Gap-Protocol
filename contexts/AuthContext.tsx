import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  provider: 'email' | 'google';
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('gap_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock Validation
    if (pass.length < 6) throw new Error("Invalid credentials");
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      provider: 'email',
      createdAt: Date.now()
    };
    
    setUser(newUser);
    localStorage.setItem('gap_auth_user', JSON.stringify(newUser));
  };

  const signup = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      provider: 'email',
      createdAt: Date.now()
    };
    setUser(newUser);
    localStorage.setItem('gap_auth_user', JSON.stringify(newUser));
  };

  const googleLogin = async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: "demo.user@gmail.com",
      name: "Demo User",
      provider: 'google',
      createdAt: Date.now()
    };
    setUser(newUser);
    localStorage.setItem('gap_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gap_auth_user');
    localStorage.removeItem('gadgetAssessmentProgress'); // Clean up assessment data on logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
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