import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseBreakdown } from "@/components/ExpenseBreakdown";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { Neighborhood, fetchNeighborhoods } from "@/data/neighborhoods";
import { calculateRequiredExpenses, fetchExpenseCategories, getExpenseCategories } from "@/data/expenses";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calculator as CalculatorIcon, Users, User, Check, RefreshCcw, Euro, Calendar, Home, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Calculator() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState(2500);
  const [isFamilyBudget, setIsFamilyBudget] = useState(false);
  const [rentPercentage, setRentPercentage] = useState(36); // Default to Berlin average
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
  }, [isFamilyBudget, setIsLoading, setExpenses, setLastDataUpdate]);
  
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
  }, [isFamilyBudget, setExpenses]);
  
  // Calculate affordable rent whenever inputs change
  useEffect(() => {
    if (isLoading) return; // Skip calculation while loading initial data
    
    if (monthlyIncome <= 0) return;
    
    // Calculate affordable rent using the percentage rule
    const calculatedRent = monthlyIncome * (rentPercentage / 100);
    
    // Check if this rent is actually affordable considering other expenses
    const requiredExpenses = calculateRequiredExpenses(isFamilyBudget, expenses);
    const totalAvailable = monthlyIncome - requiredExpenses;
    
    // Use the lower of the two as the truly affordable rent
    const trueAffordableRent = Math.min(calculatedRent, totalAvailable);
    
    setAffordableRent(trueAffordableRent > 0 ? trueAffordableRent : 0);
    setShowResults(true);
  }, [monthlyIncome, rentPercentage, isFamilyBudget, expenses, isLoading]);
  
  const calculateAffordableRent = () => {
    if (monthlyIncome <= 0) {
      toast.error("Please enter a valid monthly income");
      return;
    }
    
    // Show appropriate toast message based on the current calculation
    const calculatedRent = monthlyIncome * (rentPercentage / 100);
    const requiredExpenses = calculateRequiredExpenses(isFamilyBudget, expenses);
    const totalAvailable = monthlyIncome - requiredExpenses;
    const trueAffordableRent = Math.min(calculatedRent, totalAvailable);
    
    if (trueAffordableRent <= 0) {
      toast.error("Your income doesn't cover basic expenses, please check your budget");
    } else if (trueAffordableRent < calculatedRent * 0.7) {
      toast.warning("Your actual affordable rent is lower than expected due to other expenses");
    } else {
      toast.success("Calculation complete! Scroll down to see results");
    }
    
    // Ensure results are visible
    setShowResults(true);
    
    // Scroll to results section
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const resetCalculator = () => {
    setShowResults(false);
    setMonthlyIncome(2500);
    setIsFamilyBudget(false);
    setRentPercentage(36); // Reset to Berlin average
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading latest rental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full animate-fade-in bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle className="flex items-center space-x-3 text-3xl md:text-4xl text-slate-900 dark:text-white">
                <CalculatorIcon className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                <span>{t('calculator.title')}</span>
              </CardTitle>
              <CardDescription className="text-base mt-1 text-slate-600 dark:text-slate-400">
                {t('calculator.description')}
              </CardDescription>
            </div>
            {lastDataUpdate && (
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2 sm:mt-0">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{t('common.dataAsOf')}: {formatDate(lastDataUpdate)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            <div className="grid gap-3">
              <Label htmlFor="income" className="text-base text-slate-800 dark:text-slate-200">{t('calculator.income')}</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-indigo-500 dark:text-indigo-400">
                  <Euro className="h-5 w-5" />
                </div>
                <Input
                  id="income"
                  type="number"
                  min={0}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="pl-12 text-lg h-14 font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-3">
                <Label htmlFor="familyBudget" className="text-base cursor-pointer text-slate-800 dark:text-slate-200">
                  {isFamilyBudget ? (
                    <Users className="h-5 w-5 inline mr-2 text-indigo-500 dark:text-indigo-400" />
                  ) : (
                    <User className="h-5 w-5 inline mr-2 text-indigo-500 dark:text-indigo-400" />
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
            
            <div className="space-y-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <label htmlFor="rentPercentage" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {t('calculator.rentPercentage')}
                </label>
              </div>
              
              {/* Rent percentage selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{rentPercentage.toFixed(1)}%</span>
                  <div className="flex items-center gap-1">
                    {rentPercentage <= 30 ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : rentPercentage === 36 ? (
                      <Info className="h-4 w-4 text-slate-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      rentPercentage <= 30 ? 'text-emerald-600 dark:text-emerald-400' : 
                      rentPercentage === 36 ? 'text-slate-600 dark:text-slate-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`}>
                      {rentPercentage <= 30 
                        ? t('calculator.recommendedValue') 
                        : rentPercentage === 36
                        ? t('calculator.berlinAverage')
                        : t('calculator.highValue')}
                    </span>
                  </div>
                </div>
                
                {/* Percentage visualization */}
                <div className="relative h-16 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  {/* Percentage zones with brighter gradients */}
                  <div className="absolute inset-0 flex">
                    <div className="w-[30%] h-full bg-gradient-to-r from-emerald-300/50 to-emerald-400/40 dark:from-emerald-500/60 dark:to-emerald-400/50"></div>
                    <div className="w-[6%] h-full bg-gradient-to-r from-amber-300/50 to-amber-400/40 dark:from-amber-500/60 dark:to-amber-400/50"></div>
                    <div className="w-[64%] h-full bg-gradient-to-r from-rose-300/50 to-rose-400/40 dark:from-rose-500/60 dark:to-rose-400/50"></div>
                  </div>
                  
                  {/* Percentage buttons */}
                  <div className="absolute inset-0 flex">
                    {[20, 25, 30, 36, 40, 45].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => setRentPercentage(percent)}
                        className={`h-full flex-1 flex flex-col items-center justify-center relative transition-all ${
                          rentPercentage === percent 
                            ? 'bg-white dark:bg-slate-800 shadow-md z-10 scale-105' 
                            : 'hover:bg-white/50 dark:hover:bg-slate-700/50'
                        } ${
                          percent === 36 && rentPercentage !== percent
                            ? 'border-t-2 border-slate-400 dark:border-slate-500'
                            : ''
                        }`}
                      >
                        <span className={`text-lg font-bold ${
                          rentPercentage === percent 
                            ? percent <= 30 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : percent === 36
                                ? 'text-slate-600 dark:text-slate-300'
                                : 'text-amber-600 dark:text-amber-400'
                            : percent === 36
                              ? 'text-slate-700 dark:text-slate-300 underline decoration-dotted decoration-slate-500'
                              : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {percent}%
                        </span>
                        {rentPercentage === percent && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-full bg-indigo-500"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Explanation text */}
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {rentPercentage <= 30 
                    ? t('calculator.rentPercentageHealthyTip') 
                    : rentPercentage === 36
                    ? t('calculator.rentPercentageBerlinTip')
                    : t('calculator.rentPercentageHighTip')}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base text-slate-800 dark:text-slate-200">{t('calculator.apartmentSize')}</Label>
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
              <TabsContent value="required" className="mt-6 space-y-5 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {getExpenseCategories()
                  .filter(category => category.isRequired)
                  .map(category => (
                    <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
                      <Label htmlFor={category.id} className="text-base text-slate-800 dark:text-slate-200">
                        {category.name}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-indigo-500 dark:text-indigo-400">
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
                          className="pl-12 text-base font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  ))}
              </TabsContent>
              <TabsContent value="additional" className="mt-6 space-y-5 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {getExpenseCategories()
                  .filter(category => !category.isRequired)
                  .map(category => (
                    <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
                      <Label htmlFor={category.id} className="text-base text-slate-800 dark:text-slate-200">
                        {category.name}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-indigo-500 dark:text-indigo-400">
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
                          className="pl-12 text-base font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={calculateAffordableRent}
                size="lg"
                className="flex-1 h-14 text-base font-semibold"
              >
                <Check className="mr-2 h-5 w-5" /> {t('calculator.buttons.calculate')}
              </Button>
              <Button 
                onClick={resetCalculator}
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-base font-semibold"
              >
                <RefreshCcw className="mr-2 h-5 w-5" /> {t('calculator.buttons.reset')}
              </Button>
            </div>
          </div>
          
          {/* Results Section */}
          {showResults && (
            <div id="results-section" className="mt-16 animate-fade-in">
              <div className="flex flex-col gap-8">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('calculator.results.title')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    {t('calculator.results.description')}
                  </p>
                </div>
                
                <ExpenseBreakdown 
                  monthlyIncome={monthlyIncome}
                  affordableRent={affordableRent}
                  isFamilyBudget={isFamilyBudget}
                  expenses={expenses}
                />
                
                <NeighborhoodMap 
                  affordableRent={affordableRent}
                  roomType={roomType}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
