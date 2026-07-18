import React, { useState } from 'react';
import { Mic, Languages, ArrowRight, Check } from 'lucide-react';

const languageLabels = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
};

export default function LandingPage({ onSignUp, onChangeLanguage, currentLanguage = 'en' }) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-y-auto">
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold font-sans text-gray-900">Khata AI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-xs font-semibold transition-colors text-gray-700"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span>{languageLabels[currentLanguage]}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 min-w-[140px]">
                {Object.entries(languageLabels).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => {
                      onChangeLanguage(code);
                      setShowLangMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onSignUp}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-full text-sm font-bold transition-colors text-white"
          >
            Sign up <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 sm:px-12 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-semibold tracking-wide text-sm mb-4 uppercase">
              Voice-first ledger for every shopkeeper
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif leading-tight mb-6 text-gray-900">
              Your khata, now as easy as talking
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              No notebook. No typing. No lost pages. Just speak — in English, Telugu, Hindi, or Tamil — and your shop's credit takes care of itself.
            </p>
            <button
              onClick={onSignUp}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark px-7 py-3.5 rounded-full text-base font-bold transition-colors text-white"
            >
              Get started <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
              alt="Shopkeeper in a small store"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section className="px-6 sm:px-12 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-3 text-gray-900">
            15 million+ shopkeepers
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            That's roughly how many small shopkeepers across India still track customer credit on paper — real money quietly lost to torn pages and missed entries, every single day.
          </p>
        </div>
      </section>

      {/* Feature 1 — Voice logging */}
      <section className="px-6 sm:px-12 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-lg order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800&q=80"
              alt="Person speaking into a phone"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Voice entry
            </span>
            <h3 className="text-3xl font-bold font-serif mb-4 text-gray-900">
              Just talk. That's the whole app.
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              "Ravi ki 200 rupees udhaar." That's it. No forms, no menus, no learning curve — in the language you already speak, mixed however you naturally say it.
            </p>
            <ul className="space-y-3">
              {['Works in English, Telugu, Hindi, and Tamil', 'Understands mixed-language speech', 'Confirms every entry before saving'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature 2 — Ledger */}
      <section className="px-6 sm:px-12 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Customer ledger
            </span>
            <h3 className="text-3xl font-bold font-serif mb-4 text-gray-900">
              Every customer's balance, one tap away
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              No more flipping through pages to find an old entry. Every customer is automatically organized, sorted by what they owe, so you always know where you stand.
            </p>
            <ul className="space-y-3">
              {['Auto-sorted by amount owed', 'Search any customer instantly', 'Full transaction history per customer'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
              alt="Shop owner reviewing accounts"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonial-style section */}
      <section className="px-6 sm:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <img
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80"
            alt="Shopkeeper portrait"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-6"
          />
          <p className="text-xl sm:text-2xl font-serif italic text-gray-800 leading-relaxed mb-4">
            "Earlier I used to lose track of who owes what. Now I just say it out loud after every sale — it takes two seconds."
          </p>
          <p className="text-gray-500 text-sm font-medium">
            A small grocery shop owner, Hyderabad
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 sm:px-12 py-20 bg-gray-900 text-center">
        <h2 className="text-3xl font-bold font-serif mb-6 text-white">
          Built for real shopkeepers. Built for you.
        </h2>
        <button
          onClick={onSignUp}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-8 py-4 rounded-full text-base font-bold transition-colors text-white"
        >
          Sign up free <ArrowRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
}