
## 1. YOUR ROLE

Act as a senior frontend engineer, SaaS product designer, UI/UX designer, and software architect.

Your task is to design and implement a polished, realistic, production-quality frontend for a **Point of Sale (POS) and Inventory Management System** intended initially for a local foodstuff and grocery store in Nigeria, but architected as a reusable, white-label SaaS product that can be customized and sold to multiple businesses.

Do not merely generate a dashboard mockup. Build a cohesive, navigable application with functional interactions, reusable components, realistic data, thoughtful empty states, responsive layouts, and a maintainable codebase.

Prioritize the quality of the implementation, visual consistency, modular architecture, usability, and completeness.

## 2. DESIGN REFERENCES — FOLLOW THE UPLOADED IMAGES

Study both uploaded reference images before writing code.

Use them as the primary visual direction for the entire application.

The references show a modern enterprise dashboard with:

- A dark navy/near-black vertical sidebar.
    
- A clean white and light-neutral main workspace.
    
- A restrained grayscale palette with subtle borders and shadows.
    
- Compact, highly readable data tables.
    
- Clear typography and a strong visual hierarchy.
    
- Rounded filter chips and understated buttons.
    
- Contextual detail panels and floating drawers.
    
- Small status indicators and restrained green/red accents.
    
- Analytics cards, progress indicators, and simple charts.
    
- Dense but organized enterprise information layouts.
    
- Minimal decorative elements and no unnecessary gradients.
    

Reproduce the underlying design language and interaction patterns rather than copying irrelevant industrial inventory data from the images.

Adapt the system specifically for grocery retail, foodstuff sales, stock control, and daily business operations.

### Visual requirements

1. Keep the sidebar dark navy, close to the references.
    
2. Keep the primary workspace white, with very light gray backgrounds where appropriate.
    
3. Use dark text for primary content and muted gray for secondary information.
    
4. Use green for successful transactions, paid orders, healthy stock, and positive indicators.
    
5. Use red for failed transactions, cancelled orders, and critical stock warnings.
    
6. Use amber sparingly for expiring products, low stock, and pending actions.
    
7. Use thin borders, subtle shadows, restrained radii, and consistent spacing.
    
8. Use compact but comfortable table rows.
    
9. Use consistent typography throughout the application.
    
10. Use the uploaded images as visual references across the dashboard, inventory, order management, and product detail views.
    

Do not redesign the application into a generic colorful admin template.

Avoid excessive gradients, glassmorphism, oversized headings, enormous empty cards, excessive rounded corners, unnecessary animations, and decorative elements that reduce information density.

### Typography

Use a professional, readable sans-serif font. Prefer Inter or a similar modern enterprise UI font.

Load the font properly and make it configurable through the design system.

Use consistent typography tokens for headings, body text, labels, table content, and captions.

### Branding

The application must not be permanently tied to a single store or company.

Create a centralized branding configuration that controls:

- Business or product name.
    
- Logo or logo component.
    
- Favicon where applicable.
    
- Brand accent color.
    
- Typography.
    
- Sidebar appearance.
    
- Border radius and density preferences.
    
- Currency and locale.
    
- Business contact information.
    

Create a sensible placeholder brand, such as "Mate", inspired by the reference images. Do not hardcode the brand name across individual components.

Use a reusable logo component that supports a text-based logo, an optional icon, and a future uploaded logo image.

The brand name and logo must be replaceable without modifying individual page components.

## 3. PRODUCT OBJECTIVE

Build a reusable web application for businesses selling products such as:

- Rice.
    
- Beans.
    
- Garri.
    
- Indomie and other noodles.
    
- Tin tomatoes.
    
- Vegetable oil.
    
- Frozen fish and other frozen foods.
    
- Flour and semolina.
    
- Sugar and salt.
    
- Seasonings.
    
- Other groceries and foodstuff products.
    

The application must support the workflows of a shop owner, manager, and cashier.

The first target business is a local Nigerian foodstuff store, so the UI should feel practical for daily retail operations rather than like a large industrial warehouse management system.

Use realistic Nigerian retail examples, sample products, and prices in naira (₦).

The product should eventually be capable of supporting multiple businesses with their own branding, settings, products, users, and inventory. For this frontend, implement the appropriate interfaces and configuration boundaries without pretending that a backend or multi-tenant infrastructure already exists.

## 4. TECHNOLOGY STACK

First inspect the existing repository and identify the framework, package manager, installed dependencies, and existing conventions.

If a project already exists, preserve its architecture where reasonable and integrate your implementation instead of unnecessarily replacing everything.

If starting from an empty project, use:

- React.
    
- TypeScript with strict typing.
    
- Vite.
    
- React Router for routing.
    
- Tailwind CSS for styling, if compatible with the environment.
    
- Lucide React for icons.
    
- Recharts for charts where needed.
    
- React Hook Form and Zod for form validation.
    
- A suitable lightweight state management solution only when it provides genuine value.
    
- A toast notification library, if appropriate.
    

Use the existing compatible versions of installed dependencies where possible. Do not blindly reinstall or upgrade packages.

Do not add unnecessary dependencies.

Use semantic HTML, accessible controls, clear component boundaries, and typed interfaces.

## 5. SOFTWARE ARCHITECTURE — STRICT REQUIREMENTS

**Do not put the entire application in one TypeScript or TSX file.**

Do not create a giant App.tsx containing all pages, business logic, navigation, mock data, tables, forms, and components.

Organize the project like a professional software engineering codebase.

Use a feature-oriented architecture with clear separation between application infrastructure, reusable UI, domain features, routes, types, configuration, and utilities.

Use an architecture similar to the following. Adapt it where the existing repository requires a different structure.

src/  
app/  
App.tsx  
providers/  
router/  
index.tsx  
routeConfig.tsx  
paths.ts  
layouts/  
AppLayout.tsx  
AuthLayout.tsx  
DashboardLayout.tsx  
config/  
branding.ts  
navigation.ts  
permissions.ts

assets/  
images/  
icons/

components/  
ui/  
Button.tsx  
Input.tsx  
Select.tsx  
Dialog.tsx  
Drawer.tsx  
Badge.tsx  
Card.tsx  
Table.tsx  
DropdownMenu.tsx  
SearchInput.tsx  
DateRangePicker.tsx  
EmptyState.tsx  
LoadingState.tsx  
ErrorState.tsx  
Pagination.tsx  
layout/  
Sidebar.tsx  
SidebarItem.tsx  
Topbar.tsx  
Breadcrumbs.tsx  
PageHeader.tsx  
UserMenu.tsx  
data-display/  
feedback/

features/  
auth/  
pages/  
components/  
schemas/  
services/  
types.ts

```
dashboard/
  pages/
  components/
  services/
  types.ts

pos/
  pages/
  components/
  hooks/
  services/
  types.ts

products/
  pages/
  components/
  hooks/
  services/
  schemas/
  types.ts

inventory/
  pages/
  components/
  services/
  types.ts

sales/
  pages/
  components/
  services/
  types.ts

purchases/
  pages/
  components/
  services/
  types.ts

customers/
  pages/
  components/
  services/
  types.ts

suppliers/
  pages/
  components/
  services/
  types.ts

reports/
  pages/
  components/
  services/
  types.ts

users/
  pages/
  components/
  services/
  types.ts

notifications/
  pages/
  components/
  services/
  types.ts

settings/
  pages/
  components/
  sections/
  services/
  types.ts
```

hooks/  
lib/  
services/  
store/  
types/  
common.ts  
api.ts  
utils/  
currency.ts  
dates.ts  
formatters.ts  
validation.ts

styles/  
globals.css  
tokens.css

mocks/  
products.ts  
sales.ts  
customers.ts  
suppliers.ts  
dashboard.ts

main.tsx

This is a structural guide, not an instruction to create dozens of empty files. Create files that serve a real purpose and keep related code together.

### Architecture rules

- Keep components small, cohesive, and reusable.
    
- Extract repeated UI patterns into reusable components.
    
- Keep business calculations out of presentation components.
    
- Keep mock data separate from page components.
    
- Keep currency and date formatting in utilities.
    
- Keep form schemas separate from page rendering.
    
- Use TypeScript interfaces and types for important domain entities.
    
- Avoid `any` unless there is a documented, unavoidable reason.
    
- Avoid massive nested ternaries and unreadable conditional rendering.
    
- Avoid duplicating sidebar and layout code across pages.
    
- Avoid circular imports.
    
- Do not place every type in one enormous global types file.
    
- Do not create unnecessary abstractions for trivial components.
    
- Use clear and consistent naming conventions.
    
- Comment important architectural decisions and non-obvious business rules.
    

### Routing rules — IMPORTANT

Use React Router.

Define the route configuration as exported arrays in dedicated route configuration files, then import those arrays into the router.

For example, conceptually:

- Public routes are exported from an authentication route configuration.
    
- Protected application routes are exported from an application route configuration.
    
- Routes are combined by the central router.
    
- Shared layouts wrap groups of routes.
    
- Route paths are centralized in a paths configuration file.
    

Use actual typed React Router route objects where appropriate.

Do not define all routes inline inside a giant App component.

Include:

- Public route handling.
    
- Protected route handling.
    
- Authentication-aware redirects.
    
- A not-found route.
    
- A reusable application layout.
    
- A reusable authentication layout.
    
- A sensible default redirect.
    

Do not create fake authentication security. The frontend may simulate authentication for demonstration, but clearly separate that simulation from production authentication.

## 6. WHITE-LABEL DESIGN SYSTEM

Create a small but professional design system that controls the application's appearance centrally.

Create a `branding.ts` or equivalent configuration with a structure for:

- Product name.
    
- Business name.
    
- Logo configuration.
    
- Primary and accent colors.
    
- Sidebar background.
    
- Main background.
    
- Surface colors.
    
- Text colors.
    
- Border colors.
    
- Success, warning, and danger colors.
    
- Font family.
    
- Base font size.
    
- Border radius.
    
- Table density.
    
- Currency.
    
- Locale.
    

Use CSS custom properties to apply the theme globally.

For example, define semantic tokens such as:

--color-primary  
--color-sidebar  
--color-background  
--color-surface  
--color-border  
--color-text-primary  
--color-text-muted  
--color-success  
--color-warning  
--color-danger  
--font-family  
--radius-control

These are illustrative token names; use a consistent naming scheme.

Components must consume semantic tokens rather than hardcoding colors in every file.

Provide a settings interface that allows users to preview and change supported branding options. Persist local demo preferences where appropriate.

Changing the business name, accent color, font, or logo must not require editing individual pages.

Do not create a complicated theme engine. Keep the solution practical, typed, and maintainable.

## 7. APPLICATION NAVIGATION

Create a persistent dark sidebar inspired by the reference images.

Include a configurable logo and brand name at the top, a search or quick-navigation field, grouped navigation items, notification indicators where appropriate, and a user profile section at the bottom.

Suggested navigation:

- Dashboard
    
- Point of Sale
    
- Orders / Sales
    
- Products
    
- Inventory
    
- Purchases
    
- Suppliers
    
- Customers
    
- Reports
    
- Team & Users
    
- Notifications
    
- Settings
    
- Help & Support
    

Use appropriate icons and active route styling.

Allow the sidebar to collapse on desktop and convert to a mobile drawer on small screens.

Navigation items must be generated from a central configuration instead of being independently hardcoded in multiple components.

Support role-aware navigation for administrator, manager, and cashier roles.

Do not display links that lead to nonexistent pages unless they are explicitly disabled and marked as unavailable.

## 8. REQUIRED PAGES AND FEATURES

Build the following pages as real, navigable screens.

### A. Authentication

#### 1. Login page

Create a clean, professional login screen that follows the application's visual language.

