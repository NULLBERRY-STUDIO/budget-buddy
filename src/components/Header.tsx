import { Euro, Moon, Sun, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 sm:px-6 py-4 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-berlin-orange" />
              <span className="text-lg font-medium ml-2">BudgetBuddy</span>
            </div>
            <span className="text-berlin-orange text-sm hidden sm:inline">Nullberry Studio</span>
          </div>

          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t("theme.toggle")}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
