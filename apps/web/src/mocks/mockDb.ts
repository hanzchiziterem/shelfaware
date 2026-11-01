import { DEFAULT_BRANDING_SETTINGS, PRODUCT_BRAND_NAME } from '@/app/config/branding';
import { INITIAL_CUSTOMERS } from '@/mocks/customers';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_BATCHES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STOCKTAKES,
  INITIAL_USERS,
} from '@/mocks/inventory';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/mocks/products';
import { INITIAL_SALES } from '@/mocks/sales';
import { INITIAL_SUPPLIERS } from '@/mocks/suppliers';
import type {
  AppNotification,
  BusinessSettings,
  Customer,
  Product,
  ProductCategory,
  PurchaseOrder,
  Sale,
  StockBatch,
  StockMovement,
  StocktakeSession,
  Supplier,
  User,
} from '@/types/common';

const STORAGE_KEY = 'shelfaware_pos_saas_mock_db_v2';

export interface MockDatabaseState {
  products: Product[];
  categories: ProductCategory[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  movements: StockMovement[];
  batches: StockBatch[];
  stocktakes: StocktakeSession[];
  purchases: PurchaseOrder[];
  users: User[];
  notifications: AppNotification[];
  settings: BusinessSettings;
  processedIdempotencyKeys: string[];
}

function getInitialDbState(): MockDatabaseState {
  return {
    products: structuredClone(INITIAL_PRODUCTS),
    categories: structuredClone(INITIAL_CATEGORIES),
    sales: structuredClone(INITIAL_SALES),
    customers: structuredClone(INITIAL_CUSTOMERS),
    suppliers: structuredClone(INITIAL_SUPPLIERS),
    movements: structuredClone(INITIAL_STOCK_MOVEMENTS),
    batches: structuredClone(INITIAL_STOCK_BATCHES),
    stocktakes: structuredClone(INITIAL_STOCKTAKES),
    purchases: structuredClone(INITIAL_PURCHASE_ORDERS),
    users: structuredClone(INITIAL_USERS),
    notifications: structuredClone(INITIAL_NOTIFICATIONS),
    settings: structuredClone(DEFAULT_BRANDING_SETTINGS),
    processedIdempotencyKeys: [],
  };
}

let memoryDb: MockDatabaseState | null = null;

export function loadMockDb(): MockDatabaseState {
  if (memoryDb) return memoryDb;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MockDatabaseState>;
        const defaults = getInitialDbState();
        memoryDb = {
          ...defaults,
          ...parsed,
          settings: {
            ...defaults.settings,
            ...(parsed.settings || {}),
            productBrandName: PRODUCT_BRAND_NAME,
          },
        };
        return memoryDb;
      }
    } catch {
      // Fallback to initial deterministic seed if localStorage is unavailable or corrupted
    }
  }
  memoryDb = getInitialDbState();
  return memoryDb;
}

export function saveMockDb(nextState: MockDatabaseState): void {
  nextState.settings.productBrandName = PRODUCT_BRAND_NAME;
  memoryDb = nextState;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Ignore quota errors in restricted environments
    }
  }
}

export function resetMockDb(): MockDatabaseState {
  const fresh = getInitialDbState();
  memoryDb = fresh;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return fresh;
}
