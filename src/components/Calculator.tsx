
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseBreakdown } from "@/components/ExpenseBreakdown";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { Neighborhood, fetchNeighborhoods } from "@/data/neighborhoods";
import { calculateRequiredExpenses, fetchExpenseCategories, getExpenseCategories } from "@/data/expenses";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calculator as CalculatorIcon, Users, User, Check, RefreshCcw, Euro, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Calculator() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState(2500);
  const [isFamilyBudget, setIsFamilyBudget] = useState(false);
  const [rentPercentage, setRentPercentage] = useState(30);
  const [roomType, setRoomType] = useState<keyof Neighborhood['averageRent']>("oneRoom");
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  
  // Results
  const [affordableRent, setAffordableRent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDataUpdate, setLastDataUpdate] = useState<string | null>(null);
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load data from JSON files
        await Promise.all([
          fetchExpenseCategories(),
          fetchNeighborhoods()
        ]);
        
        // Initialize expenses state with default values
        const expenseCategories = getExpenseCategories();
        const defaultExpenses = expenseCategories.reduce((acc, category) => {
          acc[category.id] = isFamilyBudget 
            ? category.defaultAmountFamily 
            : category.defaultAmountSingle;
          return acc;
        }, {} as Record<string, number>);
        
        setExpenses(defaultExpenses);
        
        // Get the most recent data update
        const currentDate = new Date().toISOString().split('T')[0];
        setLastDataUpdate(currentDate);
        
        toast.success("Latest rental data loaded successfully!");
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load latest data. Using fallback values.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Update the expenses state when family budget changes
  useEffect(() => {
    const expenseCategories = getExpenseCategories();
    if (expenseCategories.length === 0) return;
    
    const defaultExpenses = expenseCategories.reduce((acc, category) => {
      acc[category.id] = isFamilyBudget 
        ? category.defaultAmountFamily 
        : category.defaultAmountSingle;
      return acc;
    }, {} as Record<string, number>);
    
    setExpenses(defaultExpenses);
  }, [isFamilyBudget]);
  
  // Calculate affordable rent
  const calculateAffordableRent = () => {
    if (monthlyIncome <= 0) {
      toast.error("Please enter a valid monthly income");
      return;
    }
    
    // Calculate affordable rent using the percentage rule
    const calculatedRent = monthlyIncome * (rentPercentage / 100);
    
    // Check if this rent is actually affordable considering other expenses
    const requiredExpenses = calculateRequiredExpenses(isFamilyBudget, expenses);
    const totalAvailable = monthlyIncome - requiredExpenses;
    
    // Use the lower of the two as the truly affordable rent
    const trueAffordableRent = Math.min(calculatedRent, totalAvailable);
    
    setAffordableRent(trueAffordableRent > 0 ? trueAffordableRent : 0);
    setShowResults(true);
    
    // Show appropriate toast message
    if (trueAffordableRent <= 0) {
      toast.error("Your income doesn't cover basic expenses, please check your budget");
    } else if (trueAffordableRent < calculatedRent * 0.7) {
      toast.warning("Your actual affordable rent is lower than expected due to other expenses");
    } else {
      toast.success("Calculation complete! Scroll down to see results");
    }
  };
  
  const resetCalculator = () => {
    setShowResults(false);
    setMonthlyIncome(2500);
    setIsFamilyBudget(false);
    setRentPercentage(30);
    setRoomType("oneRoom");
    
    // Reset expenses to defaults
    const expenseCategories = getExpenseCategories();
    const defaultExpenses = expenseCategories.reduce((acc, category) => {
      acc[category.id] = category.defaultAmountSingle;
      return acc;
    }, {} as Record<string, number>);
    
    setExpenses(defaultExpenses);
    
    toast(t("calculator.buttons.reset"));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Map room type to translation key
  const getRoomTypeTranslation = (type: keyof Neighborhood['averageRent']) => {
    const mapping: Record<keyof Neighborhood['averageRent'], string> = {
      oneRoom: t('calculator.rooms.one'),
      twoRoom: t('calculator.rooms.two'),
      threeRoom: t('calculator.rooms.three'),
      fourPlusRoom: t('calculator.rooms.fourPlus')
    };
    return mapping[type];
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-berlin-amber mb-4"></div>
          <p className="text-muted-foreground">Loading latest Berlin rental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="berlin-card w-full animate-fade-in warm-gradient">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle className="berlin-heading flex items-center space-x-3 text-3xl md:text-4xl">
                <CalculatorIcon className="h-8 w-8 text-berlin-yellow" />
                <span>{t('calculator.title')}</span>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {t('calculator.description')}
              </CardDescription>
            </div>
            {lastDataUpdate && (
              <div className="flex items-center text-xs text-muted-foreground mt-2 sm:mt-0">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{t('common.dataAsOf')}: {formatDate(lastDataUpdate)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            <div className="grid gap-3">
              <Label htmlFor="income" className="berlin-label text-base">{t('calculator.income')}</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-berlin-amber">
                  <Euro className="h-5 w-5" />
                </div>
                <Input
                  id="income"
                  type="number"
                  min={0}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="pl-12 text-lg h-14 font-medium bg-white/90 dark:bg-gray-800/90 border-berlin-gray/20 shadow-md"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-berlin-gray/20 shadow-md">
              <div className="flex items-center space-x-3">
                <Label htmlFor="familyBudget" className="berlin-label text-base cursor-pointer">
                  {isFamilyBudget ? (
                    <Users className="h-5 w-5 inline mr-2 text-berlin-yellow" />
                  ) : (
                    <User className="h-5 w-5 inline mr-2 text-berlin-yellow" />
                  )}
                  {isFamilyBudget ? t('calculator.budget.family') : t('calculator.budget.single')}
                </Label>
              </div>
              <Switch
                id="familyBudget"
                checked={isFamilyBudget}
                onCheckedChange={setIsFamilyBudget}
                className="scale-125"
              />
            </div>
            
            <div className="space-y-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-berlin-gray/20 shadow-md">
              <div className="flex justify-between">
                <Label htmlFor="rentPercentage" className="berlin-label text-base">
                  {t('calculator.rentPercentage')} ({rentPercentage}%)
                </Label>
                <span className="text-sm text-muted-foreground">({t('calculator.recommended')})</span>
              </div>
              <Slider
                id="rentPercentage"
                min={10}
                max={50}
                step={1}
                value={[rentPercentage]}
                onValueChange={(value) => setRentPercentage(value[0])}
                className="py-6"
              />
            </div>
            
            <div className="space-y-4">
              <Label className="berlin-label text-base">{t('calculator.apartmentSize')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant={roomType === "oneRoom" ? "default" : "outline"}
                  onClick={() => setRoomType("oneRoom")}
                  className="w-full transition-all h-12 text-base"
                >
                  {t('calculator.rooms.one')}
                </Button>
                <Button
                  variant={roomType === "twoRoom" ? "default" : "outline"}
                  onClick={() => setRoomType("twoRoom")}
                  className="w-full transition-all h-12 text-base"
                >
                  {t('calculator.rooms.two')}
                </Button>
                <Button
                  variant={roomType === "threeRoom" ? "default" : "outline"}
                  onClick={() => setRoomType("threeRoom")}
                  className="w-full transition-all h-12 text-base"
                >
                  {t('calculator.rooms.three')}
                </Button>
                <Button
                  variant={roomType === "fourPlusRoom" ? "default" : "outline"}
                  onClick={() => setRoomType("fourPlusRoom")}
                  className="w-full transition-all h-12 text-base"
                >
                  {t('calculator.rooms.fourPlus')}
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="required" className="w-full">
              <TabsList className="grid grid-cols-2 w-full h-12">
                <TabsTrigger value="required" className="text-base">{t('calculator.expenses.required')}</TabsTrigger>
                <TabsTrigger value="additional" className="text-base">{t('calculator.expenses.additional')}</TabsTrigger>
              </TabsList>
              <TabsContent value="required" className="mt-6 space-y-5 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-berlin-gray/20 shadow-md">
                {getExpenseCategories()
                  .filter(category => category.isRequired)
                  .map(category => (
                    <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
                      <Label htmlFor={category.id} className="berlin-label text-base">
                        {category.name}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-berlin-amber">
                          <Euro className="h-5 w-5" />
                        </div>
                        <Input
                          id={category.id}
                          type="number"
                          min={0}
                          value={expenses[category.id] || (isFamilyBudget ? category.defaultAmountFamily : category.defaultAmountSingle)}
                          onChange={(e) => 
                            setExpenses({
                              ...expenses,
                              [category.id]: Number(e.target.value)
                            })
                          }
                          className="pl-12 text-base font-medium bg-white/90 dark:bg-gray-800/90"
                        />
                      </div>
                    </div>
                  ))
                }
              </TabsContent>
              <TabsContent value="additional" className="mt-6 space-y-5 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-berlin-gray/20 shadow-md">
                {getExpenseCategories()
                  .filter(category => !category.isRequired)
                  .map(category => (
                    <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
                      <Label htmlFor={category.id} className="berlin-label text-base">
                        {category.name}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-berlin-amber">
                          <Euro className="h-5 w-5" />
                        </div>
                        <Input
                          id={category.id}
                          type="number"
                          min={0}
                          value={expenses[category.id] || (isFamilyBudget ? category.defaultAmountFamily : category.defaultAmountSingle)}
                          onChange={(e) => 
                            setExpenses({
                              ...expenses,
                              [category.id]: Number(e.target.value)
                            })
                          }
                          className="pl-12 text-base font-medium bg-white/90 dark:bg-gray-800/90"
                        />
                      </div>
                    </div>
                  ))
                }
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={calculateAffordableRent} 
                className="w-full bg-berlin-yellow hover:bg-berlin-yellow/90 text-black font-semibold transition-all h-14 text-lg"
              >
                <Check className="mr-2 h-5 w-5" />
                {t('calculator.buttons.calculate')}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetCalculator}
                className="w-1/3 h-14 text-base"
              >
                <RefreshCcw className="mr-2 h-5 w-5" />
                {t('calculator.buttons.reset')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showResults && (
        <div className="mt-8 space-y-8 animate-slide-up">
          <div className="berlin-card text-center py-8 warm-gradient">
            <h2 className="berlin-subheading mb-2">{t('calculator.results.affordableRent')}</h2>
            <p className="text-5xl sm:text-6xl font-bold text-berlin-yellow bg-clip-text text-transparent bg-gradient-to-r from-berlin-yellow to-amber-500">
              €{affordableRent.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('calculator.results.basedOn', { income: monthlyIncome.toFixed(0), percentage: rentPercentage })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExpenseBreakdown 
              monthlyIncome={monthlyIncome}
              affordableRent={affordableRent}
              isFamilyBudget={isFamilyBudget}
              expenses={expenses}
            />
            
            <NeighborhoodMap 
              affordableBudget={affordableRent}
              roomType={roomType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
