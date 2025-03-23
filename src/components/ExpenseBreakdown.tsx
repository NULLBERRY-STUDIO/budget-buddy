
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenseCategories } from '@/data/expenses';
import { CakeSlice, Coffee, CreditCard, Euro, Leaf, ShoppingBag, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
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

export function ExpenseBreakdown({ 
  monthlyIncome, 
  affordableRent, 
  isFamilyBudget, 
  expenses 
}: ExpenseBreakdownProps) {
  const { t } = useTranslation();
  
  // Calculate if income is sufficient
  const totalExpenses = Object.values(expenses).reduce((sum, value) => sum + value, 0) + affordableRent;
  const isAffordable = monthlyIncome >= totalExpenses;
  const remainingBudget = monthlyIncome - totalExpenses;
  const budgetRatio = Math.min(100, (totalExpenses / monthlyIncome) * 100);
  
  // Get expense categories from our data module
  const expenseCategories = getExpenseCategories();
  
  // Prepare data for pie chart - sort by value for better visualization
  const chartData = [
    { name: t('neighborhoods.tableHeaders.rent'), value: affordableRent, color: '#F27127', id: 'rent' },
    ...expenseCategories.map(category => ({
      name: t(`expenses.categories.${category.id}`),
      value: expenses[category.id] || (isFamilyBudget ? category.defaultAmountFamily : category.defaultAmountSingle),
      color: category.isRequired ? '#F9CB40' : '#81C3D7',
      id: category.id
    }))
  ].sort((a, b) => b.value - a.value); // Sort by value descending
  
  return (
    <Card className="berlin-card w-full overflow-hidden animate-fade-in border-berlin-amber/20 bg-gradient-to-br from-berlin-warmLight to-white dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-2 bg-gradient-to-r from-berlin-amber/10 to-berlin-orange/10 dark:from-berlin-amber/5 dark:to-berlin-orange/5 backdrop-blur-sm border-b border-berlin-amber/10">
        <CardTitle className="flex items-center justify-between text-berlin-darkBlue dark:text-berlin-amber">
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
        <CardDescription className="text-berlin-darkBlue/70 dark:text-berlin-warmLight/70 font-medium">
          {isAffordable 
            ? t('expenses.sufficient', { amount: remainingBudget.toFixed(2) })
            : t('expenses.insufficient', { amount: Math.abs(remainingBudget).toFixed(2) })
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Budget progress indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-berlin-darkBlue/80 dark:text-berlin-warmLight/80">{t('expenses.budgetUsage')}</span>
            <span className="text-sm font-medium text-berlin-darkBlue/80 dark:text-berlin-warmLight/80">
              {budgetRatio.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={budgetRatio} 
            className="h-2.5 bg-gray-200/50 dark:bg-gray-700/50" 
            indicatorClassName={isAffordable ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-red-400 to-red-500"}
          />
        </div>
        
        {/* Chart */}
        <div className="h-[270px] w-full mt-2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
                animationBegin={100}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`€${Number(value).toFixed(2)}`, '']}
                contentStyle={{ 
                  borderRadius: '0.75rem', 
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 12px',
                  fontFamily: '"Playfair Display", serif'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Expense categories */}
        <div className="px-6 pb-3">
          <div className="grid grid-cols-1 gap-2 mt-1">
            {chartData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-white/40 to-transparent dark:from-white/5 border border-berlin-amber/10 hover:border-berlin-amber/30 transition-all">
                <div className="flex items-center gap-2">
                  {item.id === 'rent' ? (
                    <Euro className="h-5 w-5 text-berlin-orange" />
                  ) : (
                    getCategoryIcon(item.id)
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-berlin-darkBlue dark:text-berlin-amber">€{item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Income and expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gradient-to-t from-berlin-amber/10 to-transparent border-t border-berlin-amber/10">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 border border-berlin-amber/20 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-500" />
              <h3 className="text-base font-medium text-berlin-darkBlue dark:text-berlin-amber">{t('expenses.income')}</h3>
            </div>
            <p className="text-2xl font-bold text-green-500 mt-1">€{monthlyIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 border border-berlin-amber/20 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-berlin-orange" />
              <h3 className="text-base font-medium text-berlin-darkBlue dark:text-berlin-amber">{t('expenses.totalExpenses')}</h3>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isAffordable ? 'text-green-500' : 'text-red-500'}`}>
              €{totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Remaining budget section */}
        {isAffordable && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 border-t border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <h3 className="text-base font-medium text-green-700 dark:text-green-300">{t('expenses.remainingBudget')}</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">€{remainingBudget.toFixed(2)}</p>
            <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
              {t('expenses.doingGreat', { percent: ((remainingBudget / monthlyIncome) * 100).toFixed(0) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
