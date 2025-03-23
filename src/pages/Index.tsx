
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calculator } from "@/components/Calculator";
import { ThemeProvider } from "@/context/ThemeContext";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { languages } from "@/i18n";
import { Flower, Leaf } from "lucide-react";

const Index = () => {
  const { t, i18n } = useTranslation();

  // Set document direction on language change or initial load
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const direction = languages[currentLang as keyof typeof languages]?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background to-berlin-warmLight dark:from-background dark:to-gray-900/50">
        <BackgroundPattern />
        <Header />
        <main className="flex-1 pt-28 md:pt-32 pb-16 px-4 md:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <section className="mb-10 md:mb-16 text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-berlin-amber via-berlin-orange to-primary dark:from-berlin-yellow dark:via-berlin-amber dark:to-berlin-orange font-serif relative">
                {t('app.title')}
                <span className="absolute -top-6 right-1/4 text-pink-500 dark:text-pink-400 animate-float" style={{ animationDelay: '1.2s' }}>
                  <Flower size={24} className="opacity-70" />
                </span>
                <span className="absolute -bottom-3 left-1/4 text-green-500 dark:text-green-400 animate-float" style={{ animationDelay: '0.8s' }}>
                  <Leaf size={20} className="opacity-70 rotate-45" />
                </span>
              </h1>
              <div className="floral-divider mx-auto w-64 mb-6"></div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up font-sans">
                {t('app.subtitle')}
              </p>
            </section>
            
            <div className="dappled-light">
              <Calculator />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default Index;
