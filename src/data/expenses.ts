
export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  defaultAmountSingle: number;
  defaultAmountFamily: number;
  description: string;
  isRequired: boolean;
}

let expenseCategories: ExpenseCategory[] = [];

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  if (expenseCategories.length > 0) {
    return expenseCategories;
  }
  
  try {
    const response = await fetch('/data/expenses.json');
    if (!response.ok) {
      throw new Error('Failed to fetch expense data');
    }
    
    expenseCategories = await response.json();
    return expenseCategories;
  } catch (error) {
    console.error('Error loading expense data:', error);
    return [];
  }
};

export const getExpenseCategories = (): ExpenseCategory[] => {
  return expenseCategories;
};

export const calculateTotalExpenses = (isFamilyBudget: boolean, customExpenses: Record<string, number> = {}) => {
  return expenseCategories.reduce((total, category) => {
    const customAmount = customExpenses[category.id];
    const defaultAmount = isFamilyBudget 
      ? category.defaultAmountFamily 
      : category.defaultAmountSingle;
    
    const amount = customAmount !== undefined ? customAmount : defaultAmount;
    return total + amount;
  }, 0);
};

export const calculateRequiredExpenses = (isFamilyBudget: boolean, customExpenses: Record<string, number> = {}) => {
  return expenseCategories
    .filter(category => category.isRequired)
    .reduce((total, category) => {
      const customAmount = customExpenses[category.id];
      const defaultAmount = isFamilyBudget 
        ? category.defaultAmountFamily 
        : category.defaultAmountSingle;
      
      const amount = customAmount !== undefined ? customAmount : defaultAmount;
      return total + amount;
    }, 0);
};