Include:

- Configurable brand logo and name.
    
- Email field.
    
- Password field with visibility toggle.
    
- Remember me option.
    
- Forgot password link.
    
- Login button.
    
- Validation and error messages.
    
- Loading state.
    
- Link to registration, where appropriate.
    

Keep the form focused and avoid unnecessary elements.

#### 2. Sign-up page

Include:

- Full name.
    
- Email.
    
- Password.
    
- Confirm password.
    
- Terms acceptance.
    
- Form validation.
    
- Password strength feedback.
    
- Link to login.
    

#### 3. Business onboarding page

After registration, guide a new business through a simple onboarding flow.

Collect:

- Business or store name.
    
- Business type.
    
- Owner or administrator name.
    
- Phone number.
    
- Business email.
    
- Address.
    
- Currency and locale.
    
- Optional logo.
    

Use NGN and an appropriate Nigerian locale as initial defaults, but keep these configurable.

Provide a progress indicator and allow the user to review the information before completing onboarding.

#### 4. Email verification page

Include:

- Email confirmation message.
    
- Six-digit verification code interface.
    
- Resend code action with a countdown.
    
- Change email option.
    
- Success and error states.
    

Use a simulated verification flow if no backend exists.

#### 5. Forgot password and reset password

Include validated forms, password confirmation, success feedback, and links back to login.

Do not imply that emails have actually been sent when using mock functionality.

### B. Dashboard / Admin Overview

Create a dashboard inspired by the analytics and information density in the reference images.

Include a page title and contextual date filter.

Display useful KPI cards:

- Today's sales.
    
- Number of transactions.
    
- Estimated gross profit.
    
- Total inventory value.
    
- Low-stock products.
    
- Products approaching expiry.
    

Include:

- Sales trend chart.
    
- Payment method breakdown.
    
- Recent transactions table.
    
- Low-stock alert list.
    
- Top-selling products.
    
- Recent stock movements.
    
- Quick actions for new sale, add product, and record stock purchase.
    

Use realistic sample data.

Keep the layout balanced and avoid filling the screen with too many equally prominent cards.

Do not present gross revenue as profit. Clearly label estimates and distinguish sales revenue, cost of goods sold, and gross profit.

### C. Point of Sale — PRIORITY FEATURE

Treat the POS as one of the most important pages.

Design it for a cashier who needs to serve customers quickly, potentially using a laptop, desktop, or touchscreen.

Use a practical two-column layout on desktop.

**Main product area:**

- Search products by name, SKU, or barcode.
    
- Category filters.
    
- Product cards or a compact product grid.
    
- Product image or consistent fallback icon.
    
- Product name.
    
- Selling price.
    
- Stock availability.
    
- Unit of measurement.
    
- Quick add-to-cart interaction.
    
- Stock-aware disabled states.
    

**Cart area:**

- Selected products.
    
- Quantity adjustment.
    
- Remove item.
    
- Unit price.
    
- Line subtotal.
    
- Discount controls.
    
- Subtotal.
    
- Tax, if configured.
    
- Grand total.
    
- Clear cart action.
    
- Customer selection, with a walk-in customer default.
    

**Checkout flow:**

- Payment method selection.
    
- Cash payment with amount received and change calculation.
    
- Bank transfer.
    
- POS terminal/card payment.
    
- Optional split payment interface.
    
- Order confirmation dialog.
    
- Transaction success state.
    
- Receipt preview.
    
- Print receipt action.
    

Include a keyboard-friendly interaction pattern where useful.

Important business rules:

- Never allow quantities to exceed available stock in the demo.
    
- Recalculate totals when quantities, discounts, or products change.
    
- Validate payment amounts.
    
- Calculate cash change correctly.
    
- Prevent empty-cart checkout.
    
- Avoid creating duplicate sales when the checkout button is clicked repeatedly.
    
- Show clear feedback for successful and failed simulated transactions.
    
- Update the demo inventory and sales history after a completed sale.
    
- Clearly label simulated payment integrations as demonstrations.
    

Do not claim to process real bank transfers or card payments without a backend and payment provider integration.

### D. Products Management

Create a product listing page with:

- Search.
    
- Category filters.
    
- Stock status filters.
    
- Sorting.
    
- Pagination.
    
- Add product action.
    
- Edit product action.
    
- Product details drawer.
    
- Archive or deactivate action.
    
- Bulk selection and appropriate bulk actions.
    

Include columns such as:

- Product.
    
- SKU or barcode.
    
- Category.
    
- Unit.
    
- Selling price.
    
- Cost price, restricted to appropriate roles.
    
- Stock quantity.
    
- Stock status.
    
- Last updated.
    

Create a reusable product form supporting:

- Product name.
    
- SKU.
    
- Barcode.
    
- Category.
    
- Description.
    
- Unit of measurement.
    
- Cost price.
    
- Selling price.
    
- Initial stock quantity.
    
- Minimum stock threshold.
    
- Optional supplier.
    
- Expiry tracking configuration.
    
- Product image.
    

Support common foodstuff units such as:

- Piece.
    
- Pack.
    
- Carton.
    
- Bag.
    
- Kilogram.
    
- Gram.
    
- Litre.
    
- Bottle.
    

Allow unit configuration to vary by product.

For example, rice may be sold by the bag and kilogram, while noodles may be sold by the carton or individual pack.

Do not assume that every product uses the same unit or that every product supports fractional quantities.

### E. Inventory Management

Follow the reference image's structured table and contextual detail-panel approach.

Include:

- Total inventory value.
    
- Total active products.
    
- Low-stock count.
    
- Out-of-stock count.
    
- Inventory movement history.
    
- Current stock quantities.
    
- Stock status badges.
    
- Search and filtering.
    
- Category filters.
    
- Stock adjustment action.
    
- Stock transfer interface only if relevant to the configured business.
    
- Stock count / stocktake interface.
    
- Reorder threshold management.
    
- Stock adjustment history.
    
- Inventory valuation view.
    

Provide a stock adjustment dialog with:

- Product.
    
- Current quantity.
    
- Adjustment type.
    
- Quantity to add or remove.
    
- Reason.
    
- Notes.
    
- Confirmation.
    

Maintain a movement history with timestamps, quantities, reasons, and responsible users.

Stock adjustments must update the local demo state consistently.

Do not let users silently overwrite inventory quantities without an appropriate adjustment flow.

### F. Expiry and Perishable Stock

This is important for a foodstuff store.

Create a useful interface for products with expiry dates, particularly frozen foods and packaged groceries.

Include:

- Expired products.
    
- Products expiring soon.
    
- Expiry date.
    
- Available quantity.
    
- Stock value at risk, where sufficient data exists.
    
- Batch or lot identifier.
    
- Filtering by expiry window.
    

Allow expiry tracking to be enabled or disabled per product.

Use realistic warning states.

Do not imply that expiry is tracked for products whose batches have no expiry information.

### G. Sales / Orders Management

Use the reference images as the primary visual guide for this page.

Include:

- Searchable transaction table.
    
- Transaction number.
    
- Date and time.
    
- Cashier.
    
- Customer.
    
- Items count.
    
- Total.
    
- Payment method.
    
- Payment status.
    
- Sale status.
    
- Row actions.
    

Add filters for date range, cashier, payment method, and status.

Clicking a transaction should open a contextual detail drawer or panel showing:

- Transaction information.
    
- Customer information.
    
- Items purchased.
    
- Quantities and unit prices.
    
- Discounts.
    
- Payment breakdown.
    
- Grand total.
    
- Receipt preview.
    
- Print receipt.
    
- Refund or void actions where permitted.
    

Use status badges and compact, legible tables.

Create a clear distinction between completed sales, cancelled transactions, refunds, and pending payment records.

### H. Purchases and Stock Receiving

Create a purchase management module for inventory replenishment.

Include:

- Purchase records.
    
- Supplier selection.
    
- Purchase reference.
    
- Purchase date.
    
- Expected or received status.
    
- Purchased products.
    
- Quantities.
    
- Unit cost.
    
- Total cost.
    
- Payment status.
    
- Receiving workflow.
    

Allow a user to create a purchase order, review it, and mark items as received in the demo.

Receiving stock should update inventory and create appropriate stock movement records.

Do not update stock merely because a draft purchase order was created.

### I. Suppliers

Include:

- Supplier list.
    
- Search and filtering.
    
- Supplier details.
    
- Add and edit supplier forms.
    
- Contact person.
    
- Phone.
    
- Email.
    
- Address.
    
- Supplied products.
    
- Purchase history.
    
- Outstanding payable amount, if represented by the demo data.
    

### J. Customers

Include:

- Customer list.
    
- Walk-in customer support.
    
- Add and edit customer.
    
- Name.
    
- Phone.
    
- Email.
    
- Purchase history.
    
- Total amount spent.
    
- Last transaction.
    
- Optional customer notes.
    

Do not require customer registration for every ordinary retail transaction.

### K. Reports and Analytics

Create a reports section with clear, readable visualizations.

Include:

- Sales over time.
    
- Sales by product.
    
- Sales by category.
    
- Gross profit estimates.
    
- Payment method breakdown.
    
- Best-selling products.
    
- Slow-moving products.
    
- Stock valuation.
    
- Inventory movement.
    
- Low-stock report.
    
- Expiry report.
    

Provide date filters and export actions where reasonable.

Use consistent chart colors, meaningful legends, readable labels, and useful empty states.

Ensure every displayed metric is derived from the relevant demo data rather than being a random, unrelated number.

### L. Team and User Management

Create an administrative page for managing staff.

Include:

- User list.
    
- Name.
    
- Email.
    
- Role.
    
- Account status.
    
- Last active.
    
- Add user.
    
- Edit user.
    
- Activate/deactivate user.
    
- Role assignment.
    

Support these initial roles:

- Administrator.
    
- Manager.
    
- Cashier.
    

Implement basic frontend permission-aware UI behavior.

For example, a cashier should not see administrative user-management controls or cost-price information if those permissions are disabled.

Clearly understand that frontend permissions alone do not provide production-grade security; the backend must enforce permissions as well.

### M. Notifications

Create a notification center for:

- Low stock.
    
- Out-of-stock products.
    
- Expiring products.
    
- Successful sales.
    
- Failed simulated transactions.
    
- Stock adjustments.
    
- Important account events.
    

Include read/unread states, filters, and mark-as-read actions.

Use contextual severity indicators rather than making every notification visually prominent.

### N. Settings

Create a structured settings page with navigation between sections.

Include:

**Business profile**

- Business name.
    
- Contact information.
    
- Address.
    
- Logo.
    

**Branding and appearance**

- Brand accent color.
    
- Font family.
    
- Light and dark appearance preferences where supported.
    
- Sidebar configuration.
    
- Table density.
    
- Border-radius preference.
    
- Live preview of supported settings.
    

**Regional settings**

- Currency.
    
- Locale.
    
- Time zone.
    
- Date format.
    
- Number format.
    

**Sales and receipts**

- Receipt business name.
    
- Receipt footer.
    
- Default customer.
    
- Default payment method.
    
- Tax configuration.
    
- Discount configuration.
    
- Receipt paper width or layout option.
    

**Inventory**

- Default low-stock threshold.
    
- Stock tracking preferences.
    
- Expiry tracking defaults.
    

**Users and permissions**

- Role overview.
    
- Permission settings where appropriate.
    

**Account and security**

- Profile information.
    
- Password change interface.
    
- Session-related UI where applicable.
    

Changes to supported appearance settings must visibly update the application without requiring a page reload.

Persist appropriate demo preferences locally.

### O. Help and Support

Create a simple support page with:

- Searchable help topics.
    
- Common questions.
    
