
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Check, Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const currentLanguage = languages[i18n.language as keyof typeof languages] || languages.en;
  
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setOpen(false);
    // Apply RTL direction if needed
    const direction = languages[lang as keyof typeof languages]?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = lang;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">
            {currentLanguage.nativeName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] max-h-[300px] overflow-y-auto">
        {Object.entries(languages).map(([code, language]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cn(
              "flex items-center gap-2 px-2.5 py-2",
              i18n.language === code && "bg-accent font-medium"
            )}
          >
            {i18n.language === code && (
              <Check className="h-4 w-4" />
            )}
            <span className={i18n.language === code ? "" : "pl-6"}>
              {language.nativeName}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
