
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, requireAuth = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        const isAuthed = !!data.session;
        setIsAuthenticated(isAuthed);
        
        if (requireAuth && !isAuthed) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (requireAuth) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthed = !!session;
        setIsAuthenticated(isAuthed);
        
        if (requireAuth && !isAuthed) {
          navigate('/login');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
