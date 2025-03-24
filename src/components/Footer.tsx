import React from "react";
import { Grape, Github } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t border-border mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <div className="flex items-start space-x-2 mb-4">
              <Grape className="w-5 h-5 text-berry-500 mt-0.5" />
              <span className="text-base font-medium">
                <span className="text-foreground">{t('footer.studioName')}</span>
                <span className="text-muted-foreground ml-1">{t('footer.studioSuffix')}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.studioDescription')}
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-2">{t('footer.importantNotice')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.importantNoticeText')}
            </p>
          </div>
          
          <div>
           
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('footer.dataBasedOn')} {currentYear}. {t('footer.copyrightText')} {currentYear} {t('footer.studioName')}.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="https://github.com/NULLBERRY-STUDIO/budget-buddy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a 
              href="mailto:hello@nullberry.org" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t('footer.email')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
