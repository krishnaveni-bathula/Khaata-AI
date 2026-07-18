import React, { useState, useEffect } from 'react';
import LanguageSelection from './screens/LanguageSelection';
import Home from './screens/Home';
import Customers from './screens/Customers';
import StockCheck from './screens/StockCheck';
import { Mic, Users, Languages } from 'lucide-react';
import { supabase } from './supabaseClient';
import LandingPage from './screens/LandingPage';

const backendUrl = import.meta.env.VITE_API_URL;


export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [skippedLogin, setSkippedLogin] = useState(false);

  const [language, setLanguage] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);

  // --- AUTH CHECK ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // --- LANGUAGE INIT ---
  useEffect(() => {
    const savedLanguage = localStorage.getItem('khata_language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    setIsInitializing(false);
  }, []);

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('khata_language', langCode);
  };

  const handleResetLanguage = () => {
    setLanguage(null);
    localStorage.removeItem('khata_language');
  };

  // --- LOADING STATE (auth check in progress) ---
  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-lg">Khata AI...</div>
      </div>
    );
  }

  // --- NOT LOGGED IN: show login screen, block everything else ---
  if (!session && !skippedLogin) {
  if (showLanding) {
    return (
      <LandingPage
        onSignUp={() => setShowLanding(false)}
        onChangeLanguage={(code) => { setLanguage(code); localStorage.setItem('khata_language', code); }}
        currentLanguage={language || 'en'}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-tr from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-on-background">Welcome to Khata AI</h1>
      <button
  onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }); }}
  className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors mb-3"
>
  Log In / Sign Up with Google
</button>
      <button
        onClick={() => setSkippedLogin(true)}
        className="text-on-surface-variant text-sm font-medium underline hover:text-primary transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

  // --- LOGGED IN, BUT NO LANGUAGE SELECTED YET ---
  if (!language) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-[32px] overflow-hidden shadow-2xl border border-orange-100">
          <LanguageSelection onSelectLanguage={handleSelectLanguage} />
        </div>
      </div>
    );
  }

  // --- LOGGED IN + LANGUAGE SET: show the real app ---
  return (
    <div className="min-h-screen bg-gradient-to-tr from-amber-50 to-orange-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:w-[410px] sm:h-[840px] sm:rounded-[36px] bg-background sm:shadow-2xl border sm:border-orange-100 overflow-hidden flex flex-col relative sm:ring-8 sm:ring-white">
        
        <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-2 text-[11px] font-bold text-on-surface-variant/40 bg-background select-none">
          <span>12:30 PM</span>
          <div className="w-16 h-4 bg-on-surface-variant/10 rounded-full mx-2"></div>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-4 h-2 bg-on-surface-variant/40 rounded-xs"></div>
          </div>
        </div>
        <div className="flex justify-end px-4 py-2">
  <button
    onClick={async () => { await supabase.auth.signOut(); }}
    className="text-xs font-semibold text-red-500 hover:text-red-600 underline"
  >
    Log Out
  </button>
</div>

        <div className="flex-1 overflow-y-auto bg-background">
          {currentTab === 'home' && (
            <Home
              language={language}
              backendUrl={backendUrl}
              onChangeLanguage={handleResetLanguage}
            />
          )}
          {currentTab === 'customers' && (
            <Customers backendUrl={backendUrl} />
          )}
          
        </div>

        <div className="absolute bottom-0 left-0 right-0 glassmorphism border-t border-surface-container/60 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentTab === 'home' ? 'text-primary scale-110' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
            }`}
          >
            <Mic className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 font-sans">Voice</span>
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentTab === 'customers' ? 'text-primary scale-110' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 font-sans">Ledger</span>
          </button>

          
        </div>

      </div>
    </div>
  );
}