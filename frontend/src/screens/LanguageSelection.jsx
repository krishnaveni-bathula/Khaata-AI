import React from 'react';
import { Languages, ArrowRight } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
];

export default function LanguageSelection({ onSelectLanguage }) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-20px bg-background text-on-background">
      {/* Header */}
      <div className="flex flex-col items-center mt-12 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Languages className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-sans">Choose Language</h1>
        <p className="text-on-surface-variant font-sans text-sm mt-2">
          Select your preferred language for the smart ledger
        </p>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 gap-4 my-8">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className="flex flex-col items-start justify-between p-6 bg-surface-container-lowest hover:bg-primary/5 hover:border-primary active:scale-95 transition-all duration-200 text-left border border-surface-container shadow-premium-sm rounded-3xl min-h-[140px] group"
          >
            <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center text-xs font-bold text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              {lang.code.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg font-sans text-on-background mt-2">
                {lang.nativeName}
              </div>
              <div className="text-xs text-on-surface-variant font-sans">
                {lang.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="text-center pb-6">
        <span className="text-xs text-on-surface-variant/60 font-sans font-medium">
          Khata AI Ledger Assistant • v1.0
        </span>
      </div>
    </div>
  );
}