- Basic onboarding guidance.
    
- Contact support placeholder.
    
- Version information.
    

Do not invent a working external support service.

### P. Not Found and Error States

Include:

- A useful 404 page.
    
- An unauthorized or access-denied page.
    
- Loading states.
    
- Empty states.
    
- Form validation states.
    
- Recoverable error states.
    

Keep these screens consistent with the design system.

## 9. DOMAIN TYPES AND DATA MODEL

Create clear TypeScript types for the major business entities.

At minimum, consider:

- Business.
    
- User.
    
- Role.
    
- Product.
    
- ProductCategory.
    
- UnitOfMeasure.
    
- InventoryBalance.
    
- StockMovement.
    
- StockBatch.
    
- Supplier.
    
- Customer.
    
- Sale.
    
- SaleItem.
    
- Payment.
    
- PurchaseOrder.
    
- PurchaseOrderItem.
    
- Notification.
    
- Receipt.
    
- BusinessSettings.
    

Use relationships and identifiers consistently.

For example, a sale should contain line items referencing products, and each line item should have its own quantity, unit price, and subtotal.

Do not use one unstructured object for the entire application.

Keep inventory quantities, monetary values, and date fields clearly typed.

For production-oriented financial calculations, avoid relying on imprecise floating-point arithmetic without considering rounding. Use integer minor units or a suitable decimal strategy where appropriate, and format amounts for display through a centralized utility.

## 10. STATE MANAGEMENT AND MOCK DATA

If no backend is available, implement a clean mock data layer so the application remains usable.

Create service functions that simulate operations such as:

- Listing products.
    
- Creating and updating products.
    
- Recording a sale.
    
- Retrieving sales history.
    
- Adjusting stock.
    
- Creating purchase orders.
    
- Receiving stock.
    
- Updating settings.
    
- Managing customers and suppliers.
    

Keep these functions separate from UI components.

Use realistic, internally consistent sample data for a Nigerian grocery store.

Seed the demo with enough products, categories, transactions, customers, and suppliers to make the tables, charts, and dashboard believable.

Use plausible product examples, such as rice, beans, frozen fish, noodles, tin tomatoes, cooking oil, and seasonings.

Use NGN formatting and Nigerian phone-number examples where appropriate.

Do not fill every page with repeated copies of the same few rows.

### Persistence

Use a suitable local persistence mechanism for the demo when needed.

The POS cart, completed demo transactions, stock adjustments, and branding preferences should behave consistently within the limitations of the frontend.

Provide a clear demo reset mechanism if local state can become inconsistent.

Avoid storing passwords, authentication secrets, or sensitive payment information in local storage.

Keep persistence behind service or repository abstractions so a real backend can replace the mock implementation later.

Clearly document which behaviors are simulated.

## 11. UX AND INTERACTION REQUIREMENTS

The interface must be more than static.

Implement meaningful interactions for:

- Sidebar navigation.
    
- Search.
    
- Filters.
    
- Sorting.
    
- Pagination.
    
- Dialogs.
    
- Drawers.
    
- Dropdown menus.
    
- Forms.
    
- Validation.
    
- Toast notifications.
    
- Product selection.
    
- Cart updates.
    
- Checkout.
    
- Stock adjustments.
    
- Receiving purchases.
    
- Settings changes.
    
- Theme previews.
    
- Table selection and bulk actions.
    
- Receipt preview and print behavior.
    

Every visible button must either perform its intended action or be explicitly marked as unavailable.

Do not add buttons that do nothing.

Do not use `alert()` as the primary interaction pattern.

Use confirmation dialogs for destructive or consequential actions.

Provide feedback when an action succeeds or fails.

Preserve the user's context when opening and closing drawers and dialogs.

Use sensible keyboard focus behavior, accessible labels, sufficient contrast, and visible focus states.

## 12. RESPONSIVE DESIGN

Support the following general viewport ranges:

- Desktop: 1440px and above.
    
- Laptop: approximately 1024px–1439px.
    
- Tablet: approximately 768px–1023px.
    
- Mobile: below 768px.
    

Treat these as guidance, not rigid breakpoints.

On desktop, preserve the reference design's sidebar and structured workspace.

On smaller screens:

- Convert the sidebar into a drawer.
    
- Stack dashboard cards sensibly.
    
- Adapt or horizontally scroll dense tables where appropriate.
    
- Ensure the POS remains usable.
    
- Keep checkout actions accessible.
    
- Avoid clipping important dialogs.
    
- Use mobile-friendly input sizes.
    
- Prevent horizontal overflow across the overall application.
    

Do not simply scale down the desktop design. Adapt layouts to the available space.

## 13. CODE QUALITY AND COMMENTING

Write maintainable, readable TypeScript and React code.

Comment code where the explanation provides genuine value.

In particular, document:

- Non-obvious business rules.
    
- Important domain calculations.
    
- Mock service behavior.
    
- Routing and access-control decisions.
    
- Theme configuration.
    
- Inventory movement logic.
    
- Checkout calculations.
    
- Integration boundaries for future APIs.
    

Do not add meaningless comments that simply repeat the code.

Use descriptive function names and small functions with clear responsibilities.

Extract repeated calculations and formatting logic into utilities.

Avoid:

- Giant components.
    
- Giant single-file implementations.
    
- Unnecessary prop drilling.
    
- Uncontrolled use of global state.
    
- Duplicate business logic.
    
- Hardcoded branding throughout the application.
    
- Scattered hardcoded color values.
    
- Unnecessary `any` types.
    
- Fake API calls presented as real integrations.
    
- Unused dependencies.
    
- Dead code.
    
- Placeholder links that lead nowhere.
    
- Excessive abstractions that make the code harder to understand.
    

Use consistent formatting and linting conventions.

## 14. ACCESSIBILITY AND PROFESSIONAL POLISH

Include:

- Semantic HTML.
    
- Proper input labels.
    
- Accessible button names.
    
- Keyboard-accessible dialogs and menus.
    
- Visible focus states.
    
- Appropriate contrast.
    
- Helpful validation messages.
    
- Consistent status indicators.
    
- Tooltips for icon-only controls where needed.
    
- Sensible loading and empty states.
    

Use icons consistently and avoid mixing unrelated icon libraries.

Use product images only where they improve the interface. If real images are unavailable, use consistent local assets or attractive, restrained fallback icons rather than broken image URLs.

## 15. IMPLEMENTATION WORKFLOW

Follow this workflow.

### Phase 1: Inspect and plan

Inspect the repository and reference images.

Identify the current project structure, installed dependencies, existing components, and any relevant constraints.

Determine the implementation approach before making major changes.

If the project is empty, establish the required foundation.

Do not overwrite existing work without understanding it.

### Phase 2: Establish the foundation

Implement:

- Theme tokens.
    
- White-label branding configuration.
    
- Shared UI primitives.
    
- Authentication and application layouts.
    
- Sidebar and navigation configuration.
    
- Exported route configuration arrays.
    
- Typed domain models.
    
- Mock data and service abstractions.
    

Ensure the foundational architecture works before expanding the application.

### Phase 3: Implement the core workflows

Prioritize:

1. Login and onboarding.
    
2. Dashboard.
    
3. Product management.
    
4. Inventory management.
    
5. Point of Sale and checkout.
    
6. Sales history and receipt details.
    
7. Purchases and stock receiving.
    
8. Settings and branding customization.
    

Then implement the remaining pages.

The POS, inventory, products, and sales pages must receive particular attention because they are central to the product.

### Phase 4: Complete and polish the application

Add:

- Reports.
    
- Customers and suppliers.
    
- Staff management.
    
- Notifications.
    
- Help and support.
    
- Empty, loading, error, and confirmation states.
    
- Responsive layouts.
    
- Accessibility refinements.
    

### Phase 5: Verify the implementation

Run the available project checks.

At minimum:

- Run the TypeScript type checker.
    
- Run the production build.
    
- Run linting if configured.
    
- Fix errors introduced by your implementation.
    
- Check that every defined route renders.
    
- Check that internal navigation works.
    
- Check that forms validate correctly.
    
- Check that the POS calculations are correct.
    
- Check that completed demo sales update stock and sales history.
    
- Check that stock receiving updates inventory.
    
- Check that theme changes propagate correctly.
    
- Check that the application remains usable on smaller screens.
    

Do not claim checks passed unless you actually ran them and observed the result.

## 16. ACCEPTANCE CRITERIA

The implementation is not complete unless:

1. The application follows the uploaded design references.
    
2. The interface is tailored to a Nigerian foodstuff store.
    
3. The application has a consistent, professional visual identity.
    
4. The product name, logo, typography, and theme can be customized centrally.
    
5. The project is modular and does not place everything in one TSX file.
    
6. React Router is used with route configurations exported as arrays.
    
7. Authentication, onboarding, verification, and password-recovery screens exist.
    
8. The dashboard contains realistic business metrics.
    
9. Products can be searched, filtered, added, edited, and deactivated in the demo.
    
10. Inventory adjustments update stock and movement history.
    
11. The POS supports cart management, payment selection, checkout simulation, and receipt preview.
    
12. Completed demo sales update inventory and transaction history consistently.
    
13. Purchase receiving updates inventory correctly.
    
14. Settings visibly update supported application preferences.
    
15. Navigation, dialogs, filters, forms, and action buttons behave meaningfully.
    
16. The application has useful empty, loading, success, and error states.
    
17. The application is responsive and avoids major layout overflow.
    
18. TypeScript and the production build pass, or any remaining issues are explicitly documented.
    
19. Mock functionality is clearly distinguished from real backend or payment integrations.
    
20. The codebase is understandable, documented where necessary, and ready for future backend integration.
    

## 17. FINAL EXECUTION INSTRUCTIONS

**Build the actual application in the current project workspace. Do not respond with only a plan, tutorial, architecture document, or code snippets.**

Start by inspecting the repository, then implement the application in manageable stages.

Create and modify the actual source files. Do not put the entire project into one file or return a single enormous code block for me to copy manually.

Keep the implementation modular, use the shared design system, and ensure the pages form one coherent product.

If you have access to terminal tools, use them to install only necessary dependencies, run checks, and fix implementation errors.

If your environment supports browser previews, use them to inspect the finished interface and correct visible problems.

If you cannot complete everything in one pass, prioritize a fully functioning foundation and the core POS, inventory, products, dashboard, and sales workflows over creating many incomplete pages.

Do not silently omit features. Clearly identify anything not implemented and why.

At completion, provide a concise engineering handoff containing:

1. What was implemented.
    
2. The main architectural and folder-structure decisions.
    
3. The key routes and workflows.
    
4. How to run the application locally.
    
5. Which features are simulated and what backend integrations remain necessary.
    
6. Which validation, lint, and build commands were actually run and their results.
    
7. Any known limitations or unfinished work.
    

# 18. BACKEND INTEGRATION ARCHITECTURE — AXIOS + ZUSTAND

## Objective

Architect the frontend to integrate with a real REST API backend, which will be developed separately.

Use:

- Axios for all HTTP communication.
    
- Zustand for client-side state management.
    
- TypeScript for API contracts, store state, request payloads, and responses.
    
- React Router for navigation.
    
- Zod for client-side request and form validation where appropriate.
    

The frontend must be structured so that I can connect it to my future backend without rewriting the pages or components.

Do not place Axios requests directly inside React components.

Do not put all API operations in one global Zustand store.

Do not mix API transport logic, business calculations, UI state, and rendering in a single file.

Each feature must have a clear separation between API services, Zustand stores, types, hooks, and UI components.

## 18.1. Required folder structure

Extend the existing architecture with the following structure:

src/  
services/  
api/  
axiosInstance.ts  
apiConfig.ts  
apiErrors.ts  
interceptors.ts  
apiTypes.ts

