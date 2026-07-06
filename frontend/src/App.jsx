import React, { useState, useEffect } from 'react';
import LanguageSelection from './screens/LanguageSelection';
import Home from './screens/Home';
import Customers from './screens/Customers';
import StockCheck from './screens/StockCheck';
import { Mic, Users, BarChart2, Languages } from 'lucide-react';

const backendUrl = 'http://localhost:5000';

export default function App() {
  const [language, setLanguage] = useState(null);
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'customers', 'stock'
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Load persisted language from localStorage
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-lg">Khata AI...</div>
      </div>
    );
  }

  // If language is not set, force user to select language first
  if (!language) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-[32px] overflow-hidden shadow-2xl border border-orange-100">
          <LanguageSelection onSelectLanguage={handleSelectLanguage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-amber-50 to-orange-100 flex items-center justify-center p-0 sm:p-4">
      {/* Centered Phone Shell for premium visual appeal */}
      <div className="w-full sm:w-[410px] sm:h-[840px] sm:rounded-[36px] bg-background sm:shadow-2xl border sm:border-orange-100 overflow-hidden flex flex-col relative sm:ring-8 sm:ring-white">
        
        {/* Top Status Bar (simulation for premium look) */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-2 text-[11px] font-bold text-on-surface-variant/40 bg-background select-none">
          <span>12:30 PM</span>
          <div className="w-16 h-4 bg-on-surface-variant/10 rounded-full mx-2"></div> {/* Notch representation */}
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-4 h-2 bg-on-surface-variant/40 rounded-xs"></div>
          </div>
        </div>

        {/* Dynamic Screen Content */}
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
          {currentTab === 'stock' && (
            <StockCheck backendUrl={backendUrl} />
          )}
        </div>

        {/* Premium Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 glassmorphism border-t border-surface-container/60 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          {/* Home Tab */}
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentTab === 'home' ? 'text-primary scale-110' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
            }`}
          >
            <Mic className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 font-sans">Voice</span>
          </button>

          {/* Customers Tab */}
          <button
            onClick={() => setCurrentTab('customers')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentTab === 'customers' ? 'text-primary scale-110' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 font-sans">Ledger</span>
          </button>

          {/* Stock Check Tab */}
          <button
            onClick={() => setCurrentTab('stock')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-all ${
              currentTab === 'stock' ? 'text-primary scale-110' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
            }`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 font-sans">Stock</span>
          </button>
        </div>

      </div>
    </div>
  );
}
