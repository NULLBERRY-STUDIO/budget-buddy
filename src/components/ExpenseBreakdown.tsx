import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenseCategories } from '@/data/expenses';
import { CakeSlice, Coffee, CreditCard, Euro, Leaf, ShoppingBag, Utensils, CheckCircle2, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';

interface ExpenseBreakdownProps {
  monthlyIncome: number;
  affordableRent: number;
  isFamilyBudget: boolean;
  expenses: Record<string, number>;
}

// Icon mapping for expense categories
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'food':
      return <Utensils className="h-5 w-5 text-amber-500" />;
    case 'groceries':
      return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'utilities':
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    default:
      return <Coffee className="h-5 w-5 text-orange-400" />;
  }
};

// Define chart data types for better type safety
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  id: string;
}

export function ExpenseBreakdown({ 
  monthlyIncome, 
  affordableRent, 
  isFamilyBudget, 
  expenses 
}: ExpenseBreakdownProps) {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Calculate if income is sufficient
  const totalExpenses = Object.values(expenses).reduce((sum, value) => sum + value, 0) + affordableRent;
  const isAffordable = monthlyIncome >= totalExpenses;
  const remainingBudget = monthlyIncome - totalExpenses;
  const budgetRatio = Math.min(100, (totalExpenses / monthlyIncome) * 100);
  
  // Calculate rent percentage of income
  const rentPercentage = (affordableRent / monthlyIncome) * 100;
  const isRentPercentageHealthy = rentPercentage <= 30; // 30% rule of thumb
  
  // Get expense categories from our data module
  const expenseCategories = getExpenseCategories();
  
  // Prepare data for pie chart - sort by value for better visualization
  const chartData: ChartDataItem[] = [
    { name: t('neighborhoods.tableHeaders.rent'), value: affordableRent, color: '#F27127', id: 'rent' },
    ...expenseCategories.map(category => ({
      name: t(`expenses.categories.${category.id}`),
      value: expenses[category.id] || (isFamilyBudget ? category.defaultAmountFamily : category.defaultAmountSingle),
      color: category.isRequired ? '#F9CB40' : '#81C3D7',
      id: category.id
    }))
  ].sort((a, b) => b.value - a.value); // Sort by value descending

  // D3.js chart creation
  useEffect(() => {
    if (!chartRef.current) return;

    // Clear any existing SVG
    d3.select(chartRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = chartRef.current.clientWidth;
    const height = 350;
    const radius = Math.min(width, height) / 2;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create pie generator
    const pie = d3.pie<ChartDataItem>()
      .value(d => d.value)
      .sort(null);

    // Create arc generator for pie slices
    const arc = d3.arc<d3.PieArcDatum<ChartDataItem>>()
      .innerRadius(radius * 0.4) // Donut chart style
      .outerRadius(radius * 0.8);

    // Create pie slices
    const slices = svg.selectAll(".slice")
      .data(pie(chartData))
      .enter()
      .append("g")
      .attr("class", "slice");

    // Add path for each slice
    slices.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)
      .transition()
      .duration(800)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add hover effects
    slices.on("mouseover", function(event, d) {
      // Highlight the slice
      d3.select(this).select("path")
        .style("opacity", 1)
        .transition()
        .duration(300)
        .attr("d", d3.arc<d3.PieArcDatum<ChartDataItem>>()
          .innerRadius(radius * 0.4)
          .outerRadius(radius * 0.85));
      
      // Create tooltip/legend
      const tooltip = svg.append("g")
        .attr("class", "chart-tooltip")
        .style("opacity", 0)
        .attr("transform", "translate(0, 0)");
      
      // Add background for tooltip
      tooltip.append("rect")
        .attr("x", -100)
        .attr("y", 0)
        .attr("width", 200)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "rgba(255, 255, 255, 0.95)")
        .attr("stroke", d.data.color)
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))");
      
      // Add color indicator
      tooltip.append("rect")
        .attr("x", -85)
        .attr("y", 15)
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx", 3)
        .attr("fill", d.data.color);
      
      // Add category name
      tooltip.append("text")
        .attr("x", -55)
        .attr("y", 30)
        .attr("text-anchor", "start")
        .attr("font-size", "15px")
        .attr("font-weight", "600")
        .attr("fill", "#333333")
        .text(d.data.name);
      
      // Add value
      tooltip.append("text")
        .attr("x", -85)
        .attr("y", 55)
        .attr("text-anchor", "start")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#333333")
        .text(`€${d.data.value.toFixed(2)}`);
      
      // Add percentage
      const percentage = ((d.data.value / totalExpenses) * 100).toFixed(1);
      tooltip.append("text")
        .attr("x", 30)
        .attr("y", 55)
        .attr("text-anchor", "start")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", d.data.color)
        .text(`${percentage}%`);
      
      // Animate tooltip in
      tooltip.transition()
        .duration(300)
        .style("opacity", 1);
    }).on("mouseout", function() {
      // Reset slice appearance
      d3.select(this).select("path")
        .style("opacity", 0.8)
        .transition()
        .duration(300)
        .attr("d", arc);
      
      // Remove tooltip with fade effect
      svg.selectAll(".chart-tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
    });

    // Add center text
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("font-size", "14px")
      .attr("fill", "currentColor")
      .text(t('expenses.totalExpenses'));

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", isAffordable ? "#22c55e" : "#ef4444")
      .text(`€${totalExpenses.toFixed(0)}`);

  }, [chartData, chartRef, t, totalExpenses, isAffordable]);

  return (
    <Card className="berlin-card w-full overflow-hidden animate-fade-in border-berlin-amber/20 bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800">
      <CardHeader className="pb-2 bg-gradient-to-r from-berlin-amber/10 to-berlin-orange/10 dark:from-berlin-amber/5 dark:to-berlin-orange/5 backdrop-blur-sm border-b border-berlin-amber/10">
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <CakeSlice className="h-6 w-6 text-berlin-orange animate-pulse-subtle" />
            <span>{t('expenses.breakdown')}</span>
          </div>
          {isAffordable ? (
            <CheckCircle2 className="text-green-500 h-5 w-5" />
          ) : (
            <AlertCircle className="text-red-500 h-5 w-5" />
          )}
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
          {isAffordable 
            ? t('expenses.sufficient', { amount: remainingBudget.toFixed(2) })
            : t('expenses.insufficient', { amount: Math.abs(remainingBudget).toFixed(2) })
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Budget progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('expenses.budgetUsage')}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {budgetRatio.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={budgetRatio} 
            className="h-3 bg-neutral-200 dark:bg-neutral-700" 
            indicatorClassName={isAffordable ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-red-400 to-red-500"}
          />
        </div>
        
        {/* Rent percentage visualization */}
        <div className="px-6 pt-6">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5 text-berlin-orange" />
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">{t('neighborhoods.tableHeaders.rent')}</h3>
            </div>
            
            <div className="flex items-end gap-4">
              {/* Rent amount */}
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('expenses.amount')}</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white">€{affordableRent.toFixed(2)}</p>
              </div>
              
              {/* Rent percentage visualization */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('expenses.percentOfIncome')}</span>
                  <span className={`text-sm font-medium ${isRentPercentageHealthy ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {rentPercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative h-8 bg-neutral-200 dark:bg-neutral-700 rounded-md overflow-hidden">
                  {/* Zone colors with brighter gradients */}
                  <div className="absolute inset-0 flex">
                    <div className="w-[30%] h-full bg-gradient-to-r from-green-300/50 to-emerald-400/40 dark:from-green-400/60 dark:to-emerald-300/50"></div>
                    <div className="w-[20%] h-full bg-gradient-to-r from-amber-300/50 to-yellow-400/40 dark:from-amber-400/60 dark:to-yellow-300/50"></div>
                    <div className="w-[50%] h-full bg-gradient-to-r from-rose-300/50 to-red-400/40 dark:from-rose-400/60 dark:to-red-300/50"></div>
                  </div>
                  
                  {/* Rent percentage indicator */}
                  <div 
                    className={`absolute top-0 h-full flex items-center justify-center ${
                      isRentPercentageHealthy ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ 
                      width: '4px', 
                      left: `${Math.min(95, rentPercentage)}%`,
                      transform: 'translateX(-2px)'
                    }}
                  >
                    <div className={`absolute -top-1 w-3 h-3 rounded-full ${
                      isRentPercentageHealthy ? 'bg-green-500' : 'bg-amber-500'
                    }`}></div>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {isRentPercentageHealthy 
                    ? t('expenses.rentHealthyTip') 
                    : t('expenses.rentHighTip')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* D3.js Chart */}
        <div ref={chartRef} className="w-full mt-6 px-4" style={{ height: "350px" }}></div>
        
        {/* Expense categories */}
        <div className="px-6 pb-6 mt-4">
          <h3 className="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">{t('expenses.breakdown')}</h3>
          <div className="grid grid-cols-1 gap-3">
            {chartData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-gray-200 dark:border-gray-800 hover:border-berlin-amber/30 transition-all">
                <div className="flex items-center gap-2">
                  {item.id === 'rent' ? (
                    <Euro className="h-5 w-5 text-berlin-orange" />
                  ) : (
                    getCategoryIcon(item.id)
                  )}
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">€{item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Income and expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-t from-neutral-200/50 to-transparent dark:from-neutral-800/50 border-t border-gray-200 dark:border-gray-900">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-500" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{t('expenses.income')}</h3>
            </div>
            <p className="text-2xl font-bold text-green-500 mt-2">€{monthlyIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-900 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-berlin-orange" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{t('expenses.totalExpenses')}</h3>
            </div>
            <p className={`text-2xl font-bold mt-2 ${isAffordable ? 'text-green-500' : 'text-red-500'}`}>
              €{totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Remaining budget section */}
        {isAffordable && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 border-t border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <h3 className="text-base font-medium text-green-700 dark:text-green-300">{t('expenses.remainingBudget')}</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">€{remainingBudget.toFixed(2)}</p>
            <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-2">
              {t('expenses.doingGreat', { percent: ((remainingBudget / monthlyIncome) * 100).toFixed(0) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