store/  
index.ts  
authStore.ts  
dashboardStore.ts  
posStore.ts  
productStore.ts  
inventoryStore.ts  
salesStore.ts  
purchaseStore.ts  
supplierStore.ts  
customerStore.ts  
reportStore.ts  
userStore.ts  
notificationStore.ts  
settingsStore.ts  
uiStore.ts

features/  
auth/  
services/  
authApi.ts  
types.ts  
schemas/  
dashboard/  
services/  
dashboardApi.ts  
types.ts  
pos/  
services/  
posApi.ts  
types.ts  
products/  
services/  
productApi.ts  
types.ts  
inventory/  
services/  
inventoryApi.ts  
types.ts  
sales/  
services/  
salesApi.ts  
types.ts  
purchases/  
services/  
purchaseApi.ts  
types.ts  
suppliers/  
services/  
supplierApi.ts  
types.ts  
customers/  
services/  
customerApi.ts  
types.ts  
reports/  
services/  
reportApi.ts  
types.ts  
users/  
services/  
userApi.ts  
types.ts  
notifications/  
services/  
notificationApi.ts  
types.ts  
settings/  
services/  
settingsApi.ts  
types.ts

Adapt this structure to the actual project, but preserve the separation of concerns.

Each Zustand store must own a clearly defined area of application state and the operations relevant to that area.

Avoid empty placeholder files. Create files that are actually used.

## 18.2. Axios configuration

Create a centralized Axios instance in `src/services/api/axiosInstance.ts`.

Requirements:

- Read the API base URL from a Vite environment variable such as `VITE_API_BASE_URL`.
    
- Set a sensible default API prefix, such as `/api/v1`, only when it is compatible with the chosen URL convention.
    
- Configure JSON request and response headers appropriately.
    
- Set a reasonable request timeout.
    
- Support credentials when required by the chosen authentication strategy.
    
- Use typed request and response contracts.
    
- Centralize error normalization.
    
- Support request cancellation where useful.
    
- Prevent individual feature services from repeatedly creating Axios instances.
    

Create an `.env.example` file containing the public frontend configuration variables.

Example:

`VITE_API_BASE_URL=http://localhost:4000/api/v1`

This is an example, not a claim that the backend is already running on that address.

Never place database credentials, private API keys, JWT signing secrets, payment provider secret keys, or other server-side secrets in Vite environment variables. Anything prefixed with `VITE_` must be treated as publicly accessible in the frontend bundle.

Do not hardcode the production API URL into feature services.

## 18.3. Request and response conventions

Use a consistent API contract throughout the application.

A suggested successful response format is:

```
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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

Define these as proposed backend contracts and keep them consistent across the frontend.

Do not assume the future backend already follows this format.

Use query parameters for search, filtering, pagination, and sorting.

Use request payloads for create and update operations.

Use suitable HTTP status codes and standardized error responses in the proposed backend API contract.

For example, validation failures should be distinguishable from authentication failures, authorization failures, missing resources, conflicts, rate limits, and server errors.

Implement a shared error-normalization utility that can extract a backend error message and field-level validation errors from an Axios error.

Avoid exposing raw stack traces or sensitive server responses in user-facing error messages.

## 18.4. Authentication and session management

Design the authentication integration around a secure, backend-controlled session.

Prefer short-lived access tokens held in memory and a secure, HttpOnly, appropriately configured refresh/session cookie when supported by the backend.

If the eventual backend uses a cookie-based session exclusively, adapt the client accordingly instead of forcing bearer-token authentication.

Implement the following authentication API operations:

- Register an account.
    
- Log in.
    
- Log out.
    
- Retrieve the current authenticated user.
    
- Verify email.
    
- Resend verification email.
    
- Request a password reset.
    
- Reset a password.
    
- Refresh an access token, if token-based authentication is selected.
    
- Update profile information.
    
- Change password.
    

Create `authApi.ts` for HTTP operations and `authStore.ts` for authentication state and actions.

The authentication store should manage:

- Current user.
    
- Authentication status.
    
- Loading status.
    
- Initialization status.
    
- Authentication-related errors.
    
- Login action.
    
- Registration action.
    
- Logout action.
    
- Current-user initialization.
    
- Email verification actions.
    
- Password recovery actions.
    
- Session refresh, where applicable.
    

Use a clear authentication status model, such as `idle`, `loading`, `authenticated`, and `unauthenticated`, without creating conflicting boolean states.

Do not store passwords in Zustand persistence or local storage.

Do not persist refresh tokens or session secrets in local storage.

Do not implement fake JWT decoding as proof of authentication.

Use a centralized Axios response interceptor for handling authentication failures where appropriate.

Avoid infinite refresh loops and duplicate concurrent refresh requests. Ensure requests are retried only when safe and according to the selected authentication strategy.

Do not automatically log the user out for every server error.

Account for expired sessions, failed refresh attempts, and intentional logout.

If the backend is not available, provide an explicitly labeled mock authentication adapter for development. Keep it separate from the real API service.

## 18.5. Generated REST API endpoint specification

Design the following REST API contract for the future backend.

Use `/api/v1` as the proposed versioned prefix.

Use consistent resource naming, HTTP methods, request payloads, response types, query parameters, and error handling.

Generate corresponding frontend API service functions and TypeScript types for these endpoints.

Do not make up a claim that these routes already exist on a running backend.

### A. Authentication

|Method|Endpoint|Purpose|
|---|---|---|
|POST|`/auth/register`|Register an account and initiate onboarding|
|POST|`/auth/login`|Authenticate a user|
|POST|`/auth/logout`|End the current session|
|GET|`/auth/me`|Retrieve the authenticated user and active business context|
|POST|`/auth/verify-email`|Verify an email using a code|
|POST|`/auth/resend-verification`|Request a new verification code|
|POST|`/auth/forgot-password`|Request a password-reset email|
|POST|`/auth/reset-password`|Reset a password using a valid reset token|
|POST|`/auth/refresh`|Refresh a session if the selected auth strategy requires it|
|PATCH|`/auth/profile`|Update the authenticated user's profile|
|PATCH|`/auth/change-password`|Change the authenticated user's password|

Define request and response types for each operation.

### B. Business and onboarding

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/businesses/current`|Retrieve the active business|
|PATCH|`/businesses/current`|Update business profile information|
|POST|`/businesses`|Create a business during onboarding|
|GET|`/businesses/current/settings`|Retrieve business settings|
|PATCH|`/businesses/current/settings`|Update business settings|
|PATCH|`/businesses/current/branding`|Update branding configuration|
|POST|`/businesses/current/logo`|Upload a business logo using multipart form data|

A user may eventually belong to more than one business. Design the contracts so that business context can be selected safely if multi-business accounts are supported.

Never rely on a client-supplied business ID alone to authorize access to another business's records.

### C. Dashboard

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/dashboard/overview`|Retrieve summary metrics|
|GET|`/dashboard/sales-trend`|Retrieve sales chart data|
|GET|`/dashboard/top-products`|Retrieve best-selling products|
|GET|`/dashboard/recent-sales`|Retrieve recent transactions|
|GET|`/dashboard/low-stock`|Retrieve low-stock alerts|
|GET|`/dashboard/expiring-stock`|Retrieve upcoming expiry alerts|

Support date filters and the appropriate pagination or result limits.

Ensure dashboard values are derived from consistent backend business rules.

### D. Products and categories

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/products`|List products with pagination and filters|
|POST|`/products`|Create a product|
|GET|`/products/:productId`|Retrieve product details|
|PATCH|`/products/:productId`|Update a product|
|DELETE|`/products/:productId`|Archive or deactivate a product according to the agreed contract|
|GET|`/products/search`|Search products by name, SKU, or barcode|
|GET|`/products/barcode/:barcode`|Find a product by barcode|
|GET|`/categories`|List product categories|
|POST|`/categories`|Create a category|
|PATCH|`/categories/:categoryId`|Update a category|
|DELETE|`/categories/:categoryId`|Archive or delete a category where permitted|

Product list queries should support parameters such as:

- `page`
    
- `limit`
    
- `search`
    
- `categoryId`
    
- `stockStatus`
    
- `sortBy`
    
- `sortOrder`
    
- `isActive`
    

Support product units, SKU/barcode identifiers, selling price, cost price, minimum stock thresholds, and optional expiry tracking.

Use archive semantics for products with historical transactions rather than destroying referenced product records.

### E. Point of Sale and checkout

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/pos/products`|Search available products for POS|
|GET|`/pos/customers`|Search customers during checkout|
|POST|`/pos/checkout`|Submit and finalize a sale|
|POST|`/pos/quotes`|Create a draft quote or sale preview where supported|
|GET|`/pos/transactions/:transactionId`|Retrieve transaction details|
|POST|`/pos/transactions/:transactionId/void`|Void a transaction when authorized|
|POST|`/pos/transactions/:transactionId/refunds`|Initiate a refund according to backend policy|
|GET|`/pos/transactions/:transactionId/receipt`|Retrieve receipt data|

The checkout request should include the selected items, quantities, optional customer ID, discounts where permitted, payment information, and an idempotency key.

A conceptual request type:

```
interface CheckoutRequest {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitOfMeasureId?: string;
  }>;
  discount?: {
    type: "fixed" | "percentage";
    value: number;
  };
  payments: Array<{
    method: "cash" | "bank_transfer" | "card";
    amount: number;
    reference?: string;
  }>;
  idempotencyKey: string;
}
```

Adapt this contract to the final backend design.

The server must recalculate prices, discounts, taxes, totals, payment balances, and stock availability. Never trust client-calculated totals as authoritative.

Checkout must be atomic: either the sale, payment records, and stock movements succeed together, or the transaction fails without leaving partially committed business records.

The backend must also handle concurrent sales that compete for the same stock.

A payment method selection in the frontend does not mean a real payment has been processed. Integrate payment providers separately when required.

### F. Sales and transactions

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/sales`|List sales with filters and pagination|
|GET|`/sales/:saleId`|Retrieve sale details|
|POST|`/sales/:saleId/void`|Void a sale according to permissions|
|POST|`/sales/:saleId/refunds`|Process a refund workflow|
|GET|`/sales/:saleId/receipt`|Retrieve receipt data|
|GET|`/sales/:saleId/payments`|Retrieve payment breakdown|

Support date range, cashier, customer, payment method, transaction status, and search filters.

Keep sales history immutable where appropriate. Use auditable voids and refunds rather than silently editing historical totals.

### G. Inventory and stock movements

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/inventory`|Retrieve inventory balances|
|GET|`/inventory/summary`|Retrieve inventory metrics|
|GET|`/inventory/movements`|Retrieve stock movement history|
|POST|`/inventory/adjustments`|Record a stock adjustment|
|GET|`/inventory/adjustments/:adjustmentId`|Retrieve an adjustment|
|GET|`/inventory/stocktakes`|List stocktakes|
|POST|`/inventory/stocktakes`|Create a stocktake|
|GET|`/inventory/stocktakes/:stocktakeId`|Retrieve a stocktake|
|PATCH|`/inventory/stocktakes/:stocktakeId`|Update a draft stocktake|
|POST|`/inventory/stocktakes/:stocktakeId/complete`|Finalize a stocktake|

Support search, category filters, stock status, date ranges, and pagination.

An adjustment request should include:

- Product ID.
    
- Quantity change.
    
- Reason.
    
- Optional note.
    
- Optional batch or lot identifier.
    

The backend must validate quantities, permissions, and inventory constraints.

Record every stock movement with an appropriate source, timestamp, and responsible user.

Do not permit arbitrary changes to stock balances without an auditable movement record.

### H. Expiry and batches

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/inventory/batches`|List tracked inventory batches|
|POST|`/inventory/batches`|Register a batch|
|GET|`/inventory/batches/:batchId`|Retrieve batch details|
|PATCH|`/inventory/batches/:batchId`|Update permitted batch information|
|GET|`/inventory/expiry-alerts`|Retrieve expiry-related alerts|

