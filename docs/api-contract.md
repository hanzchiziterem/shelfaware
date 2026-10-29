# ShelfAware REST API Specification & Contract

## 1. Overview & Architecture

This document specifies the REST API contract for the **ShelfAware Point of Sale (POS) & Inventory Management SaaS** backend. The frontend application (`apps/web`) communicates through a centralized Axios client (`src/services/api/axiosInstance.ts`), and is architected to switch seamlessly between mock mode (`VITE_USE_MOCK_API=true`) and live backend API mode (`VITE_USE_MOCK_API=false`).

- **Proposed Versioned Base URL:** `/api/v1`
- **Default Port / Host:** `http://localhost:4000/api/v1` (configurable via `VITE_API_BASE_URL`)
- **Transport / Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Session / Auth Strategy:** Short-lived access token in memory (`Authorization: Bearer <token>`) combined with secure, `HttpOnly`, `SameSite=Lax` refresh/session cookies.

---

## 2. Standard Envelopes & Response Contracts

### 2.1 Standard Success Response
```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
```

### 2.2 Standard Paginated Response
```typescript
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2.3 Standard Error Response
```typescript
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string>; // Field-level validation messages
}
```

---

## 3. API Endpoints Specification

### A. Authentication & Session (`/auth`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `{ name, email, password, businessName, businessType }` | `ApiResponse<{ user, business, accessToken }>` | Register account & initiate onboarding |
| `POST` | `/auth/login` | `{ email, password, rememberMe }` | `ApiResponse<{ user, business, accessToken }>` | Authenticate user & set session cookie |
| `POST` | `/auth/logout` | None | `ApiResponse<null>` | Invalidate session & clear cookies |
| `GET` | `/auth/me` | None | `ApiResponse<{ user, business }>` | Fetch authenticated user & active business |
| `POST` | `/auth/verify-email` | `{ code: string }` | `ApiResponse<{ verified: boolean }>` | Verify email using 6-digit code |
| `POST` | `/auth/forgot-password` | `{ email: string }` | `ApiResponse<null>` | Request password recovery email |
| `POST` | `/auth/reset-password` | `{ token: string, password: string }` | `ApiResponse<null>` | Reset password using valid token |

---

### B. Business Profile & Settings (`/businesses`, `/settings`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/businesses/current` | None | `ApiResponse<Business>` | Retrieve active business details |
| `POST` | `/businesses` | `OnboardingRequest` | `ApiResponse<Business>` | Complete initial business setup |
| `GET` | `/settings` | None | `ApiResponse<BusinessSettings>` | Fetch POS, branding, and inventory settings |
| `PATCH` | `/settings` | `Partial<BusinessSettings>` | `ApiResponse<BusinessSettings>` | Update branding, receipts, and alert rules |

---

### C. Dashboard & Analytics (`/dashboard`, `/reports`)

| Method | Endpoint | Query / Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/overview` | None | `ApiResponse<DashboardOverview>` | Today's sales, profit, stock valuation, alerts |
| `GET` | `/dashboard/sales-trend`| `?range=today\|7d\|30d` | `ApiResponse<TrendItem[]>` | Hourly / daily sales trend |
| `GET` | `/dashboard/payments` | None | `ApiResponse<PaymentTenderBreakdown[]>` | Split of Cash vs Transfer vs Card |
| `GET` | `/dashboard/top-products`| None | `ApiResponse<TopProductItem[]>` | Fast-moving retail items by revenue |
| `GET` | `/reports/sales` | `?from=...&to=...` | `ApiResponse<SalesReport>` | Audited sales history & AOV |
| `GET` | `/reports/inventory` | None | `ApiResponse<ValuationReport>` | Retail vs cost valuation, potential profit |

---

### D. Products Catalog (`/products`, `/categories`)

| Method | Endpoint | Query / Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | `?search=&categoryId=&stockStatus=&page=&limit=` | `PaginatedResponse<Product>` | Filterable product catalog |
| `POST` | `/products` | `CreateProductPayload` | `ApiResponse<Product>` | Create product with unit & thresholds |
| `GET` | `/products/:id` | None | `ApiResponse<Product>` | Retrieve single product details |
| `PATCH` | `/products/:id` | `Partial<Product>` | `ApiResponse<Product>` | Update product fields |
| `DELETE`| `/products/:id` | None | `ApiResponse<Product>` | Archive / deactivate product |
| `GET` | `/categories` | None | `ApiResponse<ProductCategory[]>` | List categories |

---

### E. Point of Sale & Checkout (`/pos`) — *Atomic Transaction*

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/pos/checkout` | `CheckoutRequest` | `ApiResponse<Sale>` | Process atomic retail sale & deduct stock |

