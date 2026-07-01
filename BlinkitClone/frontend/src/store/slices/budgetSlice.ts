import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Budget, BudgetOverflowResponse } from '../../types';

interface BudgetState {
  activeBudget: Budget | null;
  skippedPopup: boolean;
  showPopup: boolean;
  overflowDetails: BudgetOverflowResponse | null;
  loading: boolean;
}

const getStoredSkipped = (): boolean => {
  return sessionStorage.getItem('budget_skipped') === 'true';
};

const initialState: BudgetState = {
  activeBudget: null,
  skippedPopup: getStoredSkipped(),
  showPopup: false,
  overflowDetails: null,
  loading: false,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgetStart(state) {
      state.loading = true;
    },
    setBudgetSuccess(state, action: PayloadAction<Budget>) {
      state.loading = false;
      state.activeBudget = action.payload;
      state.showPopup = false;
      state.skippedPopup = false;
      sessionStorage.removeItem('budget_skipped');
    },
    setBudgetFailure(state) {
      state.loading = false;
    },
    loadBudget(state, action: PayloadAction<Budget | null>) {
      state.activeBudget = action.payload;
      if (action.payload) {
        state.skippedPopup = false;
      }
    },
    skipBudgetPopup(state) {
      state.skippedPopup = true;
      state.showPopup = false;
      sessionStorage.setItem('budget_skipped', 'true');
    },
    triggerBudgetPopup(state, action: PayloadAction<boolean>) {
      state.showPopup = action.payload;
    },
    setOverflowDetails(state, action: PayloadAction<BudgetOverflowResponse | null>) {
      state.overflowDetails = action.payload;
    },
    clearBudget(state) {
      state.activeBudget = null;
      state.overflowDetails = null;
      state.skippedPopup = false;
      sessionStorage.removeItem('budget_skipped');
    }
  },
});

export const {
  setBudgetStart,
  setBudgetSuccess,
  setBudgetFailure,
  loadBudget,
  skipBudgetPopup,
  triggerBudgetPopup,
  setOverflowDetails,
  clearBudget,
} = budgetSlice.actions;

export default budgetSlice.reducer;