Support batch or lot identifiers, expiry dates, received quantities, and remaining quantities when applicable.

Do not require batch-level tracking for every product if the business configuration does not need it.

### I. Purchases and receiving

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/purchases`|List purchase orders|
|POST|`/purchases`|Create a purchase order|
|GET|`/purchases/:purchaseId`|Retrieve purchase details|
|PATCH|`/purchases/:purchaseId`|Update a permitted draft purchase|
|POST|`/purchases/:purchaseId/submit`|Submit a purchase order|
|POST|`/purchases/:purchaseId/receive`|Receive all or part of a purchase|
|POST|`/purchases/:purchaseId/cancel`|Cancel an eligible purchase|

Support partial receiving, received quantities, unit costs, optional batches, and supplier references.

Creating a purchase order must not automatically increase stock.

Inventory should increase only when the backend confirms a valid receiving operation.

### J. Suppliers

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/suppliers`|List suppliers|
|POST|`/suppliers`|Create a supplier|
|GET|`/suppliers/:supplierId`|Retrieve supplier details|
|PATCH|`/suppliers/:supplierId`|Update a supplier|
|DELETE|`/suppliers/:supplierId`|Deactivate a supplier where permitted|
|GET|`/suppliers/:supplierId/purchases`|Retrieve supplier purchase history|

Support search, pagination, contact details, active status, and purchase history.

### K. Customers

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/customers`|List customers|
|POST|`/customers`|Create a customer|
|GET|`/customers/:customerId`|Retrieve customer details|
|PATCH|`/customers/:customerId`|Update a customer|
|DELETE|`/customers/:customerId`|Deactivate a customer where permitted|
|GET|`/customers/:customerId/purchases`|Retrieve purchase history|

Support walk-in customers without requiring a persisted customer record for every sale.

### L. Reports and analytics

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/reports/sales`|Retrieve sales reports|
|GET|`/reports/products`|Retrieve product performance|
|GET|`/reports/profit`|Retrieve profit estimates and related breakdowns|
|GET|`/reports/inventory`|Retrieve stock valuation and inventory reports|
|GET|`/reports/payments`|Retrieve payment summaries|
|GET|`/reports/stock-movements`|Retrieve movement reports|
|GET|`/reports/expiry`|Retrieve expiry reports|
|GET|`/reports/export`|Export an authorized report where supported|

Support date ranges, product/category filters, and appropriate pagination.

Use server-calculated values for reports that depend on authoritative financial or inventory records.

### M. Users, roles, and permissions

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/users`|List business users|
|POST|`/users`|Invite or create a user|
|GET|`/users/:userId`|Retrieve a user|
|PATCH|`/users/:userId`|Update user information|
|POST|`/users/:userId/activate`|Activate an eligible user|
|POST|`/users/:userId/deactivate`|Deactivate an eligible user|
|GET|`/roles`|Retrieve supported roles|
|GET|`/permissions`|Retrieve available permissions|

Implement the initial roles:

- Administrator.
    
- Manager.
    
- Cashier.
    

Treat these as business-scoped roles. The backend must enforce permissions for every protected operation.

Do not rely on hidden frontend buttons or route guards for authorization.

### N. Notifications

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/notifications`|List notifications|
|GET|`/notifications/unread-count`|Retrieve unread notification count|
|PATCH|`/notifications/:notificationId/read`|Mark a notification as read|
|POST|`/notifications/read-all`|Mark all eligible notifications as read|

Support pagination, notification type, and read status.

### O. Settings

|Method|Endpoint|Purpose|
|---|---|---|
|GET|`/settings`|Retrieve current business settings|
|PATCH|`/settings`|Update business settings|
|PATCH|`/settings/branding`|Update supported appearance preferences|
|PATCH|`/settings/receipt`|Update receipt settings|
|PATCH|`/settings/inventory`|Update inventory defaults|
|PATCH|`/settings/sales`|Update sales and checkout defaults|

Keep business preferences separate from temporary UI preferences.

Temporary preferences such as collapsed sidebar state may remain client-side. Business settings that must be shared across authorized users should be saved through the backend.

## 18.6. API services

Create a dedicated service module for each feature.

Examples:

- `authApi.ts`
    
- `productApi.ts`
    
- `inventoryApi.ts`
    
- `posApi.ts`
    
- `salesApi.ts`
    
- `purchaseApi.ts`
    
- `customerApi.ts`
    
- `supplierApi.ts`
    
- `reportApi.ts`
    
- `userApi.ts`
    
- `notificationApi.ts`
    
- `settingsApi.ts`
    

Each service should contain typed HTTP operations for its feature.

For example, the product service should expose operations conceptually equivalent to:

- `getProducts(params)`
    
- `getProductById(productId)`
    
- `searchProducts(params)`
    
- `createProduct(payload)`
    
- `updateProduct(productId, payload)`
    
- `archiveProduct(productId)`
    

Keep URL construction and HTTP request details inside these services.

Do not put React components, JSX, or Zustand hooks inside API service files.

Do not duplicate endpoint strings across pages and stores.

Use a centralized endpoint definition or feature-specific endpoint constants where it improves maintainability.

## 18.7. Zustand store design

Create separate, task-specific Zustand stores.

Each store must have a clear purpose and expose typed state and actions.

### `authStore.ts`

Owns:

- Current authenticated user.
    
- Authentication status.
    
- Initialization status.
    
- Login.
    
- Registration.
    
- Logout.
    
- Current-user initialization.
    
- Email verification.
    
- Password recovery.
    
- Session refresh, if applicable.
    

### `dashboardStore.ts`

Owns:

- Dashboard overview metrics.
    
- Sales chart data.
    
- Top products.
    
- Recent sales.
    
- Low-stock alerts.
    
- Expiry alerts.
    
- Dashboard loading and error states.
    
- Dashboard refresh actions.
    

### `productStore.ts`

Owns:

- Product list.
    
- Product detail retrieval.
    
- Search and filter state where appropriate.
    
- Pagination.
    
- Product creation.
    
- Product updates.
    
- Product archiving.
    
- Product loading and error states.
    

### `inventoryStore.ts`

Owns:

- Inventory balances.
    
- Inventory summary.
    
- Stock movement history.
    
- Stock adjustments.
    
- Stocktake operations.
    
- Expiry and batch data.
    
- Relevant loading and error states.
    

### `posStore.ts`

Owns the active point-of-sale workflow:

- Cart items.
    
- Product search for POS.
    
- Selected customer.
    
- Quantity changes.
    
- Item removal.
    
- Cart clearing.
    
- Discount inputs.
    
- Payment selections.
    
- Amount received.
    
- Change calculation for cash payments.
    
- Checkout request lifecycle.
    
- Checkout result.
    
- Receipt preview data.
    

Use selectors and derived calculations where appropriate.

Do not duplicate authoritative server-calculated totals as trusted values. The UI may calculate estimates for immediate feedback, but the checkout response from the server is authoritative.

Ensure cart operations are predictable and do not permit invalid quantities.

### `salesStore.ts`

Owns:

- Sales history.
    
- Sales filters.
    
- Pagination.
    
- Sale details.
    
- Payment details.
    
- Receipt data.
    
- Void and refund workflows.
    

### `purchaseStore.ts`

Owns:

- Purchase list.
    
- Purchase details.
    
- Draft purchase creation.
    
- Purchase updates.
    
- Submission.
    
- Receiving operations.
    
- Purchase loading and error states.
    

### `supplierStore.ts`

Owns:

- Supplier list.
    
- Supplier details.
    
- Supplier creation and updates.
    
- Supplier deactivation.
    
- Supplier purchase history.
    

### `customerStore.ts`

Owns:

- Customer list.
    
- Customer search.
    
- Customer details.
    
- Customer creation and updates.
    
- Customer purchase history.
    

### `reportStore.ts`

Owns:

- Report filters.
    
- Sales report data.
    
- Product performance data.
    
- Profit report data.
    
- Inventory report data.
    
- Payment breakdowns.
    
- Export request lifecycle.
    

### `userStore.ts`

Owns:

- Business users.
    
- User invitations.
    
- User updates.
    
- Activation and deactivation.
    
- Role and permission information.
    

### `notificationStore.ts`

Owns:

- Notifications.
    
- Unread count.
    
- Read and unread updates.
    
- Mark-all-as-read action.
    
- Notification loading and error states.
    

### `settingsStore.ts`

Owns:

- Business settings retrieved from the API.
    
- Branding preferences synchronized with the backend.
    
- Receipt settings.
    
- Sales settings.
    
- Inventory settings.
    
- Settings update actions.
    

### `uiStore.ts`

Owns only genuinely global, transient UI state, such as:

- Sidebar collapsed state.
    
- Global modal state, if needed.
    
- Command palette visibility.
    
- Other shared interface preferences.
    

Do not put server resources, the entire application dataset, or authentication secrets in `uiStore`.

Do not use one enormous Zustand store for every feature.

## 18.8. Zustand implementation standards

Use `create` from Zustand and TypeScript generics or inferred types to ensure store actions are correctly typed.

Each store should expose relevant actions, loading states, and error states.

Keep the implementation easy to understand.

Use selectors to avoid unnecessary component re-renders.

Do not make every component subscribe to the entire store.

Use `persist` selectively.

Suitable persistence candidates may include:

- Non-sensitive UI preferences.
    
- Supported branding preview preferences.
    
- A POS draft cart, if the product requirements justify it.
    

Do not persist passwords, access tokens, refresh tokens, or session secrets in local storage.

Do not persist entire API datasets without a specific reason.

If the backend is unavailable during initial development, implement mock API adapters that satisfy the same interfaces as the real services.

The store should not need to be rewritten when switching from mock services to Axios-backed services.

Use explicit dependency boundaries or a small service abstraction to support this transition.

Do not silently swallow errors. Store a normalized error message or error structure, and let the UI display appropriate feedback.

Prevent stale responses from overwriting newer search results where practical. Use cancellation or request tracking for rapidly changing searches.

Avoid race conditions when updating shared data after a sale, stock adjustment, or purchase receipt.

After a successful operation, update affected local state where reliable, and invalidate or refetch server-derived data when necessary.

Do not pretend that updating a Zustand store is equivalent to persisting data on the server.

## 18.9. API and store integration rules

Follow this architecture:

React page/component  
↓  
Zustand store action  
↓  
Feature API service  
↓  
Centralized Axios instance  
↓  
REST API backend

Responses travel back through the same layers, with the store updating application state and the UI reacting to state changes.

Use this architecture consistently across features.

Components should call store actions rather than directly invoking Axios.

Feature services should not import React components or call Zustand hooks.

Stores should not contain raw endpoint strings scattered throughout their actions.

Keep validation and business rules in the appropriate layer.

Do not add redundant API requests when a relevant, fresh result is already available unless revalidation is required.

Use request states to prevent accidental repeated submissions.

## 18.10. Authentication-aware routing

Integrate the authentication store with the exported React Router route configuration.

Support:

- Public-only routes.
    
- Protected routes.
    
- Authenticated user initialization.
    
- Verification-required routes where appropriate.
    
- Role-aware UI access.
    
- Loading states while checking the session.
    
- Redirecting unauthenticated users to login.
    
- Redirecting authenticated users away from login where appropriate.
    

Preserve the intended destination when redirecting to login, where practical.