#### Checkout Request Contract:
```typescript
export interface CheckoutRequest {
  customerId?: string;
  customerName?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  payments: Array<{
    method: 'cash' | 'card' | 'bank_transfer';
    amount: number;
    reference?: string;
  }>;
  amountReceived: number;
  changeDue: number;
  notes?: string;
  idempotencyKey: string;
}
```
**Critical Invariants:**
1. **Server-Authoritative Totals:** The backend recalculates line subtotals, discounts, tax, and change due.
2. **Stock Validation:** Verifies available inventory for all items before committing.
3. **Atomicity:** The sale record, payment tender, and stock movement logs must commit inside a single database transaction.
4. **Idempotency:** Repeated requests with the same `idempotencyKey` return the existing committed sale without duplicating deductions.

---

### F. Sales & Orders (`/sales`)

| Method | Endpoint | Query / Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/sales` | `?search=&status=&paymentMethod=&page=&limit=` | `PaginatedResponse<Sale>` | Transaction history |
| `GET` | `/sales/:id` | None | `ApiResponse<Sale>` | Sale details & item breakdown |
| `POST` | `/sales/:id/void` | `{ reason: string }` | `ApiResponse<Sale>` | Auditable void transaction |

---

### G. Stock Control, Adjustments & Expiry (`/inventory`)

| Method | Endpoint | Query / Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/inventory/movements`| `?productId=&type=&page=&limit=` | `PaginatedResponse<StockMovement>` | Stock movements audit log |
| `GET` | `/inventory/batches` | `?expiryWindow=30\|60\|expired` | `ApiResponse<StockBatch[]>` | Perishable batches watch |
| `POST` | `/inventory/adjustments`| `{ productId, quantityChange, type, reason, notes }` | `ApiResponse<StockMovement>` | Manual stock adjustment |

---

### H. Purchases & Receiving (`/purchases`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/purchases` | None | `ApiResponse<PurchaseOrder[]>` | Purchase orders list |
| `POST` | `/purchases` | `CreatePurchasePayload` | `ApiResponse<PurchaseOrder>` | Create purchase order (Stock unaffected) |
| `POST` | `/purchases/:id/receive`| None | `ApiResponse<PurchaseOrder>` | Receive order -> Increments inventory & logs movement |

---

### I. Suppliers & Customers (`/suppliers`, `/customers`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/suppliers` | None | `ApiResponse<Supplier[]>` | Supplier directory |
| `POST` | `/suppliers` | `CreateSupplierPayload` | `ApiResponse<Supplier>` | Add supplier partner |
| `GET` | `/customers` | None | `ApiResponse<Customer[]>` | Customer directory with walk-in |
| `POST` | `/customers` | `CreateCustomerPayload` | `ApiResponse<Customer>` | Add customer loyalty account |

---

### J. Team & Access Control (`/users`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | None | `ApiResponse<User[]>` | Team members list |
| `POST` | `/users` | `{ name, email, role, phone }` | `ApiResponse<User>` | Invite staff member |
| `POST` | `/users/:id/toggle` | None | `ApiResponse<User>` | Activate / deactivate staff |

---

### K. Notifications (`/notifications`)

| Method | Endpoint | Request Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | None | `ApiResponse<AppNotification[]>` | Fetch store notifications |
| `PATCH`| `/notifications/:id/read` | None | `ApiResponse<null>` | Mark single alert as read |
| `POST` | `/notifications/read-all`| None | `ApiResponse<null>` | Mark all alerts as read |

