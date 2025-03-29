import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { languages } from "@/i18n";

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
    // Update document direction based on language
    document.documentElement.dir = languages[lng as keyof typeof languages].dir;
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 sm:px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col sm:flex-row sm:items-baseline">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">Budget Buddy</span>
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 sm:ml-2">
                {t('app.subtitle')}
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4">
         
          
            </nav>
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Change language"
              >
                <Globe className="h-4 w-4" />
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                  <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                    {Object.entries(languages).map(([code, { nativeName }]) => (
                      <button
                        key={code}
                        onClick={() => changeLanguage(code)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          i18n.language === code 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        role="menuitem"
                      >
                        {nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