Do not assume that frontend route protection is sufficient security.

The backend must validate the authenticated user, business membership, and permissions for every protected API request.

## 18.11. Mock and production environments

Provide an explicit environment/configuration strategy.

For example:

- Mock mode for UI development without a running backend.
    
- API mode for connecting to the actual backend.
    

Use a typed configuration flag such as `VITE_USE_MOCK_API`.

Make the active mode clear during development.

Do not silently fall back to mock data when a production API request fails. That would hide real integration errors.

In mock mode, provide deterministic sample data and realistic simulated loading/error behavior.

In API mode, use Axios-backed services and display genuine request failures.

Keep the mock and real service interfaces compatible so the application can switch modes with minimal changes.

## 18.12. API documentation and backend handoff

Create a dedicated file such as:

`docs/api-contract.md`

Document the proposed endpoints, HTTP methods, request payloads, response formats, authentication assumptions, pagination, error handling, and business rules.

Clearly label the API contract as proposed and subject to agreement with the backend implementation.

Where practical, provide an OpenAPI-compatible specification that can later be used to generate backend documentation and typed clients.

Do not invent a running backend, successful API responses, or completed integrations.

At completion, explain which frontend operations are wired to the Axios service layer, which use mock adapters, and which require a real backend.

## 18.13. Final acceptance criteria for backend integration

The implementation must satisfy the following:

1. One centralized Axios instance is used for HTTP communication.
    
2. The API base URL is environment-configurable.
    
3. Feature API services are separated by domain.
    
4. Zustand stores are separated by responsibility.
    
5. Stores expose typed actions and appropriate loading/error states.
    
6. React components do not make direct Axios requests.
    
7. The POS uses a dedicated store.
    
8. Products and inventory have separate stores.
    
9. Sales and purchases have separate stores.
    
10. Authentication and settings have dedicated stores.
    
11. Route configuration remains exported as arrays.
    
12. Authentication-aware routing is implemented.
    
13. Mock and API modes have explicit boundaries.
    
14. No sensitive authentication secrets are persisted in local storage.
    
15. Checkout uses a server-authoritative contract and idempotency strategy.
    
16. Inventory updates and purchase receiving have clear consistency rules.
    
17. The proposed endpoints are documented.
    
18. TypeScript types are shared appropriately between services and stores.
    
19. Errors are normalized and surfaced to the UI.
    
20. The application can switch to a real backend without rewriting its pages.
    

The final result should look and feel like a professional, reusable retail SaaS product inspired by the uploaded references, not a generic dashboard assembled from unrelated templates.

Since I am building this as a product that I will sell to multiple shops, the most important thing is to separate the reusable product from each customer's configuration.
1. The design system: Keep the typography, colors, logo, spacing, and sidebar configuration centralized. This lets you adapt the product for different customers without redesigning every page.
2. The POS and inventory workflows: Make these the priority. A beautiful dashboard is not enough: adding products to a cart, completing a sale, calculating change, and updating stock must work together.
3. The modular architecture: Separate pages, components, routes, types, services, utilities, and mock data. That gives my a codebase you can understand, maintain, and later connect to your Node.js/TypeScript backend.

# 19. REPOSITORY ENGINEERING STANDARDS — TURBOREPO, HUSKY, COMMITLINT & SEMANTIC-RELEASE

## 19.1. Objective

Before implementing the main application, establish a clean, maintainable, and automated repository workflow for development, testing, commit validation, and version releases.

I value organized code, predictable conventions, maintainable configuration, meaningful comments, and professional engineering practices.

Use the configuration examples I provided as architectural guidance, not as files to copy blindly.

Use your initiative to inspect the repository, choose the appropriate configuration for the actual project structure, and implement the workflow properly.

The objective is to establish a reliable development environment in which:

- The repository has a clear and scalable structure.
    
- Commits follow a consistent, enforceable convention.
    
- Git hooks validate commits automatically.
    
- Build, test, and lint commands can be executed consistently.
    
- Turborepo orchestrates tasks across workspaces where appropriate.
    
- Semantic Release determines version increments from commit history.
    
- Release notes and changelogs are generated automatically.
    
- Releases follow a deliberate branch strategy.
    
- CI validates changes before they are merged or released.
    
- Configuration is modular, documented where necessary, and easy to maintain.
    

Do not implement these tools merely to make the repository look sophisticated. Every tool must serve a clear purpose.

## 19.2. Inspect before configuring

First inspect the existing repository and determine:

- Whether it is a single-package application or a monorepo.
    
- Whether the frontend and backend already exist.
    
- Whether npm workspaces, pnpm, or Yarn is already configured.
    
- The current Node.js and package-manager versions.
    
- The existing package scripts.
    
- The installed dependencies and their compatibility.
    
- The current Git branch strategy.
    
- Whether GitHub Actions or another CI system is already configured.
    
- Whether existing release automation is present.
    
- Whether there are existing configuration files that should be preserved or improved.
    

Do not overwrite working configurations without understanding them.

Do not install duplicate tooling or incompatible dependency versions.

Use the existing package manager unless there is a compelling reason to change it.

Verify that the selected package-manager version and Node.js engine requirements are compatible with the installed tooling.

If the repository is empty, establish the appropriate foundation before creating the application features.

## 19.3. Repository architecture and Turborepo

Use Turborepo when the project structure benefits from monorepo task orchestration.

For this POS and inventory product, prefer a workspace architecture if both frontend and backend are maintained in the same repository.

A possible structure is:

```
/
├── apps/
│   ├── web/                  # React frontend
│   └── api/                  # Backend API, when added
├── packages/
│   ├── shared/               # Shared domain types and contracts
│   ├── config/               # Shared linting/TypeScript configuration
│   └── ui/                   # Reusable UI package, if justified
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   └── development.md
├── .github/
│   └── workflows/
├── .husky/
├── commitlint.config.js
├── release.config.js
├── turbo.json
├── package.json
├── package-lock.json
└── README.md
```

This is a proposed structure, not a requirement to create empty packages.

If the backend is not yet being implemented, do not create an empty backend application just to fill the directory. Establish only the packages that provide immediate value and make the structure ready for later expansion.

Do not extract shared code into packages prematurely. Introduce shared packages when multiple workspaces genuinely need them.

### Turborepo configuration

Configure Turborepo to orchestrate the scripts actually provided by the workspace packages.

At minimum, support the following tasks where applicable:

- `build`
    
- `test`
    
- `lint`
    
- `typecheck`
    
- `dev`
    

Configure task dependencies and caching correctly.

Requirements:

- Build tasks must respect dependency ordering.
    
- Declare build outputs accurately.
    
- Do not cache tasks that require fresh external side effects.
    
- Do not cache tests that depend on uncontrolled external state.
    
- Ensure development tasks are persistent and are not treated as ordinary cacheable build tasks.
    
- Avoid referencing framework-specific output directories unless the corresponding workspace uses that framework.
    
- Make root-level commands behave predictably.
    
- Ensure a task defined at the root can be executed in the relevant workspace.
    

Use the Turborepo configuration schema appropriate to the installed version. Do not blindly copy legacy task configuration from an incompatible version.

Example root scripts may include:

```
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "release": "semantic-release"
  }
}
```

Adapt the scripts to the actual workspace structure and available commands. Do not add scripts that reference nonexistent tasks.

If the repository is a single-package application, determine whether Turborepo provides enough value to justify its introduction. Do not add monorepo complexity without a reason.

## 19.4. Conventional commit standard

Use Conventional Commits with a required scope.

My preferred commit structure is:

`type(scope): description`

Examples:

- `feat(frontend): add inventory dashboard`
    
- `feat(api): implement product search endpoint`
    
- `feat(backend): add stock adjustment service`
    
- `fix(frontend): correct checkout total calculation`
    
- `fix(api): handle expired sessions`
    
- `refactor(shared): extract currency utilities`
    
- `test(frontend): cover POS cart calculations`
    
- `docs(shared): document API response contracts`
    
- `chore(root): configure release automation`
    
- `perf(backend): optimize inventory queries`
    
- `ci(root): validate builds on pull requests`
    
- `build(frontend): update production dependencies`
    
- `revert(frontend): remove broken checkout change`
    

The scope must be lowercase and should identify the affected application, package, or concern.

Use a practical, documented scope allowlist that matches the actual repository.

Start with appropriate scopes such as:

- `frontend`
    
- `backend`
    
- `api`
    
- `web`
    
- `shared`
    
- `root`
    
- `docs`
    
- `ci`
    

If the repository later introduces additional packages, update the allowlist intentionally.

Do not accept arbitrary scope values by default.

The commit description should be concise, meaningful, and written in the imperative where practical.

Use the Conventional Commits standard rather than inventing a completely separate commit syntax.

### Commit message validation

Configure Commitlint with `@commitlint/config-conventional` and project-specific rules.

Require a scope for ordinary commits, enforce lowercase scopes, and validate the scope against the configured allowlist.

Validate the commit type using Conventional Commits rules.

Allow valid breaking-change declarations using `!` and/or a `BREAKING CHANGE:` footer, according to the selected Commitlint configuration.

Document how to write breaking-change commits.

Use a configuration format compatible with the installed Commitlint version and Node.js environment.

Prefer a configuration that can be maintained easily rather than an unnecessarily complicated custom parser.

### Example configuration intent

The configuration should express rules equivalent to:

- Conventional commit format is required.
    
- Scope is required for normal commits.
    
- Scope must be lowercase.
    
- Scope must belong to the allowed list.
    
- Subject must not be empty.
    
- Commit types follow the selected conventional configuration.
    

Use the project's actual package scopes rather than preserving an outdated list simply because it appeared in the example.

## 19.5. Husky Git hooks

Configure Husky using the workflow appropriate to the installed Husky version.

Use Git hooks to prevent invalid commits from entering the repository.

At minimum, implement:

### Commit message hook

A `commit-msg` hook must run Commitlint against the proposed commit message.

A commit such as:

`feat(frontend): add inventory page`

should pass when its scope is valid.

A malformed commit or a commit with an invalid scope should fail with a clear error message.

### Pre-commit hook

Add a pre-commit hook only where it provides useful validation.

For example, use lint-staged to run linting or formatting against staged files if the repository benefits from it.

Avoid running the entire production build or a lengthy test suite on every commit when that would significantly slow down development.

Do not add lint-staged unless its configuration and commands are properly implemented.

### Hook reliability

- Ensure the hooks are executable and committed.
    
- Ensure a fresh clone can install and use the hooks.
    
- Use the supported Husky setup for the installed major version.
    
- Avoid obsolete Husky initialization patterns.
    
- Do not make normal development depend on a developer manually invoking Commitlint.
    
- Document how to initialize and troubleshoot the hooks.
    

Do not create hooks that silently bypass validation or always exit successfully.

CI must independently validate the repository because local hooks can be bypassed.

## 19.6. Semantic Release configuration

Configure Semantic Release to derive release versions from validated commit history.

The objective is to automate:

- Release analysis.
    
- Semantic version calculation.
    
- Release notes.
    
- Changelog updates.
    
- Package version updates where appropriate.
    
- GitHub releases.
    
- Release-related Git commits where appropriate.
    

Use semantic versioning:

- `MAJOR`: breaking changes incompatible with the existing public contract.
    
- `MINOR`: backward-compatible features.
    
- `PATCH`: backward-compatible fixes.
    

### Release rules

Use `@semantic-release/commit-analyzer` with the Conventional Commits preset or an equivalent supported configuration.

Define explicit release rules for the project's scopes where useful.

For example:

- `feat(frontend)` → minor release.
    
- `feat(backend)` → minor release.
    
- `feat(api)` → minor release.
    
- `fix(frontend)` → patch release.
    
