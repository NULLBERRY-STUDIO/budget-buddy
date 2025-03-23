
import { useTheme } from "@/context/ThemeContext";
import { Bike, TreeDeciduous, Flower, Sun, CakeSlice, Coffee, Leaf, Sprout } from "lucide-react";

export function BackgroundPattern() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Soft gradient background */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-berlin-amber/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-float opacity-60 dark:opacity-40 dark:bg-berlin-amber/5"></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-1/3 bg-berlin-peach/15 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 animate-float opacity-50 dark:opacity-30 dark:bg-berlin-orange/10"></div>
      
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"></div>
      
      {/* Main tree with foliage and blooming flowers */}
      <div className="absolute top-10 -left-5 md:left-10 transform scale-[0.6] md:scale-100 opacity-70 dark:opacity-40 animate-float">
        <TreeDeciduous className="h-44 w-44 text-green-600 dark:text-green-700" />
        <Flower className="absolute top-14 right-10 h-8 w-8 text-pink-500 dark:text-pink-400 animate-pulse-subtle" />
        <Flower className="absolute top-8 left-10 h-6 w-6 text-purple-400 dark:text-purple-300 animate-pulse-subtle" style={{ animationDelay: "1.5s" }} />
        <Flower className="absolute top-20 left-20 h-5 w-5 text-yellow-400 dark:text-yellow-300 animate-pulse-subtle" style={{ animationDelay: "0.8s" }} />
        <Leaf className="absolute top-24 right-16 h-4 w-4 text-green-500 dark:text-green-400 animate-float" style={{ animationDelay: "1.2s" }} />
        <Leaf className="absolute bottom-10 right-20 h-5 w-5 text-green-400 dark:text-green-500 animate-float transform rotate-45" style={{ animationDelay: "2s" }} />
      </div>
      
      {/* Small sprouting plants */}
      <div className="absolute bottom-20 left-20 opacity-70 dark:opacity-40">
        <Sprout className="h-8 w-8 text-green-500 dark:text-green-400 animate-float" />
      </div>
      
      <div className="absolute top-40 right-10 opacity-60 dark:opacity-30">
        <Sprout className="h-6 w-6 text-green-400 dark:text-green-500 transform -rotate-12 animate-float" style={{ animationDelay: "1.5s" }} />
      </div>
      
      {/* Vintage bicycle near the entrance */}
      <div className="absolute bottom-10 right-10 bicycle-decoration">
        <Bike className="h-24 w-24 transform -rotate-12" />
      </div>
      
      {/* Sun for natural lighting - shows in light mode */}
      <div className="absolute top-20 right-20 text-yellow-400/60 dark:text-yellow-300/20 animate-pulse-subtle">
        <Sun className="h-16 w-16" />
      </div>
      
      {/* Firefly/lantern effects - more visible in dark mode */}
      <div className="absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-yellow-300/40 dark:bg-yellow-200/60 animate-pulse-subtle blur-[1px]"></div>
      <div className="absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-yellow-300/30 dark:bg-yellow-200/70 animate-pulse-subtle blur-[1px]" style={{ animationDelay: "1.3s" }}></div>
      <div className="absolute top-2/3 right-1/4 h-1.5 w-1.5 rounded-full bg-yellow-300/20 dark:bg-yellow-200/50 animate-pulse-subtle blur-[1px]" style={{ animationDelay: "0.7s" }}></div>
      <div className="absolute top-1/2 left-1/3 h-2 w-2 rounded-full bg-yellow-300/30 dark:bg-yellow-200/60 animate-pulse-subtle blur-[1px]" style={{ animationDelay: "2.1s" }}></div>
      
      {/* Bakery/café elements */}
      <div className="absolute bottom-40 left-10 md:left-40 text-berlin-orange/60 dark:text-berlin-amber/40 animate-float">
        <CakeSlice className="h-12 w-12" />
      </div>
      
      <div className="absolute top-40 right-20 md:right-40 text-berlin-darkBlue/60 dark:text-berlin-blue/40 animate-float" style={{ animationDelay: "2s" }}>
        <Coffee className="h-10 w-10" />
      </div>
      
      {/* Additional decorative elements */}
      <div className="absolute bottom-1/4 right-1/3 opacity-30 dark:opacity-20">
        <svg width="60" height="60" viewBox="0 0 100 100" className="animate-float" style={{ animationDelay: "1.3s" }}>
          <path d="M30,10 Q50,0 70,10 Q90,20 90,40 Q90,60 70,70 Q50,80 30,70 Q10,60 10,40 Q10,20 30,10 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-berlin-amber dark:text-berlin-yellow" />
        </svg>
      </div>
      
      <div className="absolute top-1/3 left-1/3 opacity-20 dark:opacity-15">
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-float" style={{ animationDelay: "2.2s" }}>
          <path d="M20,40 C20,20 40,20 50,20 C60,20 80,20 80,40 C80,60 60,80 50,80 C40,80 20,60 20,40 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-berlin-orange dark:text-berlin-amber" />
        </svg>
      </div>
    </div>
  );
}
