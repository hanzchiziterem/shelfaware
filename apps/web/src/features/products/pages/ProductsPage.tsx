import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useProductStore } from '../../../store/productStore';
import { useAuthStore } from '../../../store/authStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductDetailDrawer } from '../components/ProductDetailDrawer';
import { formatNaira } from '../../../utils/currency';
import { hasPermission } from '../../../config/permissions';
import { Product } from '../../../types/domain';

export const ProductsPage: React.FC = () => {
  const {
    products,
    categories,
    isLoading,
    filters,
    setFilters,
    fetchProducts,
    fetchCategories,
    toggleStatus,
  } = useProductStore();

  const { user } = useAuthStore();
  const canViewCost = hasPermission(user?.role, 'products:view_cost');
  const canCreate = hasPermission(user?.role, 'products:create');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Client-side pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products Catalog"
        description="Manage foodstuff products, packaging units, retail prices, and inventory stock."
        actions={
          canCreate && (
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          )
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-[var(--radius-card)] border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters({ search: val })}
          placeholder="Filter by product name, SKU or barcode..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filters.categoryId || 'all'}
            onChange={(e) => setFilters({ categoryId: e.target.value })}
            className="w-40"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={filters.stockStatus || 'all'}
            onChange={(e) => setFilters({ stockStatus: e.target.value })}
            className="w-36"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading && products.length === 0 ? (
        <LoadingState message="Loading retail products..." />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU / Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Selling Price</TableHead>
                {canViewCost && <TableHead>Cost Price</TableHead>}
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((p) => {
                const isOut = p.currentStock <= 0;
                const isLow = p.currentStock > 0 && p.currentStock <= p.minStockThreshold;

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-slate-900 max-w-[200px] truncate">
                      {p.name}
                    </TableCell>
                    <TableCell className="font-mono text-slate-500">
                      {p.sku}
                    </TableCell>
                    <TableCell>{p.categoryName}</TableCell>
                    <TableCell className="capitalize">{p.unit}</TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatNaira(p.sellingPrice)}
                    </TableCell>
                    {canViewCost && (
                      <TableCell className="text-slate-600">
                        {formatNaira(p.costPrice)}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="font-bold text-slate-900">{p.currentStock}</span>{' '}
                      <span className="text-[11px] text-slate-400">/ min {p.minStockThreshold}</span>
                    </TableCell>
                    <TableCell>
                      {isOut ? (
                        <Badge variant="danger" size="sm">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="warning" size="sm">Low Stock</Badge>
                      ) : (
                        <Badge variant="success" size="sm">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenDetail(p)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canViewCost ? 9 : 8} className="py-8 text-center text-slate-400">
                    No products found matching filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={products.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals & Drawers */}
      <ProductFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
};
