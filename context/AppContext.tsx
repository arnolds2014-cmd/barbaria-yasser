import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'ingreso' | 'gasto';
export type AccountType = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  account: string;
  date: string;
  category: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  code: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface CashSession {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  openedAt: string;
  closedAt?: string;
  isOpen: boolean;
  sales: POSSale[];
  expenses: POSExpense[];
}

export interface POSSale {
  id: string;
  items: { productId: string; productName: string; price: number; quantity: number }[];
  total: number;
  date: string;
  paymentMethod: string;
}

export interface POSExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface UserProfile {
  name: string;
  businessName: string;
  rtn: string;
  phone: string;
  address: string;
}

interface AppContextType {
  transactions: Transaction[];
  accounts: Account[];
  products: Product[];
  cashSessions: CashSession[];
  currentSession: CashSession | null;
  userProfile: UserProfile;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  openCashSession: (openingBalance: number) => void;
  closeCashSession: (closingBalance: number) => void;
  addPOSSale: (sale: Omit<POSSale, 'id'>) => void;
  addPOSExpense: (expense: Omit<POSExpense, 'id'>) => void;
  updateUserProfile: (profile: UserProfile) => void;
  getTotalIngresos: () => number;
  getTotalGastos: () => number;
  getSaldoCaja: () => number;
  getInventarioTotal: () => number;
  getTotalActivos: () => number;
  getTotalPasivos: () => number;
  getTotalPatrimonio: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Caja General', type: 'activo', balance: 0, code: '1101' },
  { id: '2', name: 'Banco Atlántida', type: 'activo', balance: 0, code: '1102' },
  { id: '3', name: 'Inventario Productos', type: 'activo', balance: 0, code: '1201' },
  { id: '4', name: 'Equipo de Barbería', type: 'activo', balance: 0, code: '1301' },
  { id: '5', name: 'Proveedores', type: 'pasivo', balance: 0, code: '2101' },
  { id: '6', name: 'Préstamos Bancarios', type: 'pasivo', balance: 0, code: '2201' },
  { id: '7', name: 'Capital del Propietario', type: 'patrimonio', balance: 0, code: '3101' },
  { id: '8', name: 'Utilidades Retenidas', type: 'patrimonio', balance: 0, code: '3201' },
  { id: '9', name: 'Ventas de Servicios', type: 'ingreso', balance: 0, code: '4101' },
  { id: '10', name: 'Ventas de Productos', type: 'ingreso', balance: 0, code: '4201' },
  { id: '11', name: 'Arriendo Local', type: 'gasto', balance: 0, code: '5101' },
  { id: '12', name: 'Sueldos y Salarios', type: 'gasto', balance: 0, code: '5201' },
  { id: '13', name: 'Servicios Básicos', type: 'gasto', balance: 0, code: '5301' },
  { id: '14', name: 'Compra de Insumos', type: 'gasto', balance: 0, code: '5401' },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Corte Clásico', price: 120.00, quantity: 999, category: 'Servicios' },
  { id: '2', name: 'Corte + Barba', price: 180.00, quantity: 999, category: 'Servicios' },
  { id: '3', name: 'Afeitado', price: 80.00, quantity: 999, category: 'Servicios' },
  { id: '4', name: 'Shampoo Premium', price: 65.00, quantity: 10, category: 'Productos' },
  { id: '5', name: 'Pomada Fijadora', price: 90.00, quantity: 8, category: 'Productos' },
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Yasser',
  businessName: 'Barbería Yasser',
  rtn: '',
  phone: '',
  address: '',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) saveData();
  }, [transactions, accounts, products, cashSessions, currentSession, userProfile]);

  const loadData = async () => {
    try {
      const [txStr, accStr, prodStr, sessStr, currStr, profStr] = await Promise.all([
        AsyncStorage.getItem('transactions'),
        AsyncStorage.getItem('accounts'),
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('cashSessions'),
        AsyncStorage.getItem('currentSession'),
        AsyncStorage.getItem('userProfile'),
      ]);
      if (txStr) setTransactions(JSON.parse(txStr));
      if (accStr) setAccounts(JSON.parse(accStr));
      if (prodStr) setProducts(JSON.parse(prodStr));
      if (sessStr) setCashSessions(JSON.parse(sessStr));
      if (currStr) setCurrentSession(JSON.parse(currStr));
      if (profStr) setUserProfile(JSON.parse(profStr));
    } catch (e) {}
    setLoaded(true);
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('transactions', JSON.stringify(transactions)),
        AsyncStorage.setItem('accounts', JSON.stringify(accounts)),
        AsyncStorage.setItem('products', JSON.stringify(products)),
        AsyncStorage.setItem('cashSessions', JSON.stringify(cashSessions)),
        AsyncStorage.setItem('currentSession', JSON.stringify(currentSession)),
        AsyncStorage.setItem('userProfile', JSON.stringify(userProfile)),
      ]);
    } catch (e) {}
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT: Transaction = { ...t, id: generateId() };
    setTransactions(prev => [newT, ...prev]);
    setAccounts(prev => prev.map(acc => {
      if (acc.name === t.account) {
        const delta = t.type === 'ingreso' ? t.amount : -t.amount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));
  };

  const addAccount = (a: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...a, id: generateId() }]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: generateId() }]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const openCashSession = (openingBalance: number) => {
    const session: CashSession = {
      id: generateId(),
      openingBalance,
      openedAt: new Date().toISOString(),
      isOpen: true,
      sales: [],
      expenses: [],
    };
    setCurrentSession(session);
    setCashSessions(prev => [session, ...prev]);
  };

  const closeCashSession = (closingBalance: number) => {
    if (!currentSession) return;
    const closed = { ...currentSession, closingBalance, closedAt: new Date().toISOString(), isOpen: false };
    setCurrentSession(null);
    setCashSessions(prev => prev.map(s => s.id === closed.id ? closed : s));
  };

  const addPOSSale = (sale: Omit<POSSale, 'id'>) => {
    if (!currentSession) return;
    const newSale: POSSale = { ...sale, id: generateId() };
    const updated = { ...currentSession, sales: [...currentSession.sales, newSale] };
    setCurrentSession(updated);
    setCashSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const addPOSExpense = (expense: Omit<POSExpense, 'id'>) => {
    if (!currentSession) return;
    const newExp: POSExpense = { ...expense, id: generateId() };
    const updated = { ...currentSession, expenses: [...currentSession.expenses, newExp] };
    setCurrentSession(updated);
    setCashSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const getTotalIngresos = () => transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
  const getTotalGastos = () => transactions.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
  const getSaldoCaja = () => getTotalIngresos() - getTotalGastos();
  const getInventarioTotal = () => products.reduce((s, p) => s + p.price * p.quantity, 0);
  const getTotalActivos = () => accounts.filter(a => a.type === 'activo').reduce((s, a) => s + a.balance, 0);
  const getTotalPasivos = () => accounts.filter(a => a.type === 'pasivo').reduce((s, a) => s + a.balance, 0);
  const getTotalPatrimonio = () => accounts.filter(a => a.type === 'patrimonio').reduce((s, a) => s + a.balance, 0);

  return (
    <AppContext.Provider value={{
      transactions, accounts, products, cashSessions, currentSession, userProfile,
      addTransaction, addAccount, updateAccount, deleteAccount,
      addProduct, updateProduct, deleteProduct,
      openCashSession, closeCashSession, addPOSSale, addPOSExpense,
      updateUserProfile,
      getTotalIngresos, getTotalGastos, getSaldoCaja, getInventarioTotal,
      getTotalActivos, getTotalPasivos, getTotalPatrimonio,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