- `fix(backend)` → patch release.
    
- `fix(api)` → patch release.
    
- `perf(...)` → patch release unless project policy dictates otherwise.
    
- `refactor(...)` → no release by default unless the change intentionally affects the public product contract and the team explicitly chooses a different policy.
    
- `docs(...)`, `style(...)`, and ordinary `chore(...)` → no release by default.
    
- Valid breaking changes → major release according to Semantic Release rules.
    

Treat these as initial policy recommendations. Adjust them to fit the product and document the result.

Do not configure every refactor or chore to trigger a feature release without a clear reason.

Do not accidentally suppress major releases because a custom rule overrides the default breaking-change analysis.

Test the release rules against representative commit messages before finalizing the configuration.

### Branch strategy

Use a deliberate release branch strategy that matches the repository's actual Git workflow.

A reasonable starting point is:

- `master` or `main`: stable releases.
    
- `development`: prereleases, such as beta versions, when the team actively uses this branch.
    

Do not assume both branches exist. Inspect the repository and document the intended strategy.

If a development branch is used, configure a valid prerelease channel so beta releases do not replace stable releases.

If a development branch is not needed, do not create unnecessary branch complexity.

Ensure branch configuration is compatible with Semantic Release's requirements and the CI environment.

### Release plugins

Select only plugins that serve the actual project.

Potential plugins include:

- `@semantic-release/commit-analyzer`
    
- `@semantic-release/release-notes-generator`
    
- `@semantic-release/changelog`
    
- `@semantic-release/npm`, when package version management is required
    
- `@semantic-release/git`, when generated files must be committed
    
- `@semantic-release/github`, for GitHub releases
    

Configure the plugins in a sensible order.

Do not publish the frontend or backend to npm unless explicitly required.

For a private SaaS application, automatic versioning and GitHub releases may be sufficient.

If the repository uses workspace packages, decide whether versioning should apply to the entire repository or individual packages. Do not mix independent package versioning with a single repository release policy accidentally.

### Release notes

Generate a useful changelog that groups changes into meaningful categories, such as:

- Frontend features.
    
- Backend/API features.
    
- Bug fixes.
    
- Performance improvements.
    
- Breaking changes.
    

Use the actual commit scope to classify changes.

Keep documentation-only and routine maintenance commits out of the user-facing changelog unless they contain release-relevant changes.

If a custom release-notes transformation is used, make sure it does not mutate shared commit objects, unintentionally suppress breaking changes, or return invalid results.

Preserve the standard breaking-change notes.

Use a safe, maintainable implementation rather than copying complicated transformation code unnecessarily.

### Generated files and release commits

If Semantic Release updates `CHANGELOG.md` or package versions, determine whether those generated files should be committed back to Git.

If using `@semantic-release/git`, configure its assets and release commit message deliberately.

Use an appropriate release commit convention and prevent recursive release loops in CI.

Ensure that release commits do not trigger another unintended release cycle.

Do not include unrelated working-tree files in release commits.

## 19.7. GitHub Actions and continuous integration

Create or improve GitHub Actions workflows to validate changes automatically.

At minimum, establish a CI workflow that:

1. Checks out the repository.
    
2. Sets up a compatible Node.js version.
    
3. Installs the correct package-manager version.
    
4. Installs dependencies using the appropriate lockfile-aware command.
    
5. Runs linting.
    
6. Runs type checking.
    
7. Runs automated tests.
    
8. Builds the affected applications or packages.
    

Run the tasks that actually exist in the repository.

Use dependency caching where appropriate.

Do not expose secrets in logs.

### Pull requests

Validate pull requests before allowing them to be merged.

Include relevant build, test, lint, and type-check checks.

Where practical, validate commit messages against the project's convention.

Do not automatically publish production releases from pull requests.

### Release workflow

Configure Semantic Release to run on the intended release branches after the required validation passes.

Use the official GitHub Actions token or a suitably scoped dedicated token according to the chosen release permissions.

Grant only the permissions required for release operations, such as writing release metadata and committing generated files when configured.

Do not hardcode credentials or commit secrets.

Ensure CI has sufficient permissions to create releases and update changelog/version files when those operations are enabled.

Document the required repository settings and secrets.

Do not claim automated releases work until the configuration has been tested in a compatible GitHub environment.

## 19.8. Package scripts and developer experience

Create a clean, predictable set of root scripts.

Where applicable, include:

- `dev`
    
- `build`
    
- `test`
    
- `lint`
    
- `typecheck`
    
- `format`
    
- `format:check`
    
- `prepare`
    
- `release`
    

Use names consistently across packages.

Ensure the root scripts delegate correctly to workspace scripts.

Avoid redundant scripts that run the same operation multiple times.

If formatting is handled by Prettier, integrate it consistently with linting.

Do not add multiple formatters or overlapping lint tools without a clear justification.

Use the correct `prepare` script for the chosen Husky version and project setup.

Document the common commands in the README or development guide.

## 19.9. Configuration quality and documentation

Keep root configuration files organized and readable.

Use clear names and concise comments where they explain a non-obvious decision.

Do not add comments that merely restate the configuration property.

Prefer a small number of well-maintained configuration files over scattered, duplicated rules.

Document:

- Commit message format.
    
- Allowed commit scopes.
    
- Release branch strategy.
    
- Release version rules.
    
- How to run validation locally.
    
- How to create a release.
    
- Which CI permissions are required.
    
- How mock and production application modes are configured, where relevant.
    

Create or update `docs/development.md` or an equivalent guide.

If the repository has an existing README, update it rather than creating redundant documentation.

## 19.10. Validation and acceptance criteria

After implementing the workflow, verify as much as the current environment allows.

At minimum:

1. Validate the package manifests and lockfile.
    
2. Verify the selected tooling versions are compatible.
    
3. Run Commitlint against valid and invalid example commit messages.
    
4. Confirm the required scope and lowercase-scope rules work.
    
5. Confirm Husky's commit-message hook invokes Commitlint.
    
6. Verify the Turborepo task graph and root scripts.
    
7. Run linting, tests, type checking, and production builds where available.
    
8. Validate the Semantic Release configuration.
    
9. Test representative feature, fix, performance, and breaking-change commit messages against the release rules.
    
10. Verify changelog generation and release plugin compatibility as far as possible without publishing.
    
11. Check that GitHub Actions workflows use appropriate permissions.
    
12. Check that no credentials or secrets are committed.
    
13. Ensure the configuration does not accidentally publish private packages to npm.
    
14. Ensure existing project configuration and source files are preserved where appropriate.
    

Use dry-run release validation where supported and safe.

Do not create a real release, push commits, alter remote branch protection, or publish packages merely to test the configuration unless explicitly authorized.

Distinguish local configuration validation from a real release test requiring GitHub credentials and repository permissions.

## 19.11. Execution instructions

Implement this workflow in the actual repository.

Do not merely return configuration examples or explain what I should do manually.

Inspect first, make deliberate changes, install only the required dependencies, and update the relevant configuration files.

Preserve working project conventions where appropriate.

If a tool is already installed and correctly configured, improve it only where necessary.

If the repository structure makes a proposed tool unnecessary, explain the decision rather than adding complexity.

When finished, report:

1. The repository structure and workflow implemented.
    
2. The commit convention and allowed scopes.
    
3. The Husky hooks and their behavior.
    
4. The Turborepo task configuration.
    
5. The Semantic Release branch and versioning policy.
    
6. The CI workflows and required permissions.
    
7. The commands actually executed and their results.
    
8. Any remaining configuration that requires GitHub or developer action.
    

### Two decisions I making make for your project

- Use one versioning strategy initially. Since I am are developing one POS and inventory product, a single repository release version is easier to maintain than independently releasing the frontend, backend, and shared packages. Revisit independent versioning only if those packages become separately released products.
    
- Keep releases separate from ordinary commits. my feature and fix commits should drive version calculation, while routine documentation and maintenance should not generate unnecessary releases. Preserve breaking-change detection so a significant API change can trigger a major version.
    

One final consideration: Semantic Release's GitHub release process requires appropriate repository permissions and a compatible branch setup. The prompt deliberately tells the coding agent to validate these requirements without publishing a real release during initial setup.

# 20. AI CODING AGENT WORKFLOW — HUMAN REVIEW BEFORE GIT OPERATIONS

## 20.1. Objective

Act as my coding agent and take responsibility for implementing, testing, organizing, and maintaining this project.

You are responsible for managing the development workflow, including:

- Implementing features and fixing bugs.
    
- Writing clean, modular, well-commented code where necessary.
    
- Running tests, linting, type checking, and builds.
    
- Reviewing your own implementation.
    
- Preparing Conventional Commits.
    
- Creating and managing Git branches.
    
- Maintaining commit consistency with Commitlint and Husky.
    
- Following the project's Semantic Release and Turborepo configuration.
    

However, **I must review and explicitly approve the code before every commit and every branch operation.**

I want to understand and inspect the changes before they become part of the repository's Git history.

## 20.2. Mandatory human approval gates

Follow these rules without exception.

### Gate 1: Before creating or switching branches

Before creating, switching, renaming, merging, rebasing, or deleting a branch:

1. Explain the intended operation and why it is necessary.
    
2. Show the current branch and relevant Git status.
    
3. Explain the proposed branch name and naming convention.
    
4. Wait for my explicit approval.
    
5. Perform only the approved operation.
    

Do not create or switch branches automatically, even if you believe the operation is necessary.

Do not delete branches, rewrite Git history, or force-push without separate explicit authorization.

If the current branch is suitable for the task, continue working there unless I approve another branch.

### Gate 2: Before committing code

After implementing a logical unit of work:

1. Review your own changes.
    
2. Run the relevant tests, linting, type checking, and builds.
    
3. Inspect the Git diff and identify unintended changes.
    
4. Summarize what changed and why.
    
5. List the files created, modified, and deleted.
    
6. Explain important implementation decisions and any known limitations.
    
7. Propose a Conventional Commit message using the project's required format.
    
8. Show the relevant diff or make the complete changes accessible for my review.
    
9. Wait for my explicit approval before staging or committing anything.
    

**Do not create a commit until I have reviewed the changes and explicitly approved that commit.**

Do not treat silence, an ambiguous response, or a request for further explanation as approval.

### Gate 3: After review and approval

When I approve the changes:

1. Stage only the files belonging to the approved logical change.
    
2. Check the staged diff to ensure it matches what I reviewed.
    
3. Use the approved Conventional Commit message.
    
4. Run the commit through the configured Husky and Commitlint hooks.
    
5. Report the resulting commit hash and message.
    

If the staged changes differ materially from the reviewed changes, stop and request approval again.

If a hook or validation check fails, explain the failure, fix the issue, and present any resulting code changes for review before attempting the commit again.

Do not bypass hooks using `--no-verify` or equivalent flags unless I explicitly authorize it.

### Gate 4: Branching and integration

Before merging branches, rebasing, cherry-picking, or integrating changes from another branch:

1. Explain the operation and its consequences.
    
2. Identify the source and target branches.
    
3. Show the relevant commits and potential conflicts.
    
4. Wait for my explicit approval.
    
5. Execute only the approved operation.
    

If conflict resolution changes code, show me the resulting changes and obtain approval before committing the resolution.

Do not force-push or rewrite shared history without explicit authorization.

## 20.3. Work in small, reviewable units

Divide the project into logical implementation stages.

For example:

- Repository configuration and tooling.
    
- Application foundation and routing.
    
- Authentication and onboarding.
    
- Dashboard.
    
- Product management.
    
- Inventory management.
    
- Point of Sale.
    
- Sales and purchases.
    
- Reports and settings.
    
- Backend integration.
    

