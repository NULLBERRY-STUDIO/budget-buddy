
import { Moon, Sun, Coffee, Flower } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-primary/10 focus-visible:ring-0 focus-visible:ring-offset-0 hover:scale-105 transition-all duration-300"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="bottom">
            <p>Change garden ambiance</p>
          </TooltipContent>
          <DropdownMenuContent align="end" className="animate-scale glass-card border-berlin-amber/30 w-44">
            <DropdownMenuItem 
              onClick={() => setTheme("light")}
              className="cursor-pointer transition-colors hover:bg-berlin-warmLight focus:bg-berlin-warmLight flex items-center gap-2"
            >
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>Morning Garden</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("dark")}
              className="cursor-pointer transition-colors hover:bg-berlin-darkBlue/10 focus:bg-berlin-darkBlue/10 flex items-center gap-2"
            >
              <Moon className="h-4 w-4 text-blue-400" />
              <span>Evening Garden</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("system")}
              className="cursor-pointer transition-colors hover:bg-berlin-orange/10 focus:bg-berlin-orange/10 flex items-center gap-2"
            >
              <Coffee className="h-4 w-4 text-berlin-orange" />
              <span>Café Ambiance</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