Within each stage, divide work into smaller units that can be understood and reviewed independently.

Do not modify the entire application in one enormous, difficult-to-review change.

Prefer focused changes that have a clear purpose and can be tested independently.

Avoid mixing unrelated formatting, refactoring, configuration, and feature work into the same commit.

Do not create empty commits simply to maintain a commit schedule.

## 20.4. Review interface

After completing each logical unit, stop and present a review summary in this format:

**Implementation:** What was implemented and why.

**Files changed:** Files created, modified, or deleted, with a short explanation.

**Technical decisions:** Important architectural or implementation choices.

**Validation:** Commands executed and their actual results.

**Known issues:** Anything incomplete, untested, or requiring attention.

**Proposed commit:** A Conventional Commit message that complies with the repository configuration.

**Git status:** Current branch and whether the changes are uncommitted, staged, or committed.

Then ask me to review the changes.

Wait for my explicit approval before proceeding with any staging or commit operation.

If I request modifications, make those changes, rerun relevant validation, and present the revised implementation for review.

## 20.5. Approval must be specific

Treat approval as applying only to the changes and operation I have reviewed.

For example:

- "Approved, commit it" authorizes the reviewed changes to be committed.
    
- "Approved, create the branch" authorizes the specifically proposed branch operation.
    
- "Change the validation logic" requests further implementation and is not commit approval.
    
- "Looks good, but explain the store first" is not commit approval.
    

Do not interpret approval for one operation as permission to perform another.

Approval to commit does not authorize pushing, merging, releasing, or deleting branches.

Approval to create a branch does not authorize committing code.

## 20.6. Git safety and release automation

Manage Git operations carefully.

- Inspect `git status` before making changes.
    
- Preserve unrelated user changes.
    
- Never discard uncommitted work without explicit permission.
    
- Never amend an existing commit without explicit permission.
    
- Never rewrite history without explicit permission.
    
- Never force-push without explicit permission.
    
- Never push code to a remote without explicit permission.
    
- Never merge or delete branches without explicit permission.
    
- Never publish a release without explicit permission.
    

Semantic Release may be configured for automated releases, but do not trigger a real release during development setup or feature implementation unless I explicitly authorize it.

If CI automatically creates releases after a push or merge, explain that behavior before requesting permission for the operation that would trigger it.

Do not bypass the review gates because a task is small, a command is automated, or a tool suggests proceeding.

## 20.7. Definition of completion

A logical implementation unit is ready for my review when:

- Its code is implemented.
    
- Its architecture follows the project conventions.
    
- Relevant validation has been executed.
    
- Its changes have been inspected.
    
- Its limitations are documented.
    
- A suitable commit message has been proposed.
    

It is not considered committed until I approve and the commit succeeds.

It is not considered integrated until I approve and the integration operation succeeds.

**Your role is to execute the engineering work efficiently. My role is to review and authorize changes to Git history and branch structure. Never skip that separation of responsibilities.**

# 21. TEST-DRIVEN QUALITY ASSURANCE — MANDATORY TESTING

## 21.1. Core principle

Writing tests is a mandatory part of implementing every feature, fixing every bug, and refactoring existing code.

Do not treat tests as optional, postpone them until the end, or merely create test files without meaningful assertions.

**Every meaningful implementation must include appropriate automated tests before it is presented for my review and approval.**

You are responsible for writing, maintaining, running, and fixing tests throughout development.

Do not claim that code works simply because it compiles or the page renders.

## 21.2. Testing strategy

Inspect the existing project and select appropriate testing tools for its actual stack.

For a React, TypeScript, and Node.js application, consider:

- **Vitest** for unit and integration testing.
    
- **React Testing Library** for testing React components through user interactions.
    
- **MSW (Mock Service Worker)** for mocking HTTP requests at the network boundary.
    
- **Supertest** for testing backend HTTP endpoints.
    
- **Playwright** for end-to-end browser testing where practical.
    

Do not install every tool blindly. Select and configure the tools that fit the applications and their testing needs.

Keep tests close to the relevant feature or in a dedicated, consistently organized test directory.

Use clear test names that describe expected behavior.

## 21.3. Required test categories

### A. Unit tests

Test individual functions and business rules in isolation.

Examples:

- Currency formatting and calculations.
    
- Cart subtotal and total calculations.
    
- Discount calculations and validation.
    
- Cash received and change calculations.
    
- Stock quantity validation.
    
- Low-stock status calculations.
    
- Input validation schemas.
    
- API error normalization.
    
- Permission-checking utilities.
    
- Date and reporting utilities.
    

Test normal cases, boundary conditions, and invalid inputs.

### B. Component tests

Test components through observable behavior rather than implementation details.

Examples:

- Login and registration forms.
    
- Email verification forms.
    
- Product creation and editing forms.
    
- Search and filter controls.
    
- Inventory tables.
    
- POS cart interactions.
    
- Checkout confirmation dialogs.
    
- Loading, error, empty, and success states.
    
- Responsive navigation and accessible controls.
    

Verify that users can interact with the interface correctly and receive appropriate feedback.

### C. Zustand store tests

Test each feature store independently.

Examples:

- Authentication state transitions.
    
- Successful and failed login.
    
- Product loading, creation, and updating.
    
- Inventory adjustment workflows.
    
- POS cart additions, quantity changes, and item removal.
    
- Cart clearing after successful checkout.
    
- Preserving cart contents when checkout fails.
    
- Loading and error state cleanup.
    
- Preventing stale search results from overwriting newer results.
    

Mock the relevant API service boundary rather than mocking Zustand's internal implementation.

Reset store state between tests to prevent test contamination.

### D. API service tests

Test feature API services and their interactions with Axios.

Verify:

- Correct HTTP methods and endpoint paths.
    
- Query parameters and request payloads.
    
- Successful response handling.
    
- Error normalization.
    
- Authentication headers or cookies where applicable.
    
- Request cancellation where implemented.
    
- Authentication refresh behavior where applicable.
    
- Correct handling of validation and authorization errors.
    

Use controlled HTTP mocks rather than relying on a live backend for ordinary automated tests.

### E. Backend integration tests

When the backend is implemented, test actual HTTP endpoints and business workflows against a controlled test environment.

Verify:

- Request validation.
    
- Authentication and authorization.
    
- Business and user isolation.
    
- Product creation and updates.
    
- Inventory movements and adjustments.
    
- Purchase receiving.
    
- Checkout and payment records.
    
- Sales history.
    
- Refunds and voids.
    
- Pagination, filtering, and error responses.
    

Use a dedicated test database or isolated test environment. Never run destructive tests against production data.

### F. End-to-end tests

Add end-to-end tests for the most important user journeys when the application is sufficiently implemented.

Prioritize:

1. Registration, email verification, and login.
    
2. Initial business onboarding.
    
3. Creating a product.
    
4. Viewing and adjusting inventory.
    
5. Completing a POS sale.
    
6. Confirming that stock changes after a successful sale.
    
7. Viewing the resulting sale and receipt.
    
8. Handling an unsuccessful checkout without corrupting the cart or inventory.
    

Use deterministic test data and isolate external services such as email delivery and payment providers.

Do not introduce brittle tests that depend on arbitrary delays or live third-party services.

## 21.4. Critical POS and inventory invariants

These workflows are business-critical and require especially careful testing.

### Point of Sale

- A product cannot be checked out with an invalid quantity.
    
- The server recalculates prices and totals.
    
- Discounts are validated against business rules.
    
- Payment totals and outstanding balances are calculated correctly.
    
- Repeated checkout requests with the same idempotency key do not create duplicate sales.
    
- Failed checkout does not incorrectly clear the cart.
    
- A successful checkout clears or finalizes the cart according to the intended workflow.
    
- Cash change is calculated correctly.
    
- Concurrent checkout requests cannot silently oversell stock when stock limits are enforced.
    

### Inventory

- Stock adjustments create auditable movement records.
    
- Receiving a purchase updates inventory only after successful receiving.
    
- Creating a purchase order alone does not increase stock.
    
- Voids and refunds apply inventory changes only according to the defined business rules.
    
- Archived products retain necessary historical references.
    
- Failed transactions do not leave partially updated inventory.
    
- Business users cannot access another business's inventory.
    
- Low-stock and expiry alerts follow the configured thresholds and dates.
    

Test server-enforced rules on the backend. Frontend tests alone are not sufficient to prove data integrity or security.

## 21.5. Test scripts and repository integration

Integrate testing into the root package scripts and the appropriate workspace packages.

Provide predictable commands such as:

- `npm run test` — run the relevant automated test suites.
    
- `npm run test:watch` — watch tests during development, where supported.
    
- `npm run test:coverage` — run tests with coverage reporting.
    
- `npm run lint` — lint the codebase.
    
- `npm run typecheck` — validate TypeScript types.
    
- `npm run build` — build the relevant applications and packages.
    

Adapt these commands to the actual package manager and workspace structure.

Ensure Turborepo orchestrates test tasks correctly and caches results only when safe.

Do not define scripts that reference nonexistent tasks.

## 21.6. Coverage and quality expectations

Configure coverage reporting for meaningful application logic.

Pay particular attention to:

- Financial calculations.
    
- POS checkout logic.
    
- Inventory consistency rules.
    
- Authentication and authorization.
    
- Validation utilities.
    
- Error handling.
    
- Business-critical Zustand actions.
    

Use coverage reports to identify untested code, not as a substitute for evaluating test quality.

Do not inflate coverage with meaningless assertions or trivial tests.

Do not impose an arbitrary high global coverage percentage if it encourages low-value tests. Set sensible initial thresholds for critical modules and improve coverage as the application grows.

## 21.7. Bug fixes and regression testing

Whenever you fix a bug:

1. Identify the cause.
    
2. Write a regression test that reproduces the bug when practical.
    
3. Implement the fix.
    
4. Confirm the regression test passes.
    
5. Run related tests to detect unintended effects.
    

Do not remove or weaken an existing test merely to make a failing build pass.

If an existing test is incorrect because requirements changed, update it deliberately and explain why.

## 21.8. Testing before human review and Git operations

Testing must integrate with the human approval workflow defined in Section 20.

Before presenting a logical implementation unit for review:

1. Review the implementation yourself.
    
2. Write or update the relevant tests.
    
3. Run the relevant test suites.
    
4. Run linting and type checking.
    
5. Run the build when appropriate.
    
6. Report actual results and any failures.
    
7. Present the code changes and proposed commit message.
    

**Never commit code without my explicit approval, even if all tests pass.**

Passing tests do not replace my review.

If a test fails, investigate and resolve the issue before requesting approval, unless the failure is caused by a documented external limitation. Clearly identify any remaining failures.

Never report tests as passing if they were not executed.

Do not hide skipped tests, disabled assertions, or known failures.

If you cannot run a test because a database, service, browser, or credential is unavailable, explain the limitation and provide the exact command needed to run it later.

## 21.9. Continuous integration

Integrate the appropriate test suites into GitHub Actions alongside linting, type checking, and builds.

Require relevant checks to pass before changes are considered ready for integration.

Ensure CI uses a reproducible dependency installation and a safe test environment.

Keep tests independent of production credentials and production data.

Do not trigger production releases simply because tests pass.

## 21.10. Completion criteria

A feature is not considered complete merely because its implementation exists.

It must have:

- Appropriate automated tests.
    
- Verified business logic.
    
- Error and edge-case handling.
    
- Successful relevant validation.
    
- Documented limitations where necessary.
    
- A reviewable set of changes.
    
- A proposed Conventional Commit message.
    

Implement the tests in the actual codebase. Do not merely describe the tests that should be written.

Prioritize correctness, maintainability, and meaningful coverage over writing a large number of superficial tests.